import React, { Fragment, useState, useEffect } from 'react';
import { useProvinces, useWards } from '../../services/addressServices';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';

const ChooseProvinces = ({ userInfo, getInfo, editAddress = null, indexToUpdate = null, onEditDone, onSave }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [numberAddress, setNumberAddress] = useState('');

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
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          onChange={(event) => setNumberAddress(event.target.value)}
          value={numberAddress}
          placeholder="Nhập số nhà"
          className="border border-[#ccc] p-2 rounded-md !text-black"
        />
        <select
          name="ward"
          onChange={handleChange}
          value={selectedWard}
          className="border border-[#ccc] p-2 rounded-md"
        >
          <option value="">Chọn phường</option>
          {listWards &&
            listWards.map((ward) => (
              <option key={ward.code} value={ward.name}>
                {ward.name}
              </option>
            ))}
        </select>
        <select
          name="district"
          onChange={handleChange}
          value={selectedDistrict}
          className="border border-[#ccc] p-2 rounded-md"
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
          name="city"
          onChange={handleChange}
          value={selectedCity}
          className="border border-[#ccc] p-2 rounded-md"
        >
          <option value="">Chọn thành phố</option>
          {listProvinces &&
            listProvinces.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
        </select>
      </div>
      <Button onClick={handleSave} className="w-full !bg-black !text-white !p-3">
        Save
      </Button>
    </Fragment>
  );
};

export default ChooseProvinces;
