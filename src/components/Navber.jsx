"use client";
import { useGetProfileQuery } from '@/features/profile/profileApi';
import {
  CloseOutlined,
  CommentOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  MoonOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Input,
  Layout,
  Menu,
  Space,
  Typography
} from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { IoNotificationsSharp } from "react-icons/io5";
import { useSelector } from 'react-redux';

import { isAuthenticated } from '../../utils/auth';
import { baseURL } from '../../utils/BaseURL';
import { getImageUrl } from '../../utils/getImageUrl';
import { MessageDark, MessageLight, NotificationDark, NotificationLight } from '../../utils/svgImage';
import { ThemeContext } from '../app/ClientLayout';
import { useGetAllChatQuery } from '../features/chat/massage';
import { useGetAllNotificationQuery } from '../features/notification/noticationApi';
import { useLogoQuery } from '../features/report/reportApi';
import SocketComponent from './SocketCompo';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Navbar() {
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Using ThemeContext instead of useTheme hook
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const { isLoading: allNotificationLoading, refetch } = useGetAllNotificationQuery({});
  const { isLoading: allChatLoading, refetch: refetchChat } = useGetAllChatQuery("");
  const { notifications } = useSelector((state) => state);
  const { chats } = useSelector((state) => state);

  const { data, isLoading } = useGetProfileQuery();
  const { data: logo } = useLogoQuery();

  const filteredLogo = logo?.data?.find(item =>
    (isDarkMode && item.status === 'dark') || (!isDarkMode && item.status === 'light')
  );


  // Initialize search query from URL
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      // Remove quotes if they exist in the query
      const cleanQuery = query.replace(/^"|"$/g, '');
      setSearchQuery(cleanQuery);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  const handleNavigation = (path) => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    } else {
      router.push(path);
      setDrawerVisible(false);
    }

  };

  const items = [
    {
      key: 'profile-header',
      label: (
        <Flex gap="small" align="center" className={`p-2 cursor-pointer ${isDarkMode ? 'text-black' : ''}`}>
          <Avatar
            src={getImageUrl(data?.data?.profile)}
            size={44}
          />
          <Space direction="vertical" size={0}>
            {/* Name - always black if exists */}
            <Text strong className={data?.data?.name ? "text-black" : "text-transparent"}>
              {data?.data?.name}
            </Text>

            {/* Username - gray if name exists, black otherwise */}
            <Text className={data?.data?.name ? "text-gray-500" : "text-black"}>
              {data?.data?.userName ? `@${data?.data?.userName}` : ""}
            </Text>
          </Space>
        </Flex>
      ),
      onClick: () => handleNavigation("/profile"),
    },
    {
      type: 'divider',
    },
    {
      key: 'about',
      icon: <UserOutlined />,
      label: 'About us',
      onClick: () => handleNavigation('/about'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    // {
    //   key: 'help',
    //   icon: <QuestionCircleOutlined />,
    //   label: 'Help & Support',
    //   onClick: () => handleNavigation('/help&support'),
    //   className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    // },
    {
      key: 'feedback',
      icon: <CommentOutlined />,
      label: 'Feedback',
      onClick: () => handleNavigation('/feedback'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => handleNavigation('/settings'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    {
      key: 'darkmode',
      icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />,
      label: `${isDarkMode ? "Switch to light mode" : "Switch to dark mode"}`,
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
      onClick: toggleTheme,
    },
    {
      type: 'divider',
    },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: () => {
        router.push('/auth/login');
        localStorage.removeItem('loginToken');
        localStorage.removeItem('login_user_id');
        localStorage.removeItem('rememberedCredentials');
        localStorage.setItem('theme', 'light');
        localStorage.removeItem('isLoggedIn');
      },
      style: { color: '#ff4d4f' }, // red color
      className: 'hover:!bg-gray-100 hover:!text-red-600',
    }
  ];

  // Function to handle search
  const handleSearch = (value) => {
    const trimmedValue = value?.trim();
    if (trimmedValue) {
      router.push(`/?search=${encodeURIComponent(trimmedValue)}`);
    } else {
      router.push('/');
    }
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value) {
      router.push('/');
    }
  };

  // Function to handle when Enter key is pressed
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Function to clear the search input
  const handleClear = () => {
    setSearchQuery('');
    router.push('/');
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      setSearchQuery('');
      router.push('/');
    }
  };

  // Apply theme to search fields
  const searchFieldStyles = {
    input: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '10px 16px',
      boxShadow: 'none',
      height: '100%',
    },
    searchIcon: {
      color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : '#6b7280',
      fontSize: '16px',
      marginRight: '8px',
    }
  };

  // Apply theme to icon buttons
  const iconButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${isDarkMode ? '#424242' : '#e5e7eb'}`,
    padding: '8px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: isDarkMode ? '#1f1f1f' : '#f9fafb'
  };

  // Desktop search component with theme styling
  const renderDesktopSearch = () => (
    <div style={{
      width: '35%',
      paddingLeft: "100px",
      minWidth: '200px',
      marginLeft: '200px'
    }}>
      <Flex
        align="center"
        style={{
          width: '100%',
          height: '50px',
          backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? '#424242' : '#D8D8D8'}`,
          boxShadow: isDarkMode ? '0 2px 6px rgba(0, 0, 0, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Input
          value={searchQuery}
          placeholder="Search topics..."
          prefix={<SearchOutlined style={{ color: isDarkMode ? '#bbbbbb' : '#888888' }} />}
          style={{
            height: '100%',
            flex: 1,
            padding: '0 16px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
            fontSize: '14px'
          }}
          onChange={handleInputChange}
          onPressEnter={handleKeyDown}
          allowClear={{
            clearIcon: <CloseOutlined onClick={handleClear} style={{ color: isDarkMode ? '#888' : '#aaa' }} />
          }}
        />

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleSearch(searchQuery)}
          style={{
            height: '100%',
            width: '50px',
            borderRadius: '0 12px 12px 0',
            border: 'none',
            backgroundColor: isDarkMode ? '#0001FB' : '#0001FB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#0001FB' : '#0001FB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#0001FB' : '#0001FB';
          }}
        />
      </Flex>
    </div>
  );

  // Mobile search component with theme styling
  const renderMobileSearch = () => (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      padding: '0 8px',
    }}>
      <Input
        value={searchQuery}
        placeholder="Search topics"
        prefix={<SearchOutlined style={searchFieldStyles.searchIcon} />}
        style={{
          ...searchFieldStyles.input,
          width: '100%',
          background: isDarkMode ? '#1f1f1f' : '#f3f2fa',
          borderRadius: '10px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'inherit',
        }}
        autoFocus
        onChange={handleInputChange}
        onPressEnter={handleKeyDown}
        allowClear={{
          clearIcon: <CloseOutlined onClick={handleClear} />
        }}
        suffix={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={toggleMobileSearch}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        }
      />
    </div>
  );

  return (
    <>
      <SocketComponent />
      <Header
        className={`theme-transition ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
        style={{
          background: isDarkMode ? '#101828' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: screens.xs ? '0 12px' : '0 24px',
          height: '75px',
          boxShadow: isDarkMode ? '0 1px 2px 0 rgba(0, 0, 0, 0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          color: isDarkMode ? 'var(--text-color)' : 'inherit',
          borderBottom: `1px solid ${isDarkMode ? '#333' : 'transparent'}`
        }}
      >
        {/* Left Side - Logo and Menu Button */}
        {!showMobileSearch && (
          <Flex align="center" style={{ height: '100%' }}>
            {!screens.md && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={showDrawer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '0 12px',
                  color: isDarkMode ? 'var(--text-color)' : 'inherit'
                }}
              />
            )}
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                lineHeight: 0 // This prevents extra space below the image
              }}
            >
              <Image
                src={filteredLogo?.logo ? `${baseURL}${filteredLogo.logo}` : "/images/logo.png"}
                width={!screens.md ? 70 : 120}
                height={!screens.md ? 30 : 50} // Set an appropriate height based on screen size
                alt='logo'
                style={{
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto',
                  maxHeight: '100%', // Ensures it doesn't exceed container height
                  filter: isDarkMode ? 'brightness(0.9) contrast(1.1)' : 'none'
                }}
              />
            </Link>
          </Flex>
        )}

        {/* Middle - Search Bar */}
        {screens.md ? renderDesktopSearch() : (showMobileSearch && renderMobileSearch())}

        {/* Right Side Actions */}
        {!showMobileSearch && (
          <Flex align="center" gap="middle" style={{ height: '100%' }}>
            {screens.md ? (
              <>
                <Button
                  onClick={() => handleNavigation('/new')}
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px'
                  }}
                >
                  {screens.lg ? 'New Post' : ''}
                </Button>

                <Badge style={{ backgroundColor: "#2930FF", marginTop: "5px", marginRight: "5px" }} count={chats?.unreadCount === 0 ? 0 : chats?.unreadCount}>
                  <Button
                    onClick={() => handleNavigation("/chat")}
                    type="text"
                    icon={isDarkMode ? <MessageDark /> : <MessageLight />}
                    style={iconButtonStyles}
                  />
                </Badge>

                <Badge style={{ backgroundColor: "#2930FF", marginTop: "5px", marginRight: "5px" }} count={notifications?.unreadCount || 0}>
                  <Button
                    onClick={() => handleNavigation("/notification")}
                    type="text"
                    icon={isDarkMode ? <NotificationDark /> : <NotificationLight />}
                    style={iconButtonStyles}
                  />
                </Badge>
              </>
            ) : (
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={toggleMobileSearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '0 12px',
                  color: isDarkMode ? 'var(--text-color)' : 'inherit'
                }}
              />
            )}

            {

              localStorage.getItem('isLoggedIn') === 'true' ? (
                <Dropdown
                  menu={{ items }}
                  trigger={['click']}
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px' }}>
                    <Avatar
                      src={getImageUrl(data?.data?.profile)}
                      size={44}
                      style={{
                        cursor: 'pointer',
                        border: isDarkMode ? '1px solid #333' : 'none'
                      }}
                    />
                  </div>
                </Dropdown>
              ) : (
                <Button type="primary" style={{ height: "38px", width: "100px" }} onClick={() => router.push('/auth/login')}>Sign In</Button>
              )

            }


            {/* <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px' }}>
                <Avatar
                  src={getImageUrl(data?.data?.profile)}
                  size={44}
                  style={{
                    cursor: 'pointer',
                    border: isDarkMode ? '1px solid #333' : 'none'
                  }}
                />
              </div>
            </Dropdown> */}
          </Flex>
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={onClose}
        open={drawerVisible}
        width={250}
        className={`theme-transition ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      >
        <Menu
          mode="inline"
          theme={isDarkMode ? "dark" : "light"}
          items={[
            {
              key: 'new-post',
              icon: <PlusOutlined />,
              label: 'New Post',
              onClick: () => handleNavigation("/new")
            },
            {
              key: 'messages',
              icon: <MessageOutlined />,
              label: 'Messages',
              onClick: () => handleNavigation('/chat')
            },
            {
              key: 'notifications',
              icon: <IoNotificationsSharp />,
              label: 'Notifications',
              onClick: () => handleNavigation('/notification')
            },
            {
              type: 'divider',
            },
            ...items
              .filter(item => item.key !== 'profile-header')
              .map(item => ({
                ...item,
                onClick: item.onClick || (() => { })
              }))
          ]}
        />
      </Drawer>
    </>
  );
}
