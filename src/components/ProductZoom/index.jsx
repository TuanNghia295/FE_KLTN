import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';

const ProductZoom = ({ img }) => {
  return (
    <>
      <div className="whitespace-nowrap xl:flex xl:flex-col gap-4 w-full">
        {/* <InnerImageZoom
          zoomType="hover"
          zoomScales={10}
          src={img}
          className="min-w-full min-h-full max-w-full max-h-screen object-contain"
        /> */}
        <img
          src={img}
          className="min-w-full min-h-full max-w-full max-h-screen object-contain"
        />
      </div>
    </>
  );
};

export default ProductZoom;
