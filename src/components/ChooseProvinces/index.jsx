import React, { Fragment, useState, useEffect } from 'react';
import { useProvinces, useWards } from '../../services/addressServices';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';

const ChooseProvinces = ({ userInfo, editAddress = null, hasDefaultAddress = false, onSave }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [numberAddress, setNumberAddress] = useState('');
  const [recipientName, setRecipientName] = useState(userInfo?.full_name || userInfo?.fullName || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [isDefault, setIsDefault] = useState(false);
  const canSelectDefault = editAddress ? !editAddress.is_default : !hasDefaultAddress;
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const formattedSelectedAddress = selectedAddress ? formatAddress(selectedAddress) : '';

  const { listProvinces, getProvinceByCode, getDistrictByCode, loadingProvinces } = useProvinces();

  const formatAddress = (address) => {
    if (!address) return '';
    const parts = [address.street_address, address.ward, address.district, address.city, address.country]
      .map((part) => part?.toString().trim())
      .filter(Boolean);
    return parts.join(', ');
  };

  // Load data from editAddress if editing
  useEffect(() => {
    if (editAddress && listProvinces?.length > 0) {
      setNumberAddress(editAddress.street_address || '');
      setSelectedWard(editAddress.ward || '');
      setRecipientName(editAddress.recipient_name || userInfo?.full_name || userInfo?.fullName || '');
      setPhone(editAddress.phone || userInfo?.phone || '');
      setIsDefault(Boolean(editAddress.is_default));

      const city = listProvinces.find((c) => c.name === editAddress.city);
      if (city) {
        setSelectedCity(city.code);
        const district = city.districts?.find((d) => d.name === editAddress.district);
        if (district) {
          setSelectedDistrict(district.code);
        }
      }
      return;
    }

    if (!editAddress) {
      setNumberAddress('');
      setSelectedWard('');
      setSelectedDistrict('');
      setSelectedCity('');
      setRecipientName(userInfo?.full_name || userInfo?.fullName || '');
      setPhone(userInfo?.phone || '');
      setIsDefault(false);
    }
  }, [editAddress, listProvinces, userInfo?.full_name, userInfo?.fullName, userInfo?.phone]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'city') {
      setSelectedCity(value);
      setSelectedDistrict('');
      setSelectedWard('');
    } else if (name === 'district') {
      setSelectedDistrict(value);
      setSelectedWard('');
    } else if (name === 'ward') {
      setSelectedWard(value);
    }
  };

  const city = getProvinceByCode(selectedCity);
  const district = getDistrictByCode(selectedCity, selectedDistrict);
  const { listWards } = useWards(selectedDistrict);

  const handleSave = () => {
    if (!numberAddress || !selectedWard || !selectedDistrict || !selectedCity) {
      toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    const payload = {
      street_address: numberAddress,
      ward: selectedWard,
      district: district?.name,
      city: city?.name,
      country: 'Vietnam',
      recipient_name: recipientName,
      phone,
      is_default: isDefault,
    };

    onSave(payload);
  };

  if (loadingProvinces) return <p>Đang tải thành phố...</p>;

  return (
    <Fragment>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* <input
          onChange={(event) => setRecipientName(event.target.value)}
          value={recipientName}
          placeholder="Recipient name"
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          onChange={(event) => setPhone(event.target.value)}
          value={phone}
          placeholder="Phone"
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        /> */}
        <select
          name="city"
          onChange={handleChange}
          value={selectedCity}
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn thành phố</option>
          {listProvinces &&
            listProvinces.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
        </select>
        <select
          name="district"
          onChange={handleChange}
          value={selectedDistrict}
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn quận huyện</option>
          {city?.districts &&
            city.districts.map((district) => (
              <option key={district?.code} value={district?.code}>
                {district?.name}
              </option>
            ))}
        </select>
        <select
          name="ward"
          onChange={handleChange}
          value={selectedWard}
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn phường</option>
          {listWards &&
            listWards.map((ward) => (
              <option key={ward.code} value={ward.name}>
                {ward.name}
              </option>
            ))}
        </select>
        <input
          onChange={(event) => setNumberAddress(event.target.value)}
          value={numberAddress}
          placeholder="Nhập số nhà"
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
            disabled={!canSelectDefault}
          />
          Set as default
        </label>
      </div>
      <Button onClick={handleSave} className="w-full !bg-black !text-white !p-3">
        Save
      </Button>

      {/* {userInfo?.address && userInfo.address.length > 0 && (
        <div className="mt-4">
          <button
            className="text-blue-500 underline hover:text-blue-700"
            onClick={() => setShowAddressList(!showAddressList)}
          >
            {showAddressList ? 'Ẩn danh sách' : 'Thay đổi địa chỉ'}
          </button>
        </div>
      )} */}

      {showAddressList && userInfo?.addresses && (
        <div className="mt-3 border p-4 rounded-lg bg-gray-100 max-h-40 overflow-y-auto">
          <p className="font-medium mb-2">Chọn địa chỉ đã lưu:</p>
          {userInfo.addresses.map((addr, index) => {
            const formattedAddress = formatAddress(addr);
            const isSelected = selectedAddress?.id === addr.id;

            return (
              <button
                key={addr.id || index}
                className={`w-full text-left p-3 mb-2 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedAddress(addr);
                  setShowAddressList(false);
                }}
              >
                {formattedAddress}
              </button>
            );
          })}
        </div>
      )}
    </Fragment>
  );
};

export default ChooseProvinces;
