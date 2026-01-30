import AxiosClient from '../apis/axiosClient';

interface DirectUploadResponse {
  direct_upload: {
    url: string;
    headers: Record<string, string>;
  };
  blob_signed_id: string;
}

interface BlobParams {
  filename: string;
  byte_size: number;
  checksum: string;
  content_type: string;
}

import SparkMD5 from 'spark-md5';
/**
 * Calculate MD5 checksum for file
 * Used for Active Storage direct upload
 */
export const calculateChecksum = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const spark = new SparkMD5.ArrayBuffer();
        spark.append(arrayBuffer);
        const rawHash = spark.end(true); // Get raw binary hash
        const base64 = btoa(rawHash); // Base64 encode raw binary hash
        resolve(base64);
      } else {
        reject(new Error('Failed to read file for checksum calculation.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file for checksum calculation.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Active Storage API Service
 * Handles direct uploads to S3 via Rails Active Storage
 */
export const activeStorageService = {
  /**
   * Step 1: Request presigned URL from Rails backend ( quyền upload trực tiếp lên S3 từ BackEnd)
   */
  requestDirectUpload: async (blobParams: BlobParams): Promise<DirectUploadResponse> => {
    console.log('Requesting direct upload with params:', blobParams);
    const response = await AxiosClient.post<DirectUploadResponse>('/direct_uploads', {
      blob: blobParams,
    });
    console.log('Direct upload response:', response);
    return response;
  },

  /**
   * Step 2: Upload file directly to S3 with retry logic
   */
  uploadToS3: async (file: File, url: string, headers: Record<string, string>, maxRetries = 3): Promise<void> => {
    console.log('Uploading to S3:', { url, headers, fileSize: file.size });

    // Remove any undefined or null headers and add Content-Length
    const cleanHeaders: Record<string, string> = {
      ...headers,
      'Content-Length': String(file.size),
    };

    // Remove undefined/null values
    Object.entries(cleanHeaders).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        delete cleanHeaders[key];
      }
    });

    console.log('Clean headers for S3:', cleanHeaders);

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

        const response = await fetch(url, {
          method: 'PUT',
          headers: cleanHeaders,
          body: file,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('S3 upload error:', {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          throw new Error(`S3 upload failed: ${response.statusText}`);
        }

        console.log('✓ Upload successful!');
        return; // Success!
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Upload attempt ${attempt} failed:`, lastError.message);

        // Don't retry on abort (timeout)
        if (lastError.name === 'AbortError') {
          throw new Error('Upload timeout. Please check your internet connection and try again.');
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message}`);
  },

  /**
   * Complete flow: Calculate checksum, get presigned URL, upload to S3
   * Returns blob_signed_id to attach to model
   */
  uploadFile: async (file: File): Promise<string> => {
    // Step 1: Calculate checksum
    const checksum = await calculateChecksum(file);

    // Step 2: Request direct upload URL
    const blobParams: BlobParams = {
      filename: file.name,
      byte_size: file.size,
      checksum: checksum,
      content_type: file.type,
    };

    const uploadData = await activeStorageService.requestDirectUpload(blobParams);

    // Step 3: Upload to S3
    await activeStorageService.uploadToS3(file, uploadData.direct_upload.url, uploadData.direct_upload.headers);

    // Step 4: Return blob_signed_id for attaching to model
    return uploadData.blob_signed_id;
  },

  /**
   * Validate file before upload
   */
  validateFile: (
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png'],
    } = options;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / 1024 / 1024}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  },
};
