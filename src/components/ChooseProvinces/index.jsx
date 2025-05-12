import React, { Fragment, useState, useEffect } from 'react';
import { useProvinces, useWards } from '../../services/addressServices';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';

const ChooseProvinces = ({ userInfo, getInfo, editAddress = null, indexToUpdate = null, onEditDone, onSave }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [numberAddress, setNumberAddress] = useState('');
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  const { listProvinces, getProvinceByCode, getDistrictByCode, loadingProvinces } = useProvinces();

  // Load data from editAddress if editing
  useEffect(() => {
    if (editAddress && listProvinces.length > 0) {
      const parts = editAddress.split(',').map((p) => p.trim());
      if (parts.length === 4) {
        const [number, wardName, districtName, cityName] = parts;
        setNumberAddress(number);
        setSelectedWard(wardName);

        const city = listProvinces.find((c) => c.name === cityName);
        if (city) {
          setSelectedCity(city.code);
          const district = city.districts?.find((d) => d.name === districtName);
          if (district) {
            setSelectedDistrict(district.code);
          }
        }
      }
    }
  }, [editAddress, listProvinces]);

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

    const newAddress = `${numberAddress}, ${selectedWard}, ${district?.name}, ${city?.name}`;
    onSave(newAddress); // Pass the address to the parent
  };

  if (loadingProvinces) return <p>Đang tải thành phố...</p>;

  return (
    <Fragment>
      <div className="grid grid-cols-2 gap-4 mb-6">
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

      {showAddressList && userInfo?.address && (
        <div className="mt-3 border p-4 rounded-lg bg-gray-100 max-h-40 overflow-y-auto">
          <p className="font-medium mb-2">Chọn địa chỉ đã lưu:</p>
          {userInfo.address.map((addr, index) => (
            <button
              key={index}
              className={`w-full text-left p-3 mb-2 rounded-lg border transition-all duration-200 ${
                selectedAddress === addr
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setSelectedAddress(addr);
                setShowAddressList(false);
                refetchShippingFee();
              }}
            >
              {addr}
            </button>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default ChooseProvinces;
