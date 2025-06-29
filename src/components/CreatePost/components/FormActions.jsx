import { SaveOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space } from 'antd';

const FormActions = ({
  initialValues,
  isEditing,
  isMobile,
  isDarkMode,
  loading,
  handleSaveDraft,
  handleClearDraft,
  handleSubmit
}) => {
  return (
    <Row justify="end" gutter={[8, 8]}>
      <Col>
        {!initialValues && (
          <Space>
            <Button
              icon={<SaveOutlined />}
              size={isMobile ? "middle" : "large"}
              className={`flex items-center ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800'}`}
              onClick={handleSaveDraft}
            >
              {isMobile ? 'Save' : 'Save draft'}
            </Button>
            {localStorage.getItem('blogPostDraft') && (
              <Button
                danger
                size={isMobile ? "middle" : "large"}
                onClick={handleClearDraft}
              >
                {isMobile ? 'Clear' : 'Clear draft'}
              </Button>
            )}
          </Space>
        )}
      </Col>
      <Col>
        <Button
          type="primary"
          size={isMobile ? "middle" : "large"}
          className="border-0 shadow-md hover:shadow-lg"
          onClick={handleSubmit}
          loading={loading}
        >
          {isEditing
            ? (isMobile ? 'Update' : 'Update Post')
            : (isMobile ? 'Publish' : 'Publish Post')
          }
        </Button>
      </Col>
    </Row>
  );
};

export default FormActions;