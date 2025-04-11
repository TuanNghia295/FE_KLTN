import React, { Fragment, useState } from 'react';
import { useProvinces, useWards } from '../../services/addressServices'; // Import hook
import { Button } from '@mui/material';
import { useUpdateUser } from '../../services/userServices';
import { toast } from 'react-toastify';

const ChooseProvinces = ({ userInfo, getInfo, oldAddress }) => {
    const [selectedCity, setSelectedCity] = useState(''); //Lưu code của City
    const [selectedDistrict, setSelectedDistrict] = useState('');//Lưu code của District
    const [selectedWard, setSelectedWard] = useState('')//Lưu phường xã
    const [numberAddress, setNumberAddress] = useState('')
    console.log(oldAddress)

    //API Update User
    const { mutate: updateUserInfo, isPending } = useUpdateUser();

    const {
        listProvinces,
        getProvinceByCode,
        getDistrictByCode,
        loadingProvinces,
    } = useProvinces();


    // Hàm xử lý khi chọn thành phố
    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'city') {
            setSelectedCity(value);
            setSelectedDistrict(''); // Reset quận nếu đổi tỉnh
        }

        if (name === 'district') {
            setSelectedDistrict(value);
        }

        if (name === 'ward') {
            setSelectedWard(value);
        }
    };

    //Danh sách Thành Phố, Tỉnh/Quận
    const city = getProvinceByCode(selectedCity);
    const district = getDistrictByCode(selectedCity, selectedDistrict)
    const { listWards } = useWards(selectedDistrict)

    //Data địa chỉ
    const data = {
        address: `${numberAddress}, ${selectedWard}, ${district?.name}, ${city?.name}`
    }


    //Submit
    const handleSubmit = (event) => {
        event.preventDefault(); // Ngăn reload trang
        if (!numberAddress || !selectedWard || !selectedDistrict || !selectedCity) {
            toast.error('Vui lòng nhập đầy đủ thông tin !', {
                position: 'top-center',
                autoClose: 3000,
              });
            return;
        }

        updateUserInfo(data)
        getInfo({ ...userInfo, address: [...(userInfo?.address || []), data.address] }); // Cập nhật thông tin người dùng trong Zustand
    }
    
    if (loadingProvinces)
        return <p>Đang tải thành phố...</p>;

    return (
        <Fragment>
            <div className='font-[600] w-full bg-[#f1f1f1] p-3 my-4 rounded-md text-center'>
                <h1>Add Address</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-2 gap-3 mb-4'>
                    <input onChange={(event) => { setNumberAddress(event.target.value) }} value={numberAddress} placeholder='Nhập số nhà' className='border border-[#ccc] p-2 rounded-md !text-black'></input>
                    <select name='ward' onChange={handleChange} className='border border-[#ccc] p-2 rounded-md'>
                        <option value="">Chọn phường</option>
                        {listWards && listWards.map((ward) => (
                            <option key={ward.code} value={ward.name}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                    <select name="district" onChange={handleChange} className='border border-[#ccc] p-2 rounded-md'>
                        <option value="">Chọn quận huyện</option>
                        {city?.districts && city?.districts.map((district) => (
                            <option key={district?.code} value={district?.code}>
                                {district?.name}
                            </option>
                        ))}
                    </select>
                    <select name='city' onChange={handleChange} className='border border-[#ccc] p-2 rounded-md'>
                        <option value="">Chọn thành phố</option>
                        {listProvinces && listProvinces.map((city) => (
                            <option key={city.code} value={city.code}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>
                <Button type="submit" className="w-full !bg-black !text-white !p-3">
                    Save
                </Button>
            </form>
        </Fragment>
    );
};

export default ChooseProvinces;
