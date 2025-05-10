import React, { useState } from 'react';
import { FaFacebookF, FaInstagram, FaPinterest, FaXTwitter } from 'react-icons/fa6';
import { IoIosArrowDown } from 'react-icons/io';

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      title: 'SUPPORT',
      links: ['Contact Us', 'FAQ', 'Shipping and Delivery', 'Return Policy', 'Terms & Conditions', 'Privacy Policy'],
    },
    {
      title: 'STORES & SERVICES',
      links: ['Store Locator', 'Buy a Gift Card', 'Gift Card Balance', 'Student Discount'],
    },
    {
      title: 'ABOUT',
      links: ['Company', 'Corporate News', 'Investors', 'Careers'],
    },
  ];

  return (
    <div className="bg-white text-black  py-10">
      <div className="container border-t-2 mx-auto px-5">
        {sections.map((section, index) => (
          <div key={index} className="border-b border-gray-300">
            <button
              className="w-full flex justify-between items-center py-3 text-lg font-bold"
              onClick={() => toggleSection(index)}
            >
              {section.title}
              <IoIosArrowDown
                className={`transition-transform duration-300 ${openSection === index ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openSection === index ? 'max-h-64 py-2' : 'max-h-0'
              }`}
            >
              <ul className="space-y-2 text-sm text-gray-800 pl-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="block py-1">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* STAY UP TO DATE & SOCIAL */}
        <div className="text-center mt-6">
          <h3 className="text-lg font-bold mb-3">STAY UP TO DATE</h3>
          <a href="#" className="text-sm text-gray-800 underline">
            Sign Up for Email
          </a>

          <h3 className="text-lg font-bold mt-6 mb-3">EXPLORE</h3>
          <div className="flex justify-center gap-3">
            <button className="border px-4 py-1 text-sm rounded">APP</button>
            <button className="border px-4 py-1 text-sm rounded">TRAC</button>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-4 mt-6">
            <FaXTwitter className="text-2xl cursor-pointer" />
            <FaPinterest className="text-2xl cursor-pointer" />
            <FaInstagram className="text-2xl cursor-pointer" />
            <FaFacebookF className="text-2xl cursor-pointer" />
          </div>
        </div>

        {/* Country Selector */}
        <div className="mt-10 flex justify-center">
          <button className="border px-6 py-2 flex items-center gap-2 rounded">VIET NAM</button>
        </div>

        {/* Legal */}
        <div className="text-center text-gray-400 text-sm mt-6">
          © IUH GO VAP, INC. |{' '}
          <a href="#" className="underline">
            IMPRINT AND LEGAL DATA
          </a>
        </div>
      </div>
    </div>
  );
}
