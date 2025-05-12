import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AccountSlidebar from '../../components/AccountSlidebar';
import Page404 from '../Page404/index';
import useStore from '../../store/useStore';
import ChooseProvinces from '../../components/ChooseProvinces';
import { useUpdateUser } from '../../services/userServices';

const MyAddress = () => {
  const userInfo = useStore((state) => state.userInfo);
  const getInfo = useStore((state) => state.getInfo);
  const { mutate: updateUserInfo, isPending } = useUpdateUser();

  const addressArray = userInfo?.address || [];

  const [editAddressIndex, setEditAddressIndex] = useState(null);
  const [open, setOpen] = useState(false);

  // Lọc và xóa địa chỉ có giá trị "Default" khi component được tải
  useEffect(() => {
    if (addressArray.some((address) => address === 'Default')) {
      const filteredAddresses = addressArray.filter((address) => address !== 'Default');
      updateUserInfo({ address: filteredAddresses });
      getInfo({ ...userInfo, address: filteredAddresses });
    }
  }, [addressArray, updateUserInfo, getInfo, userInfo]);

  const handleDeleteAddress = (index) => {
    const updatedAddressList = [...addressArray];
    updatedAddressList.splice(index, 1);
    updateUserInfo({ address: updatedAddressList });
    getInfo({ ...userInfo, address: updatedAddressList });
  };

  const handleSetDefault = (index) => {
    if (index === 0) return;
    const updatedAddressList = [...addressArray];
    const [selectedAddress] = updatedAddressList.splice(index, 1);
    updatedAddressList.unshift(selectedAddress);
    updateUserInfo({ address: updatedAddressList });
    getInfo({ ...userInfo, address: updatedAddressList });
  };

  const handleClickOpen = (index = null) => {
    setEditAddressIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditAddressIndex(null);
  };

  const handleSaveAddress = (newAddress) => {
    const updatedAddressList =
      editAddressIndex !== null
        ? addressArray.map((addr, index) => (index === editAddressIndex ? newAddress : addr))
        : [...addressArray, newAddress];

    updateUserInfo({ address: updatedAddressList });
    getInfo({ ...userInfo, address: updatedAddressList });
    handleClose();
  };

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
      <div className="container flex flex-col xl:flex-row gap-5">
        <div className="col1 w-full xl:w-[20%]">
          <AccountSlidebar />
        </div>
        <div className="col2 w-full xl:w-[80%]">
          <div className="card bg-white p-5 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-[600] text-[20px] text-black">My Address</h1>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClickOpen()}
                className="!bg-black !text-white"
              >
                Add New Address
              </Button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {addressArray.length > 0 && (
                <div className="user-address p-4 border rounded-md bg-gray-50">
                  <h2 className="font-medium text-lg mb-3">Default Address</h2>
                  <p className="text-gray-700">{addressArray[0]}</p>
                </div>
              )}
              <div className="saved-addresses p-4 border rounded-md bg-gray-50">
                <h2 className="font-medium text-lg mb-3">Saved Addresses</h2>
                {Array.isArray(addressArray) && addressArray.length > 0 ? (
                  <div className="address-list space-y-4">
                    {addressArray.map((address, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-md flex flex-col gap-2 ${
                          index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-black">
                            {index === 0 ? 'Default Address' : `Address ${index + 1}`}
                          </h4>
                          <div className="flex gap-2">
                            <Button variant="outlined" size="small" onClick={() => handleClickOpen(index)}>
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDeleteAddress(index)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="success"
                              onClick={() => handleSetDefault(index)}
                              disabled={index === 0}
                            >
                              Set Default
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700">{address}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No addresses found. Please add a new address.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="flex justify-center">
          {editAddressIndex !== null ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <ChooseProvinces
            userInfo={userInfo}
            getInfo={getInfo}
            editAddress={editAddressIndex !== null ? addressArray[editAddressIndex] : null}
            indexToUpdate={editAddressIndex}
            onEditDone={() => setEditAddressIndex(null)}
            onSave={handleSaveAddress}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className="!text-red-400">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default MyAddress;
