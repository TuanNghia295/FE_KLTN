import React from 'react'
import { useLocation } from 'react-router-dom';
import { useProducts } from '../../services/productsService';
import ProductItemListView from '../../components/ProductItemListView'
import { IoSearchSharp } from "react-icons/io5";
import useMediaQuery from '@mui/material/useMediaQuery';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const normalizeString = (str) => {
    if (!str) return "";
    return str
        .normalize('NFD')                   // tách dấu ra khỏi chữ
        .replace(/[\u0300-\u036f]/g, '')    // xóa dấu
        .toLowerCase()                      // chuyển về thường
        .replace(/\s+/g, '-')               // thay khoảng trắng = dấu gạch ngang nếu cần
};

const SearchPage = () => {
    const query = useQuery();
    const keyword = query.get('keyword') || '';

    if (!keyword) {
        return (
            <>
                <section className='container flex flex-col items-center justify-between !my-5 font-[600]'>
                    <p><IoSearchSharp /></p>
                    <p>Search empty</p>
                </section>
            </>
        )
    }

    const { productList } = useProducts(20, 1, keyword)

    const isMobile = useMediaQuery('(max-width:768px)');


    return (
        <section className='container !my-5 flex flex-col gap-3'>
            <div className='text-[20px] font-bold text-black text-center'>SEARCH RESULT</div>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2' } gap-4`}>
                {Array.isArray(productList) && productList.length > 0
                    ? (
                        productList.map((product) => (
                            <>
                                <ProductItemListView product={product} normalizeString={normalizeString} />
                            </>
                        ))
                    )
                    : (
                        <section className='container flex flex-col items-center justify-between !my-5 font-[600]'>
                            <p><IoSearchSharp /></p>
                            <p>Search not found</p>
                        </section>
                    )
                }
            </div>
        </section>
    )
}

export default SearchPage