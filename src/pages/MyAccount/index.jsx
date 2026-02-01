import { Button } from '@mui/material';
import { useMemo, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import AccountSlidebar from '../../components/AccountSlidebar';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useStore from '../../store/useStore';
import { useGetUserInfo, useUpdateUser } from '../../services/userServices';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import Page404 from '../Page404/index';
import { toast } from 'react-toastify';

const MyAccount = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    // Fetch bank data from API
    const fetchBanks = async () => {
      try {
        const response = await axios.get('https://api.vietqr.io/v2/banks');
        setBanks(response.data.data);
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };

    fetchBanks();
  }, []);

  // Sử dụng selector để chỉ lấy các trạng thái cần thiết
  const { data: userInfo } = useGetUserInfo();
  const getInfo = useStore((state) => state.getInfo);
  const { mutate: updateUserInfo } = useUpdateUser(); // Sử dụng hook để cập nhật thông tin người dùng

  // Memo hóa initialValues để tránh vòng lặp render
  const initialValues = useMemo(
    () => ({
      full_name: userInfo?.full_name || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      address: userInfo?.address || [], // Mảng địa chỉ
      bankInfo: {
        bankName: userInfo?.bankInfo?.bankName || '',
        accountNumber: userInfo?.bankInfo?.accountNumber || '',
        accountHolderName: userInfo?.bankInfo?.accountHolderName || '',
      },
      password: '',
      current_password: '',
    }),
    [userInfo]
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // Cho phép formik cập nhật giá trị khi initialValues thay đổi
    validationSchema: Yup.object({
      full_name: Yup.string().required('Full Name is required'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      phone: Yup.string(),
      address: Yup.array().of(Yup.string()),
      bankInfo: Yup.object({
        bankName: Yup.string(),
        accountNumber: Yup.string(),
        accountHolderName: Yup.string(),
      }).test('bankInfo', 'All bank info fields are required if one is provided', (value) => {
        const { bankName, accountNumber, accountHolderName } = value;
        if (bankName || accountNumber || accountHolderName) {
          return bankName && accountNumber && accountHolderName;
        }
        return true;
      }),
      password: Yup.string(),
      current_password: Yup.string().when('password', {
        is: (value) => Boolean(value),
        then: (schema) => schema.required('Current password is required'),
        otherwise: (schema) => schema,
      }),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        current_password: values.current_password,
      };

      const originalPayload = {
        full_name: userInfo?.full_name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
      };

      if (!values.password) {
        delete payload.password;
        delete payload.current_password;
      }

      const hasChanges = values.password
        ? true
        : Object.keys(originalPayload).some((key) => payload[key] !== originalPayload[key]);

      if (!hasChanges) {
        toast.warning('No changes to save', { position: 'top-center', autoClose: 3000 });
        return;
      }

      updateUserInfo(payload, {
        onSuccess: (response) => {
          getInfo(response); // Cập nhật Zustand state với dữ liệu từ API
          resetForm({
            values: {
              ...values,
              password: '',
              current_password: '',
            },
          });
        },
      });
    },
  });

  // Lấy object ngân hàng ban đầu nếu có
  const initialBank = useMemo(() => {
    return userInfo?.bankInfo?.bankName ? banks.find((b) => b.name === userInfo.bankInfo.bankName) || null : null;
  }, [banks, userInfo]);

  // Nếu userInfo chưa có, hiển thị loading trong JSX
  if (!userInfo) {
    return (
      <section className="py-10 w-full">
        <div className="container flex flex-col xl:flex-row gap-5">
          <div className="col1 w-full xl:w-[20%]">
            <AccountSlidebar />
          </div>
          <div className="col2 w-full xl:w-[80%]">
            <Page404 />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 w-full">
      <div className="container flex flex-col gap-5 xl:flex-row xl:gap-5">
        <div className="col1 w-full xl:w-[20%]">
          <AccountSlidebar />
        </div>

        <div className="col2 w-full xl:w-[80%]">
          <div className="card bg-white p-5 rounded-md shadow-md">
            <h1 className="font-[600] bg-[#f1f1f1] p-3 mb-4 rounded-md text-center text-black text-lg md:text-xl">
              My Profile
            </h1>
            <form className="mt-5" onSubmit={formik.handleSubmit}>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full md:w-[50%]">
                  <TextField
                    className="w-full"
                    id="full_name"
                    name="full_name"
                    label="Full Name"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.full_name}
                    error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                    helperText={formik.touched.full_name && formik.errors.full_name}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full md:w-[50%]">
                  <TextField
                    className="w-full"
                    id="email"
                    name="email"
                    label="Email"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </div>
                <div className="w-full md:w-[50%]">
                  <TextField
                    className="w-full"
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.phone}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full">
                  <TextField
                    className="w-full"
                    id="address"
                    name="address"
                    label="Address (Enter new address to add)"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={(e) => formik.setFieldValue('address', [e.target.value])}
                    value={formik.values.address[0] || ''}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    disabled
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full md:w-[50%]">
                  <Autocomplete
                    options={banks}
                    getOptionLabel={(option) => `${option.shortName} - ${option.name}`}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id} className="flex items-center gap-3">
                        <img src={option.logo} alt={option.name} style={{ width: 40, height: 40 }} />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Bank (Short Name or Full Name)"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    value={selectedBank}
                    onChange={(event, newValue) => {
                      setSelectedBank(newValue);
                      formik.setFieldValue('bankInfo.bankName', newValue ? newValue.name : '');
                      if (!newValue) {
                        formik.setFieldValue('bankInfo.accountNumber', '');
                        formik.setFieldValue('bankInfo.accountHolderName', '');
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue === '') {
                        setSelectedBank(null);
                        formik.setFieldValue('bankInfo.bankName', '');
                        formik.setFieldValue('bankInfo.accountNumber', '');
                        formik.setFieldValue('bankInfo.accountHolderName', '');
                      }
                    }}
                    filterOptions={(options, { inputValue }) =>
                      options.filter(
                        (option) =>
                          option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.shortName.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.code.toLowerCase().includes(inputValue.toLowerCase())
                      )
                    }
                  />
                </div>
                <div className="w-full md:w-[50%]">
                  <TextField
                    className="w-full"
                    id="accountNumber"
                    name="bankInfo.accountNumber"
                    label="Bank Account Number"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.bankInfo.accountNumber}
                    error={formik.touched.bankInfo?.accountNumber && Boolean(formik.errors.bankInfo?.accountNumber)}
                    helperText={formik.touched.bankInfo?.accountNumber && formik.errors.bankInfo?.accountNumber}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full">
                  <TextField
                    className="w-full"
                    id="accountHolderName"
                    name="bankInfo.accountHolderName"
                    label="Account Holder Name"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.bankInfo.accountHolderName}
                    error={
                      formik.touched.bankInfo?.accountHolderName && Boolean(formik.errors.bankInfo?.accountHolderName)
                    }
                    helperText={formik.touched.bankInfo?.accountHolderName && formik.errors.bankInfo?.accountHolderName}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full">
                  <TextField
                    className="w-full"
                    id="current_password"
                    name="current_password"
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.current_password}
                    error={formik.touched.current_password && Boolean(formik.errors.current_password)}
                    helperText={formik.touched.current_password && formik.errors.current_password}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full">
                  <TextField
                    className="w-full"
                    id="password"
                    name="password"
                    label="New Password"
                    type="password"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-5 my-4">
                <div className="w-full">
                  <Button type="submit" className="w-full !bg-black !text-white !p-3">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
