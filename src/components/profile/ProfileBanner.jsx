"use client";
import { useGetProfileQuery, useUpdateProfileMutation } from '@/features/profile/profileApi';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Grid, Input, message, Modal, Row, Spin, Upload } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { getImageUrl } from '../../../utils/getImageUrl';
import { ThemeContext } from '../../app/ClientLayout';


const ProfileBanner = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { data, error, isLoading: profileLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: updateProfileLoading }] = useUpdateProfileMutation();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (isModalOpen && data?.data) {
      form.setFieldsValue({
        name: data.data.name || data.data.userName,
        email: data.data.email,
        contact: data.data.contact || '',
      });
    }
  }, [data, isModalOpen, form]);

  const showModal = () => {
    setFileList([]);
    if (data?.data) {
      form.setFieldsValue({
        name: data.data.name || data.data.userName,
        email: data.data.email,
        contact: data.data.contact || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.contact) {
        formData.append('contact', values.contact);
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const response = await updateProfile(formData).unwrap();

      if (response.success) {
        message.success("Profile updated successfully");
        setIsModalOpen(false);
      } else {
        message.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error(error.data?.message || "Failed to update profile");
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return Upload.LIST_IGNORE;
      }

      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    fileList,
    maxCount: 1,
    listType: 'picture-card',
    accept: 'image/*'
  };

  if (profileLoading) {
    return (
      <div className={`pt-20 pb-10 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'}`}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pt-20 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'}`}>
        Error loading profile
      </div>
    );
  }

  return (
    <div className={`pt-20 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'}`}>
      <div className={`rounded-lg w-full max-w-7xl shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
                <img
                  src={getImageUrl(data?.data?.profile)}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="flex-1"></div>
          <button
            onClick={showModal}
            className={`
              ${isMobile ? 'px-3 py-1.5 rounded-md' : 'px-4 py-2 rounded-md'}
              bg-primary transition-colors cursor-pointer
              text-white flex items-center justify-center gap-4
              shadow-sm
            `}
            aria-label="Edit profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.99952 10L3.84252 16.162C3.60992 16.3944 3.43819 16.6805 3.34252 16.995L2.02052 21.355C1.9943 21.4415 1.99202 21.5335 2.01392 21.6212C2.03583 21.7089 2.08109 21.789 2.1449 21.853C2.20871 21.917 2.28869 21.9626 2.37631 21.9847C2.46394 22.0069 2.55593 22.0049 2.64252 21.979L7.00052 20.656C7.31399 20.5599 7.59902 20.3882 7.83052 20.156L13.9995 13.982" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.8291 7.17153L17.1881 2.82553C17.4498 2.5638 17.7605 2.35619 18.1025 2.21455C18.4445 2.0729 18.811 2 19.1811 2C19.5512 2 19.9177 2.0729 20.2597 2.21455C20.6017 2.35619 20.9124 2.5638 21.1741 2.82553C21.4358 3.08725 21.6434 3.39796 21.7851 3.73992C21.9267 4.08188 21.9996 4.44839 21.9996 4.81853C21.9996 5.18866 21.9267 5.55517 21.7851 5.89713C21.6434 6.23909 21.4358 6.5498 21.1741 6.81153L16.8211 11.1645" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 5L19 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 2L22 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-base font-medium">Edit Profile</span>
          </button>
        </div>

        <div className="text-center pb-10">
          <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {data?.data?.name || data?.data?.userName}
          </h2>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {data?.data?.name ? "@" + data?.data?.userName : data?.data?.email}
          </p>
        </div>
      </div>

      <Modal
        title="Edit Profile Information"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={isMobile ? "95%" : 520}
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Form
          form={form}
          layout="vertical"
          className={isDarkMode ? 'dark-form' : ''}
        >
          <Form.Item label="Profile Picture" className={isDarkMode ? 'text-white' : ''}>
            <Row gutter={16} align="middle">
              {fileList.length === 0 && (
                <Col xs={24} sm={8} lg={6}>
                  <div className="flex justify-center">
                    <img
                      src={getImageUrl(data?.data?.profile)}
                      alt="Current profile"
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  </div>
                  <div className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Current profile image
                  </div>
                </Col>
              )}

              <Col xs={24} sm={16} lg={18}>
                <Upload {...uploadProps}>
                  {fileList.length === 0 && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : ''}`}>
                      <PlusOutlined className={isDarkMode ? 'text-white' : ''} />
                      <div style={{ marginTop: 8 }} className={isDarkMode ? 'text-white' : ''}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            name="name"
            label={<span className={isDarkMode ? 'text-white' : ''}>Full Name*</span>}
            rules={[
              { required: true, message: 'Please enter your name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input placeholder='Name' className={isDarkMode ? 'bg-gray-600 text-white border-gray-500' : ''} />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className={isDarkMode ? 'text-white' : ''}>Email</span>}
          >
            <Input disabled className={isDarkMode ? 'bg-gray-600 text-gray-300 border-gray-500' : ''} />
          </Form.Item>

          <Form.Item
            name="contact"
            label={<span className={isDarkMode ? 'text-white' : ''}>Phone</span>}
            rules={[
              { pattern: /^[0-9+]+$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input
              placeholder='Phone Number'
              className={isDarkMode ? 'bg-gray-600 text-white border-gray-500' : ''}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              onClick={handleUpdate}
              loading={updateProfileLoading}
              style={{ backgroundColor: '#1C37E0', height: '42px' }}
            >
              {updateProfileLoading ? 'Updating...' : 'Update Info'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileBanner;
