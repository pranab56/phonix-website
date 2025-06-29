"use client";
import { Card } from 'antd';
import Image from 'next/image';
import CategorySelectors from './components/CategorySelectors';
import FileUpload from './components/FileUpload';
import FormActions from './components/FormActions';
import JoditEditorWrapper from './components/JoditEditorWrapper';
import TitleInput from './components/TitleInput';
import { useBlogPostForm } from './hooks/useBlogPostForm';

const BlogPostForm = ({ initialValues, isEditing = false, onSuccess, postId }) => {
  const {
    // State
    title,
    category,
    subcategory,
    description,
    fileList,
    loading,
    formErrors,

    // Computed
    isMobile,
    isDarkMode,
    categoryOptions,
    getSubcategories,
    isSubcategoriesLoading,
    editorRef,

    // Handlers
    handleTitleChange,
    handleCategoryChange,
    handleSubcategoryChange,
    handleDescriptionChange,
    handleSaveDraft,
    handleClearDraft,
    handleSubmit,
    setFileList
  } = useBlogPostForm({ initialValues, isEditing, onSuccess, postId });

  return (
    <div className={`min-h-screen py-4 sm:py-8 px-2 sm:px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
      <div className="w-full mx-auto">
        <Card
          className={`rounded-xl shadow-lg border-0 overflow-hidden transition-colors duration-200 ${isEditing ? 'border-0 shadow-none' : ''
            } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          {!isEditing && (
            <div>
              <Image
                src={"/images/create-post-image.png"}
                height={1000}
                width={1000}
                alt='Create post header image'
                priority
              />
            </div>
          )}

          <div className={`py-4 sm:p-6 ${isDarkMode ? 'dark-editor' : ''}`}>
            <TitleInput
              title={title}
              handleTitleChange={handleTitleChange}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              formErrors={formErrors}
            />

            <CategorySelectors
              category={category}
              subcategory={subcategory}
              categoryOptions={categoryOptions}
              getSubcategories={getSubcategories}
              isSubcategoriesLoading={isSubcategoriesLoading}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              formErrors={formErrors}
              handleCategoryChange={handleCategoryChange}
              handleSubcategoryChange={handleSubcategoryChange}
            />

            <JoditEditorWrapper
              description={description}
              handleDescriptionChange={handleDescriptionChange}
              editorRef={editorRef}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
              formErrors={formErrors}
            />

            <FileUpload
              fileList={fileList}
              setFileList={setFileList}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />

            <FormActions
              initialValues={initialValues}
              isEditing={isEditing}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
              loading={loading}
              handleSaveDraft={handleSaveDraft}
              handleClearDraft={handleClearDraft}
              handleSubmit={handleSubmit}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogPostForm;