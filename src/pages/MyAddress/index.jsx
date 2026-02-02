import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AccountSlidebar from '../../components/AccountSlidebar';
import Page404 from '../Page404/index';
import useStore from '../../store/useStore';
import ChooseProvinces from '../../components/ChooseProvinces';
import {
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '../../services/addressServices';

const MyAddress = () => {
  const userInfo = useStore((state) => state.userInfo);
  const getInfo = useStore((state) => state.getInfo);
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress();

  const addressArray = useMemo(() => userInfo?.addresses || [], [userInfo?.addresses]);
  const hasDefaultAddress = addressArray.some((address) => address.is_default);

  const [editAddressId, setEditAddressId] = useState(null);
  const [open, setOpen] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    const parts = [address.street_address, address.ward, address.district, address.city, address.country]
      .map((part) => part?.toString().trim())
      .filter(Boolean);
    return parts.join(', ');
  };

  const defaultAddress = useMemo(() => addressArray.find((address) => address.is_default), [addressArray]);

  const handleDeleteAddress = (addressId) => {
    deleteAddress(addressId, {
      onSuccess: () => {
        if (!userInfo) return;
        const updatedAddresses = addressArray.filter((address) => address.id !== addressId);
        getInfo({ ...userInfo, addresses: updatedAddresses });
      },
    });
  };

  const handleSetDefault = (addressId) => {
    setDefaultAddress(addressId, {
      onSuccess: () => {
        if (!userInfo) return;
        const updatedAddresses = addressArray.map((address) => ({
          ...address,
          is_default: address.id === addressId,
        }));
        getInfo({ ...userInfo, addresses: updatedAddresses });
      },
    });
  };

  const handleClickOpen = (addressId = null) => {
    setEditAddressId(addressId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditAddressId(null);
  };

  const handleSaveAddress = (payload) => {
    const shouldSetDefault = Boolean(payload?.is_default);
    const payloadWithoutDefault = { ...payload };
    delete payloadWithoutDefault.is_default;

    if (editAddressId) {
      updateAddress(
        { id: editAddressId, payload: payloadWithoutDefault },
        {
          onSuccess: (response) => {
            if (!userInfo) return;
            const updatedAddress = response?.address || response?.data?.address || response;
            const updatedAddresses = updatedAddress?.id
              ? addressArray.map((address) => (address.id === editAddressId ? updatedAddress : address))
              : addressArray;
            getInfo({ ...userInfo, addresses: updatedAddresses });

            if (shouldSetDefault) {
              setDefaultAddress(editAddressId, {
                onSuccess: () => {
                  const refreshedAddresses = updatedAddresses.map((address) => ({
                    ...address,
                    is_default: address.id === editAddressId,
                  }));
                  getInfo({ ...userInfo, addresses: refreshedAddresses });
                },
              });
            }

            handleClose();
          },
        }
      );
      return;
    }

    createAddress(payloadWithoutDefault, {
      onSuccess: (response) => {
        if (!userInfo) return;
        const createdAddress = response?.address || response?.data?.address || response;
        const updatedAddresses = createdAddress?.id ? [...addressArray, createdAddress] : addressArray;
        getInfo({ ...userInfo, addresses: updatedAddresses });

        if (shouldSetDefault && createdAddress?.id) {
          setDefaultAddress(createdAddress.id, {
            onSuccess: () => {
              const refreshedAddresses = updatedAddresses.map((address) => ({
                ...address,
                is_default: address.id === createdAddress.id,
              }));
              getInfo({ ...userInfo, addresses: refreshedAddresses });
            },
          });
        }

        handleClose();
      },
    });
  };

  const isPending = isCreating || isUpdating || isDeleting || isSettingDefault;

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
              {defaultAddress && (
                <div className="user-address p-4 border rounded-md bg-gray-50">
                  <h2 className="font-medium text-lg mb-3">Default Address</h2>
                  <p className="text-gray-700">{formatAddress(defaultAddress)}</p>
                </div>
              )}
              <div className="saved-addresses p-4 border rounded-md bg-gray-50">
                <h2 className="font-medium text-lg mb-3">Saved Addresses</h2>
                {Array.isArray(addressArray) && addressArray.length > 0 ? (
                  <div className="address-list space-y-4">
                    {addressArray.map((address, index) => (
                      <div
                        key={address.id || index}
                        className={`p-4 border rounded-md flex flex-col gap-2 ${
                          address.is_default ? 'border-green-500 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-black">
                            {address.is_default ? 'Default Address' : `Address ${index + 1}`}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleClickOpen(address.id)}
                              disabled={isPending}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={isPending}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="success"
                              onClick={() => handleSetDefault(address.id)}
                              disabled={address.is_default || isPending}
                            >
                              Set Default
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700">{formatAddress(address)}</p>
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
          {editAddressId ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <ChooseProvinces
            userInfo={userInfo}
            editAddress={editAddressId ? addressArray.find((address) => address.id === editAddressId) : null}
            hasDefaultAddress={hasDefaultAddress}
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
