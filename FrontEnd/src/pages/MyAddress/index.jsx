import AccountSlidebar from '../../components/AccountSlidebar';
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
// Zustand
import useStore from '../../store/useStore';
import ChooseProvinces from '../../components/ChooseProvinces';

const MyAddress = () => {
    //Lấy userInfo từ Zustand
    const userInfo = useStore((state) => state.userInfo);
    const getInfo = useStore((state) => state.getInfo);
    
    //Lấy mảng address User
    const addressArray = userInfo?.address

    //Set old address
    const [oldAddress, setOldAddress] = React.useState('')

    //Modal Address
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <section className='py-10 w-full'>
                <div className='container flex flex-col xl:flex-row gap-5'>
                    <div className='col1 w-full xl:w-[20%]'>
                        <AccountSlidebar />
                    </div>

                    <div className='col2 w-full xl:w-[80%]'>
                        <div className='card bg-white p-5 rounded-md'>
                            <div className='addressDefault mb-5'>
                                {Array.isArray(addressArray) && addressArray.length > 0
                                    ? addressArray.map((address, index) => (
                                        <React.Fragment key={index}>
                                            <div className='mb-4'>
                                                <TextField
                                                    className="w-full"
                                                    id="address"
                                                    name="address"
                                                    label={`Address ${index + 1}`}
                                                    variant="outlined"
                                                    value={address || ''}
                                                    disabled
                                                />
                                                {/* <button onClick={()=>setOldAddress(address)}>Get</button> */}
                                            </div>
                                        </React.Fragment>
                                    ))
                                    : "Not found address"}
                            </div>
                            {/* <Button variant="outlined" className='!w-full !p-5 !border-[#000] !rounded-none !text-black' onClick={handleClickOpen}>
                                Add Address
                            </Button> */}
                            <ChooseProvinces userInfo={userInfo} getInfo={getInfo} oldAddress={oldAddress} />
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