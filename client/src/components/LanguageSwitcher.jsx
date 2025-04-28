import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaGlobe } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage();
  const languages = getAvailableLanguages();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <FaGlobe className="w-5 h-5 mr-2" />
          <span>{currentLanguage.toUpperCase()}</span>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-green-500 text-white' : 'text-gray-900'
                    } ${
                      currentLanguage === language.code ? 'font-bold' : ''
                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    onClick={() => changeLanguage(language.code)}
                  >
                    {language.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSwitcher;