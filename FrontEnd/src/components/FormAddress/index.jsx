import React, { useState } from 'react';
import { useAPIThanhPho, useAPIQuanHuyen } from '../../services/addressServices'; // Import hook

const FormChonThanhPhoQuanHuyen = () => {
    const { listThanhPho, loadingThanhPho, errorThanhPho } = useAPIThanhPho();
    console.log(listThanhPho)
    const [selectedCity, setSelectedCity] = useState(null);
    
    const { listQuanHuyen, loadingQuanHuyen, errorQuanHuyen } = useAPIQuanHuyen(selectedCity);

    // Hàm xử lý khi chọn thành phố
    const handleCityChange = (event) => {
        setSelectedCity(event.target.value);
    };

    if (loadingThanhPho) return <p>Đang tải thành phố...</p>;
    if (errorThanhPho) return <p>Lỗi khi tải thành phố</p>;

    return (
        <div>
            <label>Chọn thành phố:</label>
            <select onChange={handleCityChange}>
                <option value="">-- Chọn thành phố --</option>
                {listThanhPho && listThanhPho.map((city) => (
                    <option key={city.code} value={city.code}>
                        {city.name}
                    </option>
                ))}
            </select>

            {selectedCity && (
                <>
                    {loadingQuanHuyen && <p>Đang tải quận huyện...</p>}
                    {errorQuanHuyen && <p>Lỗi khi tải quận huyện</p>}
                    
                    <label>Chọn quận huyện:</label>
                    <select>
                        <option value="">-- Chọn quận huyện --</option>
                        {listQuanHuyen && listQuanHuyen.map((district) => (
                            <option key={district.code} value={district.code}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </>
            )}
        </div>
    );
};

export default FormChonThanhPhoQuanHuyen;
