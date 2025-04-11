import AccountSlidebar from '../../components/AccountSlidebar';
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Page404 from '../Page404/index'
// Zustand
import useStore from '../../store/useStore';
import ChooseProvinces from '../../components/ChooseProvinces';
import { useUpdateUser } from '../../services/userServices';

const MyAddress = () => {
    //Lấy userInfo từ Zustand
    const userInfo = useStore((state) => state.userInfo);
    const getInfo = useStore((state) => state.getInfo);
    const { mutate: updateUserInfo, isPending } = useUpdateUser(); // Sử dụng hook để cập nhật thông tin người dùng

    //Lấy mảng address User
    const addressArray = userInfo?.address

    // Quản lý trạng thái chỉnh sửa địa chỉ
    const [editAddressIndex, setEditAddressIndex] = React.useState(null);
    const handleDeleteAddress = (index) => {
        const updatedAddressList = [...(userInfo?.address || [])];
        updatedAddressList.splice(index, 1); // Xóa địa chỉ ở vị trí index

        updateUserInfo({ address: updatedAddressList }); // Cập nhật lên server
        getInfo({ ...userInfo, address: updatedAddressList }); // Cập nhật Zustand
    };
    const handleSetDefault = (index) => {
        if (index === 0) return; // Đã là mặc định rồi

        const updatedAddressList = [...addressArray];
        const [selectedAddress] = updatedAddressList.splice(index, 1); // Xoá địa chỉ tại index
        updatedAddressList.unshift(selectedAddress); // Thêm lên đầu danh sách

        updateUserInfo({ address: updatedAddressList });
        getInfo({ ...userInfo, address: updatedAddressList });
    };


    //Modal Address
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    if (!userInfo) {
        return (
            <>
                <section className='py-10 w-full'>
                    <div className='container flex flex-col xl:flex-row gap-5'>
                        <div className='col1 w-full xl:w-[20%]'>
                            <AccountSlidebar />
                        </div>

                        <div className='col2 w-full xl:w-[80%]'>
                            <Page404 />
                        </div>
                    </div>
                </section>
            </>
        )
    }
    return (
        <>
            <section className='py-10 w-full'>
                <div className='container flex flex-col xl:flex-row gap-5'>
                    <div className='col1 w-full xl:w-[20%]'>
                        <AccountSlidebar />
                    </div>

                    <div className='col2 w-full xl:w-[80%]'>
                        <div className='card bg-white p-5 rounded-md'>
                            <h1 className="font-[600] bg-[#f1f1f1] p-3 mb-4 rounded-md text-center text-black">My Address</h1>
                            <div className='addressDefault mb-5'>
                                {Array.isArray(addressArray) && addressArray.length > 0
                                    ? addressArray.map((address, index) => (
                                        <React.Fragment key={index}>
                                            <div className='mb-4 flex gap-3'>
                                                <TextField
                                                    className="w-full"
                                                    id="address"
                                                    name="address"
                                                    label={index === 0 ? `Address (Mặc định)` : `Address ${index + 1}`}
                                                    variant="outlined"
                                                    value={address || ''}
                                                    disabled
                                                />
                                                <Button
                                                    variant="outlined"
                                                    size='small'
                                                    onClick={() => setEditAddressIndex(index)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size='small'
                                                    color="error"
                                                    onClick={() => handleDeleteAddress(index)}
                                                >
                                                    Xoá
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size='small'
                                                    color="success"
                                                    onClick={() => handleSetDefault(index)}
                                                    disabled={index === 0}
                                                >
                                                    Default
                                                </Button>
                                            </div>
                                        </React.Fragment>
                                    ))
                                    : "Not found address"}
                            </div>
                            {/* <Button variant="outlined" className='!w-full !p-5 !border-[#000] !rounded-none !text-black' onClick={handleClickOpen}>
                                Add Address
                            </Button> */}
                            <ChooseProvinces
                                userInfo={userInfo}
                                getInfo={getInfo}
                                editAddress={editAddressIndex !== null ? addressArray[editAddressIndex] : null}
                                indexToUpdate={editAddressIndex}
                                onEditDone={() => setEditAddressIndex(null)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Dialog
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());
                            const email = formJson.email;
                            console.log(email);
                            handleClose();
                        },
                    },
                }}
            >
                <DialogTitle className='flex justify-center'>Add Address</DialogTitle>
                <DialogContent>
                    <div className='flex flex-wrap gap-4 justify-center p-2'>
                        <TextField className='w-[45%]' label="Full Name" variant="outlined" size="small" />
                        <TextField className='w-[45%]' label="House Number and Street Name" variant='outlined' size="small"></TextField>
                        <TextField className='w-[45%]' label="Town / City" variant='outlined' size="small"></TextField>
                        <TextField className='w-[45%]' label="State / Country" variant='outlined' size="small"></TextField>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} className='!text-red-400'>Cancel</Button>
                    <Button type="submit" className='!bg-black !text-white'>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default MyAddress