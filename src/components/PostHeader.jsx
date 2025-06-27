// components/PostHeader.jsx
"use client";
import React from 'react';
import Image from 'next/image';
import { Dropdown, Menu } from 'antd';
import { AiOutlineEllipsis } from 'react-icons/ai';
import { baseURL } from '../../utils/BaseURL';

const PostHeader = ({ 
  post, 
  isMobile, 
  isTablet, 
  menuItems, 
  handleMenuClick,
  handlePostDetails 
}) => {
  const renderAuthorAvatar = () => (
    post.author.avatar ? (
      <img
        src={post.author.avatar.startsWith('http') ? post.author.avatar : `${baseURL}${post.author.avatar}`}
        alt="Author avatar"
        className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
      />
    ) : (
      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
        {post.author.username?.charAt(0).toUpperCase() || 'A'}
      </div>
    )
  );

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        {renderAuthorAvatar()}
        <div className="flex flex-col justify-start items-start sm:items-center sm:gap-1">
          <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-base'} text-gray-900`}>
            {post.author.username || post.author.name}
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 pl-2`}>
            {post.timePosted}
          </span>
        </div>
      </div>

      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        placement="bottomRight"
        trigger={['click']}
      >
        <button className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer">
          <AiOutlineEllipsis className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </button>
      </Dropdown>
    </div>
  );
};

export default PostHeader;