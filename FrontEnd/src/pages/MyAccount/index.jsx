import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import AccountSlidebar from '../../components/AccountSlidebar';
//Call API Update User
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useStoreProvider } from '../../contexts/StoreProvider';
import { useUpdateUser } from '../../services/userServices';

const MyAccount = () => {
  // const { userInfo } = useStoreProvider();

  // if (!userInfo) {
  //   return <div>Loading...</div>; // Hoặc một trạng thái loading khác
  // }

  // const { mutate } = useUpdateUser();

  // const formik = useFormik({
  //   initialValues: {
  //     fullName: userInfo.fullName,
  //     email: userInfo.email,
  //     phone: userInfo.phone,
  //   },
  //   validationSchema: Yup.object({
  //     fullName: Yup.string().required('Phone is required'),
  //     email: Yup.string().required('Password is required'),
  //   }),
  //   onSubmit: (values) => {
  //     mutate(values);
  //     const response = mutate(values)

  //     if ( response ) {
  //         const updatedUserInfo = response.data;

  //         // Cập nhật lại dữ liệu trong form
  //         formik.setValues({
  //             fullName: updatedUserInfo.fullName,
  //             email: updatedUserInfo.email,
  //             phone: updatedUserInfo.phone,
  //         });
  //     }
  // },
  // });

  return (
    <section className="py-10 w-full">
      <div className="container flex flex-col xl:flex-row gap-5">
        <div className="col1 w-full xl:w-[20%]">
          <AccountSlidebar />
        </div>

        <div className="col2 w-full xl:w-[80%]">
          <div className="card bg-white p-5 rounded-md">
            <h1 className="text-[22px] font-[600]">My Profile</h1>
            {/* <form className="mt-5" onSubmit={formik.handleSubmit}>
              <div className="flex items-center gap-5 my-4">
                <div className="w-[50%]">
                  <TextField
                    className="w-full"
                    id="fullName"
                    label="Full Name"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.fullName}
                  />
                </div>
                <div className="w-[50%]">
                  <TextField
                    className="w-full"
                    id="email"
                    label="Email"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.email}
                  />
                </div>
              </div>
              <div className="flex items-center gap-5 my-4">
                <div className="w-[100%]">
                  <TextField
                    className="w-full"
                    id="phone"
                    label="Phone Number"
                    variant="outlined"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.phone}
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
            </form> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
