import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Typography, Upload } from 'antd';
import toast from 'react-hot-toast';

const { Title } = Typography;

const FileUpload = ({
  fileList,
  setFileList,
  isMobile,
  isDarkMode
}) => {
  const handleFileChange = ({ fileList: newFileList }) => {
    // Filter out any files with errors and limit to 3 files
    const validFiles = newFileList.filter(file => {
      // Keep existing files and new files that are not in error state
      return file.status !== 'error';
    }).slice(0, 3);

    setFileList(validFiles);
  };

  const beforeUpload = (file) => {
    // Check if it's an image
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Only image files can be uploaded!');
      return Upload.LIST_IGNORE; // This prevents the file from being added to the list
    }

    // Show message for large files but don't block them
    const fileSizeInMB = file.size / 1024 / 1024;
    if (fileSizeInMB > 500) {
      toast.success(`Uploading large files (${fileSizeInMB.toFixed(2)} MB). Please wait...`);
    }

    // Return false to prevent automatic upload but allow file to be added to list
    return false;
  };

  return (
    <div className="mb-6 sm:mb-8">
      <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Featured Images <span className="text-xs font-normal">(Maximum 3)</span>
      </Title>
      <Card
        className={`border-2 border-dashed rounded-xl hover:border-blue-400 transition-all text-center cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
          }`}
      >
        <Upload
          accept="image/*"
          listType={isMobile ? "picture" : "picture-card"}
          fileList={fileList}
          onChange={handleFileChange}
          onPreview={false}
          beforeUpload={beforeUpload}
          className="flex justify-center"
          maxCount={3}
        >
          {fileList.length < 3 && (
            isMobile ? (
              <Button
                icon={<UploadOutlined />}
                size="middle"
                className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}
              >
                Add Photos
              </Button>
            ) : (
              <div className={`flex flex-col items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <UploadOutlined className="text-2xl mb-2" />
                <p>Upload</p>
                <p>Max 500MB</p>
              </div>
            )
          )}
        </Upload>
      </Card>
    </div>
  );
};

export default FileUpload;