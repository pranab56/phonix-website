import { Col, Row, Select, Typography } from 'antd';

const { Title } = Typography;

const CategorySelectors = ({
  category,
  subcategory,
  categoryOptions,
  getSubcategories,
  isSubcategoriesLoading,
  isDarkMode,
  isMobile,
  formErrors,
  handleCategoryChange,
  handleSubcategoryChange
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Category <span className="text-red-500">*</span>
          </Title>
          <Select
            placeholder="Select a category"
            value={category}
            onChange={handleCategoryChange}
            className={`w-full ${isDarkMode ? 'ant-select-dark' : ''} ${formErrors.category ? 'border-red-500 ant-select-status-error' : ''}`}
            size={isMobile ? "middle" : "large"}
            options={categoryOptions}
            dropdownClassName={isDarkMode ? 'dark-dropdown' : ''}
            status={formErrors.category ? "error" : ""}
          />
          {formErrors.category && (
            <div className="text-red-500 mt-1 text-sm">{formErrors.category}</div>
          )}
        </Col>
        <Col xs={24} md={12}>
          <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Subcategory <span className="text-red-500">*</span>
          </Title>
          <Select
            placeholder={
              isSubcategoriesLoading ? "Loading..." :
                !category ? "Select a category first" :
                  getSubcategories.length === 0 ? "No subcategories available" :
                    "Select a subcategory"
            }
            value={subcategory}
            onChange={handleSubcategoryChange}
            className={`w-full ${isDarkMode ? 'ant-select-dark' : ''} ${formErrors.subcategory ? 'border-red-500 ant-select-status-error' : ''}`}
            size={isMobile ? "middle" : "large"}
            options={getSubcategories}
            disabled={!category || getSubcategories.length === 0 || isSubcategoriesLoading}
            notFoundContent={category && "No subcategories found"}
            dropdownClassName={isDarkMode ? 'dark-dropdown' : ''}
            status={formErrors.subcategory ? "error" : ""}
          />
          {formErrors.subcategory && (
            <div className="text-red-500 mt-1 text-sm">{formErrors.subcategory}</div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CategorySelectors;