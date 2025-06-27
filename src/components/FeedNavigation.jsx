"use client"
import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { RiArrowUpDownLine } from "react-icons/ri";
import { ThemeContext } from '../app/ClientLayout';

const FeedNavigation = ({ handlefeedGrid, onSortChange, currentSort }) => {
  // Initialize clickCount from localStorage or default to 1
  const [clickCount, setClickCount] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isDarkMode } = useContext(ThemeContext);

  // Load saved grid state on component mount
  useEffect(() => {
    // Check if we're in browser environment (not during SSR)
    if (typeof window !== 'undefined') {
      const savedGridState = localStorage.getItem('feedGridState');
      if (savedGridState) {
        setClickCount(parseInt(savedGridState));
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFeedsClick = () => {
    const newCount = (clickCount % 2) + 1;
    setClickCount(newCount);
    
    // Save the new state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('feedGridState', newCount.toString());
    }
  };

  useEffect(() => {
    handlefeedGrid(clickCount);
  }, [clickCount, handlefeedGrid]);

  const items = [
    {
      key: 'newest',
      label: 'Newest',
      className: currentSort === 'newest' ? 'bg-blue-100 dark:bg-blue-900/50' : ''
    },
    {
      key: 'oldest',
      label: 'Oldest',
      className: currentSort === 'oldest' ? 'bg-blue-100 dark:bg-blue-900/50' : ''
    },
    {
      key: 'popular',
      label: 'Popular',
      className: currentSort === 'popular' ? 'bg-blue-100 dark:bg-blue-900/50' : ''
    },
  ];

  const handleMenuClick = (e) => {
    onSortChange(e.key);
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
    className: `rounded-lg py-1 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`,
    style: {
      minWidth: '120px',
    },
    selectable: true,
    selectedKeys: [currentSort],
  };

  return (
    <div className={`flex justify-between items-center py-4 w-full select-none ${isDarkMode ? 'dark' : ''}`}>
      <div
        onClick={handleFeedsClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`cursor-pointer flex items-center gap-1 p-1 md:p-1.5 rounded-lg transition-all duration-200
          ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} active:scale-95`}
      >
        <AppstoreOutlined className={`mr-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} ${isMobile ? 'text-base' : 'text-xl'}`} />
        <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} ${isMobile ? 'text-sm' : 'text-base'}`}>
          Your Feeds
        </span>
      </div>

      <Dropdown
        menu={menuProps}
        trigger={['click']}
        dropdownRender={(menu) => (
          <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'dark-dropdown-shadow' : 'light-dropdown-shadow'}`}>
            {React.cloneElement(menu, {
              style: { 
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)'
              },
            })}
          </div>
        )}
      >
        <Button
          type="default"
          className={`flex items-center rounded-lg ${isMobile ? 'px-2 h-8 text-sm' : 'px-4 h-10 text-base'}
            ${isDarkMode ? 
              'bg-gray-700 border-gray-600 text-gray-200 hover:border-blue-400 hover:text-blue-400' : 
              'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:text-blue-500'}
            transition-colors duration-200`}
        >
          <RiArrowUpDownLine className={`${isMobile ? 'text-xs' : 'text-lg'} mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className="font-medium mx-1">
            {items.find(item => item.key === currentSort)?.label}
          </span>
          <DownOutlined className={`${isMobile ? 'text-xs' : 'text-sm'} ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </Button>
      </Dropdown>

      <style jsx global>{`
        .ant-dropdown-menu {
          ${isDarkMode ? `
            background-color: #1f2937;
            color: #f3f4f6;
          ` : `
            background-color: white;
            color: #111827;
          `}
        }
        .ant-dropdown-menu-item {
          ${isDarkMode ? `
            color: #f3f4f6;
            &:hover {
              background-color: #374151 !important;
            }
          ` : `
            color: #111827;
            &:hover {
              background-color: #f3f4f6 !important;
            }
          `}
        }
        .ant-dropdown-menu-item-selected {
          ${isDarkMode ? `
            background-color: #1e40af !important;
            color: white !important;
          ` : `
            background-color: #dbeafe !important;
            color: #1e40af !important;
          `}
        }
      `}</style>
    </div>
  );
};

export default FeedNavigation;