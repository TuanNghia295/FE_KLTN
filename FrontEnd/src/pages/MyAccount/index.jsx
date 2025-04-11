import { Button } from '@mui/material';
import React, { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import AccountSlidebar from '../../components/AccountSlidebar';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useStore from '../../store/useStore';
import { useUpdateUser } from '../../services/userServices';

import Page404 from '../Page404/index'

const MyAccount = () => {
  // Sử dụng selector để chỉ lấy các trạng thái cần thiết
  const userInfo = useStore((state) => state.userInfo);
  const getInfo = useStore((state) => state.getInfo);
  const { mutate: upadateUserInfo, isPending } = useUpdateUser(); // Sử dụng hook để cập nhật thông tin người dùng
  // Memo hóa initialValues để tránh vòng lặp render
  const initialValues = useMemo(
    () => ({
      fullName: userInfo?.fullName || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
    }),
    [userInfo]
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // Cho phép formik cập nhật giá trị khi initialValues thay đổi
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full Name is required'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      phone: Yup.string().required('Phone Number is required'),
    }),
    onSubmit: (values) => {
      upadateUserInfo(values);
      getInfo({ ...userInfo, ...values }); // Cập nhật thông tin người dùng trong Zustand
    },
  });

  // Nếu userInfo chưa có, hiển thị loading trong JSX thay vì return sớm
  if (!userInfo) {
    return (
      <section className="py-10 w-full">
        <div className="container flex flex-col xl:flex-row gap-5">
          <div className="col1 w-full xl:w-[20%]">
            <AccountSlidebar />
          </div>
          <div className="col2 w-full xl:w-[80%]">
            <div className="card bg-white p-5 rounded-md">
              <Page404 />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 w-full">
      <div className="container flex flex-col xl:flex-row gap-5">
        <div className="col1 w-full xl:w-[20%]">
          <AccountSlidebar />
        </div>

        <div className="col2 w-full xl:w-[80%]">
          <div className="card bg-white p-5 rounded-md">
            <h1 className="font-[600] bg-[#f1f1f1] p-3 mb-4 rounded-md text-center text-black">My Profile</h1>
            <form className="mt-5" onSubmit={formik.handleSubmit}>
              <div className="flex items-center gap-5 my-4">
                <div className="w-[50%]">
                  <TextField
                    className="w-full"
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.fullName}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName}
                  />
                </div>
                <div className="w-[50%]">
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
              </div>
              <div className="flex items-center gap-5 my-4">
                <div className="w-[100%]">
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
              <div className="flex items-center gap-5 my-4">
                <div className="w-[100%]">
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
