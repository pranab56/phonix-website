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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { baseURL } from '../../../utils/BaseURL';
import { ThemeContext } from '../ClientLayout';

// Froala Editor imports
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/themes/dark.min.css';
import FroalaEditor from 'react-froala-wysiwyg';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const BlogPostForm = ({ initialValues, isEditing = false, onSuccess, postId, refetchPosts, myCommentPostRefetch }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [initialImages, setInitialImages] = useState([]);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Add key for force re-render
  const editorRef = useRef(null);
  const router = useRouter();
  const screens = useBreakpoint();
  const { isDarkMode } = useContext(ThemeContext);

  // API hooks
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const { data: categoryData } = useCategoriesQuery();
  const { data: subcategoryData, isLoading: isSubcategoriesLoading } = useSubCategoriesQuery(category, {
    skip: !category,
    refetchOnMountOrArgChange: true,
    tagTypes: ['subcategory']
  });
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

  // Initialize Froala Editor when component mounts
  useEffect(() => {
    const loadFroala = async () => {
      try {
        await import('froala-editor/js/froala_editor.pkgd.min.js');
        await import('froala-editor/js/plugins/lists.min.js');
        setEditorInitialized(true);
      } catch (error) {
        console.error('Failed to load Froala Editor:', error);
      }
    };

    loadFroala();

    return () => {
      if (editorRef.current && editorRef.current.editor) {
        editorRef.current.editor.destroy();
      }
    };
  }, []);

  // Force re-render editor when theme changes
  useEffect(() => {
    if (editorInitialized) {
      setEditorKey(prev => prev + 1);
    }
  }, [isDarkMode, editorInitialized]);

  // Froala Editor Configuration
  const froalaConfig = useMemo(() => ({
    placeholderText: 'Write your post description here...',
    heightMin: isMobile ? 300 : 400,
    toolbarButtons: [
      ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertImage', 'emoticons']
    ],
    pluginsEnabled: ['lists', 'emoticons', 'image'],
    quickInsertTags: [],
    listAdvancedTypes: true,
    listStyles: {
      'fr-list-style-1': 'Circle',
      'fr-list-style-2': 'Square',
      'fr-list-style-3': 'Decimal',
      'fr-list-style-4': 'Lower Alpha',
      'fr-list-style-5': 'Upper Alpha',
      'fr-list-style-6': 'Lower Roman',
      'fr-list-style-7': 'Upper Roman'
    },
    theme: isDarkMode ? 'dark' : 'default',
    colorsBackground: isDarkMode ?
      ['#1f2937', '#111827', '#374151', '#4b5563', '#6b7280'] :
      ['#FFFFFF', '#F5F5F5', '#DDDDDD', '#CCCCCC', '#BBBBBB'],
    colorsText: isDarkMode ?
      ['#ffffff', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'] :
      ['#000000', '#333333', '#666666', '#999999', '#cccccc'],
    toolbarSticky: true,
    toolbarStickyOffset: 0,
    toolbarVisibleWithoutSelection: true,
    charCounterCount: true,
    wordCounterCount: true,
    pastePlain: true,
    pasteDeniedTags: ['script', 'iframe', 'style'],
    pasteDeniedAttrs: ['style', 'class'],
    pasteAllowedStyleProps: [],
    pasteKeepFormatting: false,
    pasteConvertWordHeadingToParagraph: true,
    pasteRemoveStyles: true,
    pasteRemoveEmptyTags: true,
    imageUploadURL: `${baseURL}/upload`,
    imageUploadMethod: 'POST',
    imageMaxSize: 5 * 1024 * 1024,
    imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif'],
    events: {
      'contentChanged': function () {
        try {
          const content = this.html.get();
          setDescription(content);
          if (formErrors.description) {
            setFormErrors(prev => ({ ...prev, description: null }));
          }
        } catch (error) {
          console.error('Error in contentChanged:', error);
        }
      },
      'initialized': function () {
        try {
          if (description) {
            this.html.set(description);
          }
          // Apply dark mode class after initialization
          if (isDarkMode) {
            this.$el.addClass('fr-dark-mode');
            this.$tb.addClass('fr-dark-mode');
          }
        } catch (error) {
          console.error('Error in editor initialization:', error);
        }
      }
    },
    license: false,
  }), [isMobile, isDarkMode, description, formErrors.description]);

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
      setFormErrors(prev => ({ ...prev, title: null }));
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setSubcategory(null);
    if (formErrors.category) {
      setFormErrors(prev => ({ ...prev, category: null }));
    }
  };

  const handleSubcategoryChange = (value) => {
    setSubcategory(value);
    if (formErrors.subcategory) {
      setFormErrors(prev => ({ ...prev, subcategory: null }));
    }
  };

  const handleDescriptionChange = (newContent) => {
    setDescription(newContent);
    if (formErrors.description) {
      setFormErrors(prev => ({ ...prev, description: null }));
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    const validFiles = newFileList.filter(file => {
      return file.status !== 'error';
    }).slice(0, 3);

    setFileList(validFiles);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Only image files can be uploaded!');
      return Upload.LIST_IGNORE;
    }

    const fileSizeInMB = file.size / 1024 / 1024;
    if (fileSizeInMB > 500) {
      toast.success(`Uploading large files (${fileSizeInMB.toFixed(2)} MB). Please wait...`);
    }

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

      if (isEditing && response.success) {
        refetchPosts();
        myCommentPostRefetch()
      }
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
    <>
      {/* Custom CSS for Froala Dark Mode */}
      <style jsx global>{`
        /* Froala Dark Mode Styles */
        .fr-dark-mode .fr-wrapper {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        
        .fr-dark-mode .fr-element {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        
        .fr-dark-mode .fr-placeholder {
          color: #9ca3af !important;
        }
        
        .fr-dark-mode .fr-toolbar {
          background-color: #111827 !important;
        }
        
        .fr-dark-mode .fr-command.fr-btn {
          background-color: transparent !important;
          color: #e5e7eb !important;
        }
        
        .fr-dark-mode .fr-command.fr-btn:hover {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
        
        .fr-dark-mode .fr-command.fr-btn.fr-active {
          background-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        .fr-dark-mode .fr-separator {
          background-color: #374151 !important;
        }
        
        .fr-dark-mode .fr-popup {
          background-color: #111827 !important;
          
          color: #e5e7eb !important;
        }
        
        .fr-dark-mode .fr-dropdown-menu {
          background-color: #111827 !important;
          border-color: #374151 !important;
        }
        
        .fr-dark-mode .fr-dropdown-menu .fr-dropdown-item {
          color: #e5e7eb !important;
        }
        
        .fr-dark-mode .fr-dropdown-menu .fr-dropdown-item:hover {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
        
        .fr-dark-mode .fr-counter {
          background-color: #111827 !important;
          color: #9ca3af !important;
        }
        
        .fr-dark-mode .fr-box {
          
        }
        
        .fr-dark-mode .fr-second-toolbar {
          
          
        }
        
        .fr-dark-mode .fr-tooltip {
          background-color: #111827 !important;
   
        }
        
        /* Light mode ensuring clean override */
        .fr-wrapper:not(.fr-dark-mode) {
          background-color: #ffffff !important;
          color: #1f2937 !important;
          border-color: #d1d5db !important;
        }
        
        .fr-element:not(.fr-dark-mode) {
          background-color: #ffffff !important;
          color: #1f2937 !important;
        }
        
        .fr-toolbar:not(.fr-dark-mode) {
          background-color: #f9fafb !important;
          border-color: #d1d5db !important;
        }
        
        .fr-command.fr-btn:not(.fr-dark-mode) {
          color: #1f2937 !important;
        }
        
        .fr-command.fr-btn:not(.fr-dark-mode):hover {
          background-color: #f3f4f6 !important;
        }
        
        /* Force editor theme based on container class */
        .froala-editor-container.dark .fr-wrapper,
        .froala-editor-container.dark .fr-element {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        
        .froala-editor-container.dark .fr-toolbar {
          background-color: #111827 !important;
          border-color: #374151 !important;
        }
        
        .froala-editor-container.dark .fr-command.fr-btn {
          color: #e5e7eb !important;
        }
        
        .froala-editor-container.dark .fr-command.fr-btn:hover {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
        
        .froala-editor-container.dark .fr-command.fr-btn.fr-active {
          background-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        .froala-editor-container.dark .fr-placeholder {
          color: #9ca3af !important;
        }
        
        .froala-editor-container.dark .fr-counter {
          background-color: #111827 !important;
          color: #9ca3af !important;
        }
      `}</style>

      <div className={`min-h-screen ${isEditing ? '' : 'py-4 sm:py-8 px-2 sm:px-4'}  transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
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
            <div className={`${!isEditing && 'py-4 sm:p-6'}`}>
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
                      popupClassName={isDarkMode ? 'dark-dropdown' : ''}
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
                      popupClassName={isDarkMode ? 'dark-dropdown' : ''}
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
                <div
                  className={`froala-editor-container ${isDarkMode ? 'dark' : 'light'} rounded-lg overflow-hidden transition-all ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${formErrors.description ? 'border-red-500' : ''}`}
                >
                  {editorInitialized && (
                    <FroalaEditor
                      key={editorKey} // Force re-render when theme changes
                      tag='textarea'
                      config={froalaConfig}
                      ref={editorRef}
                      onModelChange={handleDescriptionChange}
                      model={description}
                    />
                  )}
                </div>
                {formErrors.description && (
                  <div className="text-red-500 mt-1 text-sm">{formErrors.description}</div>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-6 sm:mb-8">
                <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Featured Images <span className="text-xs font-normal">(Maximum 3)</span>
                </Title>
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
    </>
  );
};

export default BlogPostForm;