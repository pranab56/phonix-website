import { Input, Typography } from 'antd';

const { Title } = Typography;

const TitleInput = ({ 
  title, 
  handleTitleChange, 
  isDarkMode, 
  isMobile, 
  formErrors 
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Title <span className="text-red-500">*</span>
      </Title>
      <Input
        placeholder="Write your post title here..."
        value={title}
        onChange={handleTitleChange}
        maxLength={300}
        suffix={`${title.length}/300`}
        className={`py-2 sm:py-3 px-4 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors ${
          isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300'
        } ${formErrors.title ? 'border-red-500' : ''}`}
        size={isMobile ? "middle" : "large"}
        status={formErrors.title ? "error" : ""}
      />
      {formErrors.title && (
        <div className="text-red-500 mt-1 text-sm">{formErrors.title}</div>
      )}
    </div>
  );
};

export default TitleInput;