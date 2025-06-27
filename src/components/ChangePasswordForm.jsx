import { useChangePasswordMutation } from '@/features/auth/authApi';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Form, Input, message, notification } from 'antd';
import { useContext } from 'react';
import { ThemeContext } from '../app/ClientLayout';

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { isDarkMode } = useContext(ThemeContext);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    try {
      const response = await changePassword(values).unwrap();
      messageApi.success("Password changed successfully!");
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.data?.message || 'Failed to change password. Please try again.',
        placement: 'topRight',
      });
    }
  };

  // Strong password validation function
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(''));
    }

    // Password requirements
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;

    let errorMessage = '';
    if (!isLongEnough) errorMessage = 'Password must be at least 8 characters long. ';
    if (!hasUpperCase) errorMessage += 'Include at least one uppercase letter. ';
    if (!hasLowerCase) errorMessage += 'Include at least one lowercase letter. ';
    if (!hasNumber) errorMessage += 'Include at least one number. ';
    if (!hasSpecialChar) errorMessage += 'Include at least one special character (!@#$%^&*).';

    if (errorMessage) {
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.resolve();
  };

  return (
    <>
      {contextHolder}
      <div className={`rounded-lg p-6 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Current Password</span>}
            name="currentPassword"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password
              placeholder="••••••••••"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
            />
          </Form.Item>

          <Form.Item
            label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>New Password</span>}
            name="newPassword"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { validator: validatePassword }
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="••••••••••"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
            />
          </Form.Item>

          <Form.Item
            label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Confirm Password</span>}
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="••••••••••"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={`w-full h-12 text-base font-medium transition-color`}
              loading={isLoading}
              disabled={isLoading}
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ChangePasswordForm;