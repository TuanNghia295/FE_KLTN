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
  useGetAddresses,
  useSetDefaultAddress,
  useUpdateAddress,
} from '../../services/addressServices';

const MyAddress = () => {
  const userInfo = useStore((state) => state.userInfo);
  const getInfo = useStore((state) => state.getInfo);
  const { data: addressesResponse } = useGetAddresses();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress();

  const addressArray = useMemo(() => addressesResponse?.addresses || addressesResponse || [], [addressesResponse]);
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {defaultAddress && (
                <div className="user-address p-5 border rounded-lg bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-lg text-black">Default Address</h2>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Default</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {defaultAddress.recipient_name || userInfo?.full_name || userInfo?.fullName || 'Recipient'}
                  </p>
                  <p className="text-gray-600 text-sm">{defaultAddress.phone || userInfo?.phone || ''}</p>
                  <p className="text-gray-700 mt-2 leading-relaxed">{formatAddress(defaultAddress)}</p>
                </div>
              )}
              <div className="saved-addresses p-5 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-black">Saved Addresses</h2>
                  <span className="text-xs text-gray-500">{addressArray.length} address(es)</span>
                </div>
                {Array.isArray(addressArray) && addressArray.length > 0 ? (
                  <div className="address-list space-y-4">
                    {addressArray.map((address, index) => (
                      <div
                        key={address.id || index}
                        className={`p-4 border rounded-lg flex flex-col gap-3 shadow-sm transition ${
                          address.is_default ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-black">
                                {address.is_default ? 'Default Address' : `Address ${index + 1}`}
                              </h4>
                              {address.is_default && (
                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 font-medium">
                              {address.recipient_name || userInfo?.full_name || userInfo?.fullName || 'Recipient'}
                            </p>
                            <p className="text-gray-600 text-sm">{address.phone || userInfo?.phone || ''}</p>
                          </div>
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
                        <p className="text-gray-700 leading-relaxed">{formatAddress(address)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No addresses found.</p>
                    <p className="text-sm">Please add a new address to get started.</p>
                  </div>
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
