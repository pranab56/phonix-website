import { useDeleteAccountMutation } from '@/features/profile/profileApi';
import { Button, Input, Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { ThemeContext } from '../app/ClientLayout';

const CloseAccountSection = () => {
  const [password, setPassword] = useState('');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const router = useRouter();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const { isDarkMode } = useContext(ThemeContext);

  const showConfirm = () => {
    setIsPasswordModalVisible(true); // Show the modal for entering the password
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Handle the password input change
  };

  const handleAccountDeletion = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      await deleteAccount({ password: password }).unwrap();
      toast.success("Your Account deleted successfully")
      router.push("/auth/login")
    } catch (error) {
      toast.error(error.data.message)
    }
  };

  return (
    <div className={`rounded-lg p-6 shadow-sm ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h3 className="text-lg font-medium mb-1">Close your account</h3>
      <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Once you delete your account, there's no going back. Please be certain!
      </p>
      <Button
        danger
        onClick={showConfirm}
        className="h-12 px-6 font-medium"
      >
        Delete Account
      </Button>

      {/* Password Modal */}
      <Modal
        centered
        title="Please confirm your password"
        open={isPasswordModalVisible}
        onOk={handleAccountDeletion}
        onCancel={() => setIsPasswordModalVisible(false)}
        confirmLoading={isLoading}
        okText="Delete Account"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Input.Password
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
          required
        />
      </Modal>
    </div>
  );
};

export default CloseAccountSection;