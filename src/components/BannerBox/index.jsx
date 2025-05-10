import React from 'react';
import { Link } from 'react-router-dom';

const BannerBox = (props) => {
  return (
    <div className="box bannerBox overflow-hidden rounded-md group">
      <Link to={props.link}>
        <img src={props.img} className="w-full transition-all group-hover:scale-105" alt="" />
      </Link>
    </div>
  );
};

export default BannerBox;
