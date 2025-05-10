import React from 'react';

const sizes = {
  shoes: ['6', '7', '8', '9', '10', '11', '12', '12', '12', '12', '12', '12', '12', '12', '12'],
  clothes: ['S', 'M', 'L', 'XL', 'XXL'],
};

/**
 * @typedef {"shoes"|"clothes"}SizeType
 */

/**
 *
 * @param {{type: SizeType}} props
 * @returns
 */

export default function Size({ type }) {
  const sizeOptions = sizes[type] || [];

  return (
    <div className="size-selector">
      <h3 className="text-lg font-[500] mb-3 text-black">Select Size</h3>
      <div className="flex flex-wrap !p-0 gap-3 my-3 w-full ">
        {sizeOptions.map((size, index) => (
          <button
            key={index}
            className="size-button border min-w-16 border-black text-black bg-white hover:bg-black hover:text-white px-4 py-2 rounded transition duration-300"
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
