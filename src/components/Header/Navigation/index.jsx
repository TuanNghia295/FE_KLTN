import { Button } from '@mui/material';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { FaCaretDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { MdDiscount } from 'react-icons/md';
import CategoryPannel from './CategoryPannel';
import { useState } from 'react';
import '../Navigation/style.css';
import useStore from '../../../store/useStore';
import { normalizeString } from '../../../hook/normalizeString';

const Navigation = () => {
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const toogleCategory = () => setIsOpenCategory(!isOpenCategory);
  // Lấy list Category tu Zustand
  const categoryListZustand = useStore((state) => state.categoryListZustand);
  const params = normalizeString(categoryListZustand[3]?.type);
  const navigate = useNavigate();
  return (
    <>
      <nav>
        <div className="container flex items-center justify-center gap-8">
          <div className="col_1 hidden xl:block xl:w-[16%]">
            <Button
              className="!text-white gap-2 !bg-black w-full cursor-pointer hover:!bg-gray1"
              onClick={toogleCategory}
            >
              <HiOutlineMenuAlt2 className="text-[18px]" /> Shop by categories
            </Button>
          </div>

          {/* Điều hướng chính */}
          <div className="col_2 w-[65%]">
            <ul className="flex items-center justify-center gap nav">
              <li className="list-none">
                <Link to={'/'} className="link transition text-[16px] font-[500]">
                  <Button className="link transition font-[500] hover:!text-primary !py-4">Home</Button>
                </Link>
              </li>

              <li className="list-none relative">
                <Link to={'/listing'} className="link transition text-[16px] font-[500]">
                  <Button className="link transition font-[500] hover:!text-primary !py-4">Fashion</Button>
                </Link>

                <div
                  className="submenu absolute top-[120%] left-[0] min-w-[150px] bg-white shadow-md 
                opacity-0  transition-all duration-300"
                >
                  {/* List category */}
                  <ul>
                    {Array.isArray(categoryListZustand) &&
                      categoryListZustand.length > 0 &&
                      categoryListZustand
                        .filter((category) => category.type !== 'Sale')
                        .map((category, index) => (
                          <li key={index} className="list-none w-full">
                            <Link to={`/listing/${normalizeString(category?.type)}`}>
                              <Button className="!text-textPrimary w-full !justify-start !rounded-none">
                                {category?.name}
                              </Button>
                            </Link>
                          </li>
                        ))}
                  </ul>

                  {/* <ul>
                    <li className="list-none w-full relative">
                      <Link to={'/listing/nam'}>
                        <Button className="!text-textPrimary w-full !justify-start !rounded-none">Men</Button>
                      </Link> */}

                  {/* inner menu */}
                  {/* <div
                        className="submenu absolute top-[0%] left-[100%] min-w-[150px] bg-white shadow-md 
                opacity-0  transition-all duration-300"
                      >
                        <ul>
                          <li className="list-none w-full">
                            <Link to={'/listing/men/t-shirt'}>
                              <Button className="!text-textPrimary w-full !justify-start !rounded-none">T-Shirt</Button>
                            </Link>
                          </li>

                          <li className="list-none w-full">
                            <Link to={'/listing/men/jeans'}>
                              <Button className="!text-textPrimary w-full !justify-start !rounded-none">Jeans</Button>
                            </Link>
                          </li>

                          <li className="list-none w-full">
                            <Link to={'/listing/men/footwear'}>
                              <Button className="!text-textPrimary w-full !justify-start !rounded-none">
                                Footwear
                              </Button>
                            </Link>
                          </li>

                          <li className="list-none w-full">
                            <Link to={'/listing/men/watch'}>
                              <Button className="!text-textPrimary w-full !justify-start !rounded-none">Watch</Button>
                            </Link>
                          </li>
                        </ul>
                      </div> */}
                  {/* </li>

                    <li className="list-none w-full">
                      <Link to={'/listing/nu'}>
                        <Button className="!text-textPrimary w-full !justify-start !rounded-none">Women</Button>
                      </Link>
                    </li>

                    <li className="list-none w-full">
                      <Link to={'/listing/tre-em'}>
                        <Button className="!text-textPrimary w-full !justify-start !rounded-none">Kids</Button>
                      </Link>
                    </li>

                    <li className="list-none w-full">
                      <Link to={'/listing/other'}>
                        <Button className="!text-textPrimary w-full !justify-start !rounded-none">Other</Button>
                      </Link>
                    </li>
                  </ul> */}
                </div>
              </li>

              {/* <li className="list-none">
                <Link to={'/listing/footwear'} className="link transition text-[16px] font-[500]">
                  <Button className="link transition font-[500] hover:!text-primary !py-4">Footwear</Button>
                </Link>
              </li>

              <li className="list-none">
                <Link to={'/listing/jewellery'} className="link transition text-[16px] font-[500]">
                  <Button className="link transition font-[500] hover:!text-primary !py-4">Jewellery</Button>
                </Link>
              </li> */}

              <li className="list-none">
                <Link to={'/listing/sale'} className="link transition text-[16px] font-[500]">
                  <Button className="link transition font-[500] hover:!text-primary !py-4">Sale</Button>
                </Link>
              </li>
            </ul>
          </div>

          <div className="col_3 hidden xl:block xl:w-[15%] flex items-center justify-end gap-2 ">
            <Button color="error" variant="text" onClick={() => navigate('/my-orders')}>
              <MdDiscount />
              &nbsp;
              <p className="text-[14px] font-[500] text-primary">Order Tracking</p>
            </Button>
          </div>
        </div>
      </nav>

      <CategoryPannel
        categoryListZustand={categoryListZustand}
        isOpenCategory={isOpenCategory}
        toogleCategory={toogleCategory}
      />
    </>
  );
};

export default Navigation;
