"use client";
import { useCategoriesQuery, useSubCategoriesQuery } from '@/features/Category/CategoriesApi';
import { useCreatePostMutation, useEditPostMutation } from '@/features/post/postApi';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Grid,
  Input,
  Row,
  Select,
  Space,
  Typography,
  Upload
} from 'antd';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { baseURL } from '../../../utils/BaseURL';
import { ThemeContext } from '../ClientLayout';

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const BlogPostForm = ({ initialValues, isEditing = false, onSuccess, postId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [initialImages, setInitialImages] = useState([]);
  const editorRef = useRef(null);
  const router = useRouter();
  const screens = useBreakpoint();
  const { isDarkMode } = useContext(ThemeContext);

  // API hooks
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const { data: categoryData } = useCategoriesQuery();
  const { data: subcategoryData, isLoading: isSubcategoriesLoading } = useSubCategoriesQuery(category);
  const [editPost] = useEditPostMutation();

  // Responsive breakpoints
  const isMobile = !screens.md;

  // Memoized category options
  const categoryOptions = useMemo(() => (
    categoryData?.data?.result?.map(item => ({
      value: item.category._id,
      label: item.category.name
    })) || []
  ), [categoryData]);

  const getSubcategories = useMemo(() => {
    if (!category || !subcategoryData?.data?.length) return [];
    return subcategoryData.data.map(sub => ({
      value: sub._id,
      label: sub.name
    }));
  }, [category, subcategoryData]);

  const joditConfig = useMemo(() => ({
    height: isMobile ? 300 : 400,
    placeholder: "Write your post description here...",
    theme: isDarkMode ? 'dark' : 'default',
    buttons: ['bold', 'italic', 'underline', '|', 'ul', 'ol'],
    buttonsMD: ['bold', 'italic', 'underline', '|', 'ul', 'ol'],
    buttonsSM: ['bold', 'italic', 'underline', '|', 'ul', 'ol'],
    buttonsXS: ['bold', 'italic', 'underline', '|', 'ul', 'ol'],
    extraPlugins: ['list'],
    style: {
      padding: "20px",
      backgroundColor: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#e5e7eb' : '#374151',
      'ol': {
        listStyleType: 'decimal',
        paddingLeft: '20px',
      },
      'ol[type="a"]': { listStyleType: 'lower-alpha' },
      'ol[type="g"]': { listStyleType: 'lower-greek' },
    },
    toolbarAdaptive: false,
    toolbarSticky: true,
    showCharsCounter: true,
    showWordsCounter: true,
  }), [isMobile, isDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      const style = document.createElement('style');
      style.id = 'jodit-dark-mode-styles';
      style.innerHTML = `
        .jodit-container.jodit-dark-theme,
        .jodit-container.jodit-dark-theme .jodit-workplace,
        .jodit-container.jodit-dark-theme .jodit-wysiwyg {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        .jodit-dark-theme .jodit-toolbar__box {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        .jodit-dark-theme .jodit-toolbar {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        .jodit-dark-theme .jodit-wysiwyg {
          color: #e5e7eb !important;
        }
        .dark-editor .jodit-container {
          border-color: #4b5563 !important;
        }
        /* Toolbar styling */
        .jodit-toolbar__box {
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
        }
        .jodit-toolbar-button {
          flex-shrink: 0 !important;
        }
        /* Force ol with decimal numbers */
        .jodit-wysiwyg ol {
          list-style-type: decimal !important;
          padding-left: 20px !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        const existingStyle = document.getElementById('jodit-dark-mode-styles');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [isDarkMode]);

  // Load draft data when component mounts
  useEffect(() => {
    if (!isEditing && !initialValues) {
      const savedDraft = localStorage.getItem('blogPostDraft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setTitle(draftData.title || '');
          setCategory(draftData.category || null);
          setSubcategory(draftData.subcategory || null);
          setDescription(draftData.description || '');
          if (draftData.files && draftData.files.length > 0) {
            setFileList(draftData.files.map(file => ({
              uid: file.uid || `-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              status: 'done',
              url: file.url,
              thumbUrl: file.url
            })));
          }
          toast.success('Draft loaded successfully');
        } catch (error) {
          console.error('Error loading draft:', error);
          localStorage.removeItem('blogPostDraft');
        }
      }
    }
  }, [isEditing, initialValues]);

  // Initialize form with initial values when editing
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setCategory(initialValues.category || null);
      setSubcategory(initialValues.subCategory || null);
      setDescription(initialValues.content || '');
      if (initialValues.images && Array.isArray(initialValues.images)) {
        const initialImagesList = initialValues.images.map((image, index) => {
          const imageUrl = image.startsWith('http')
            ? image
            : `${baseURL}${image}`;
          return {
            uid: `-${index}`,
            name: `image-${index}`,
            status: 'done',
            url: imageUrl,
            thumbUrl: imageUrl,
            path: image
          };
        });
        setFileList(initialImagesList);
        setInitialImages(initialImagesList);
      } else if (initialValues.image) {
        const imageUrl = initialValues.image.startsWith('http')
          ? initialValues.image
          : `${baseURL}${initialValues.image}`;
        const initialImage = [{
          uid: '-1',
          name: 'current-image',
          status: 'done',
          url: imageUrl,
          thumbUrl: imageUrl,
          path: initialValues.image
        }];
        setFileList(initialImage);
        setInitialImages(initialImage);
      }
    }
  }, [initialValues]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (formErrors.title) {
      setFormErrors({ ...formErrors, title: null });
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setSubcategory(null);
    if (formErrors.category) {
      setFormErrors({ ...formErrors, category: null });
    }
  };

  const handleSubcategoryChange = (value) => {
    setSubcategory(value);
    if (formErrors.subcategory) {
      setFormErrors({ ...formErrors, subcategory: null });
    }
  };

  const handleDescriptionChange = (newContent) => {
    setDescription(newContent);
    if (formErrors.description) {
      setFormErrors({ ...formErrors, description: null });
    }
  };

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

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      subcategory,
      description,
      files: fileList.map(file => ({
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url || file.thumbUrl
      }))
    };
    localStorage.setItem('blogPostDraft', JSON.stringify(draftData));
    toast.success('Draft saved successfully');
  };

  const handleClearDraft = () => {
    localStorage.removeItem('blogPostDraft');
    setTitle('');
    setCategory(null);
    setSubcategory(null);
    setDescription('');
    setFileList([]);
    toast.success('Draft cleared successfully');
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    if (!category) {
      errors.category = 'Category is required';
    }
    if (category && getSubcategories.length > 0 && !subcategory) {
      errors.subcategory = 'Subcategory is required';
    }
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (formErrors.title) {
        toast.error('Please enter a title');
      } else if (formErrors.category) {
        toast.error('Please select a category');
      } else if (formErrors.subcategory) {
        toast.error('Please select a subcategory');
      } else if (formErrors.description) {
        toast.error('Please enter content description');
      }
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      if (subcategory) formData.append('subCategory', subcategory);
      formData.append('content', description);

      if (isEditing && postId) {
        const deletedImages = [];
        initialImages.forEach(initialImage => {
          const stillExists = fileList.some(file =>
            file.path === initialImage.path ||
            file.url === initialImage.url
          );
          if (!stillExists) {
            deletedImages.push(initialImage.path);
          }
        });
        if (deletedImages.length > 0) {
          formData.append('deletedImages', JSON.stringify(deletedImages));
        }
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append('image', file.originFileObj);
          }
        });
      } else {
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append('image', file.originFileObj);
          }
        });
      }

      const response = isEditing && postId
        ? await editPost({ id: postId, body: formData }).unwrap()
        : await createPost(formData).unwrap();

      toast.success(isEditing ? 'Post updated successfully' : 'Post created successfully');

      if (!isEditing) {
        router.push('/');
        localStorage.removeItem('blogPostDraft');
      }

      if (onSuccess) onSuccess();

      if (!isEditing) {
        setTitle('');
        setCategory(null);
        setSubcategory(null);
        setDescription('');
        setFileList([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error.data?.message ||
        (isEditing ? 'Failed to update post' : 'Failed to create post')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-4 sm:py-8 px-2 sm:px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <Card
          className={`rounded-xl shadow-lg border-0 overflow-hidden transition-colors duration-200 ${isEditing ? 'border-0 shadow-none' : ''} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          {!isEditing && (
            <div className="">
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
            {/* Title Input */}
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
                className={`py-2 sm:py-3 px-4 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300'} ${formErrors.title ? 'border-red-500' : ''}`}
                size={isMobile ? "middle" : "large"}
                status={formErrors.title ? "error" : ""}
              />
              {formErrors.title && (
                <div className="text-red-500 mt-1 text-sm">{formErrors.title}</div>
              )}
            </div>
            {/* Category and Subcategory Selectors */}
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
            {/* Content Editor */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Description <span className="text-red-500">*</span>
              </Title>
              <Card
                className={`border rounded-lg overflow-hidden hover:border-blue-300 transition-all p-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${formErrors.description ? 'border-red-500' : ''}`}
                bodyStyle={{ padding: 0 }}
              >
                <div className={`${isDarkMode ? 'jodit-dark-theme' : ''}`}>
                  <JoditEditor
                    ref={editorRef}
                    value={description}
                    config={joditConfig}
                    tabIndex={1}
                    onBlur={handleDescriptionChange}
                    className={isDarkMode ? 'jodit-dark-mode' : ''}
                  />
                </div>
              </Card>
              {formErrors.description && (
                <div className="text-red-500 mt-1 text-sm">{formErrors.description}</div>
              )}
            </div>
            {/* Image Upload */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Featured Images <span className="text-xs font-normal">(Maximum 3)</span></Title>
              <Card
                className={`border-2 border-dashed rounded-xl hover:border-blue-400 transition-all text-center cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
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
            {/* Form Actions */}
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
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogPostForm;