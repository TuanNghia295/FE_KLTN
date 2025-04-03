import { Button } from '@mui/material';
import Blog1 from '../../assets/blog/blog1.jpg';
import { IoMdTime } from 'react-icons/io';
import { Link } from 'react-router-dom';

export default function BlogItem({ url, alt }) {
  return (
    <Link to={`/${alt}`} className="w-full">
      <div className="blogItem group">
        <div className="imgWrapper overflow-hidden relative">
          <img
            src={url}
            alt="blog image"
            className="w-full transition-all group-hover:scale-105 group-hover:rotate-1 cursor-pointer"
          />
          <span className="flex items-center justify-center text-white font-bold text-[16px] absolute bottom-[40px] left-[40px] z-10 gap-1">
            <Button className="border !px-2 !bg-white !text-black !rounded-full">{alt}</Button>
          </span>
        </div>
      </div>
    </Link>
  );
}
