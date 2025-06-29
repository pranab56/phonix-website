import { useCategoriesQuery, useSubCategoriesQuery } from '@/features/Category/CategoriesApi';
import { useCreatePostMutation, useEditPostMutation } from '@/features/post/postApi';
import { Grid } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ThemeContext } from '../../../app/ClientLayout';
import { baseURL } from '../../../../utils/BaseURL';


const { useBreakpoint } = Grid;

export const useBlogPostForm = ({ initialValues, isEditing = false, onSuccess, postId }) => {
  // State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [initialImages, setInitialImages] = useState([]);

  // Refs and context
  const editorRef = useRef(null);
  const router = useRouter();
  const screens = useBreakpoint();
  const { isDarkMode } = useContext(ThemeContext);

  // API hooks
  const [createPost] = useCreatePostMutation();
  const [editPost] = useEditPostMutation();
  const { data: categoryData } = useCategoriesQuery();
  const { data: subcategoryData, isLoading: isSubcategoriesLoading } = useSubCategoriesQuery(category);

  // Computed values
  const isMobile = !screens.md;

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

  // Handlers
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

  return {
    // State
    title,
    category,
    subcategory,
    description,
    fileList,
    loading,
    formErrors,
    initialImages,

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
  };
};