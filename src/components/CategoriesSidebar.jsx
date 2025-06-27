"use client";

import { useCategoriesQuery } from '@/features/Category/CategoriesApi';
import { ChevronDown, UnorderedListOutlined } from 'lucide-react';
import Image from 'next/image';
import { useContext, useMemo, useState } from 'react';
import { baseURL } from '../../utils/BaseURL';
import { ThemeContext } from '../app/ClientLayout';
import './CategoriesSidebar.css';

const CategoriesSidebar = ({ onSelectCategory, selectedCategory, selectedSubCategory }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const { isDarkMode } = useContext(ThemeContext);
  const { data: categoryData, isLoading: categoryLoading } = useCategoriesQuery();

  // Memoize derived data
  const { categories, totalPosts } = useMemo(() => {
    const categories = categoryData?.data?.result || [];
    const reversedCategories = [...categories].reverse();
    const total = reversedCategories.reduce((total, item) => total + (item.category.postCount || 0), 0);
    return { categories: reversedCategories, totalPosts: total };
  }, [categoryData]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const selectCategory = (categoryId) => {
    const category = categories.find(item => item.category._id === categoryId);
    const hasSubcategories = category?.subcategories?.length > 0;

    onSelectCategory(categoryId, "");

    if (hasSubcategories) {
      toggleCategory(categoryId);
    }
  };

  const selectSubcategory = (categoryId, subcategoryId) => {
    onSelectCategory(categoryId, subcategoryId);
  };

  const handleShowAllPosts = () => {
    onSelectCategory("", "");
    setExpandedCategories({});
  };

  const renderCategoryIcon = (category, isSelected) => {
    const imageUrl = isDarkMode && category.darkImage ? category.darkImage : category.image;

    return imageUrl ? (
      <div className={`p-3 rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-white/20 text-white shadow-lg'
          : 'bg-white text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
      } shadow-sm group-hover:shadow-md`}>
        <Image
          src={`${baseURL}${imageUrl}`}
          alt={category?.name || "Category image"}
          width={20}
          height={20}
          className="object-contain"
        />
      </div>
    ) : (
      <div className={`p-3 rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-white/20 text-white shadow-lg'
          : 'bg-white text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
      } shadow-sm group-hover:shadow-md`}>
        <UnorderedListOutlined size={20} />
      </div>
    );
  };

  const renderSubcategoryIcon = (subcategory, isSelected) => {
    const imageUrl = isDarkMode && subcategory.darkImage ? subcategory.darkImage : subcategory.image;

    return imageUrl ? (
      <div className={`w-5 h-5 mr-2 transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
        <Image
          src={`${baseURL}${imageUrl}`}
          alt={subcategory?.name || "Subcategory image"}
          width={20}
          height={20}
          className="object-contain"
        />
      </div>
    ) : (
      <div className={`w-5 h-5 mr-2 flex items-center justify-center text-xs font-medium transition-all duration-300 ${
        isSelected ? 'scale-110 text-white' : isDarkMode ? 'text-gray-200' : 'text-gray-600'
      }`}>
        {subcategory.name?.charAt(0)}
      </div>
    );
  };

  if (categoryLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 category-transition">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Categories</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-xl p-6 border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    } category-transition`}>
      <h2 className={`text-2xl font-bold mb-6 text-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Categories
      </h2>

      <div className="space-y-2">
        {/* All Posts Button */}
        <div
          onClick={handleShowAllPosts}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer
          category-transition hover-scale-effect ${
            !selectedCategory && !selectedSubCategory
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg'
              : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              !selectedCategory && !selectedSubCategory
                ? 'bg-white/20 text-white shadow-lg'
                : isDarkMode
                  ? 'bg-gray-600 text-gray-200'
                  : 'bg-white text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
            } shadow-sm group-hover:shadow-md`}>
              {/* <UnorderedListOutlined size={20} /> */}
            </div>
            <div>
              <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                !selectedCategory && !selectedSubCategory ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                All Posts
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                !selectedCategory && !selectedSubCategory ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {totalPosts} Posts
              </p>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {categories.map((item) => {
          const category = item.category;
          const subcategories = item.subcategories || [];
          const hasSubcategories = subcategories.length > 0;
          const isExpanded = expandedCategories[category._id];
          const isSelected = selectedCategory === category._id && !selectedSubCategory;

          return (
            <div key={category._id} className="group">
              <div
                onClick={() => selectCategory(category._id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer
                category-transition hover-scale-effect ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg'
                    : isExpanded
                      ? isDarkMode
                        ? 'bg-gray-700 shadow-md'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md hover:from-blue-100 hover:to-indigo-100'
                      : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {renderCategoryIcon(category, isSelected)}
                  <div>
                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                      isSelected ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isSelected ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {category.postCount || 0} Posts
                    </p>
                  </div>
                </div>

                {hasSubcategories && (
                  <ChevronDown
                    className={`w-5 h-5 transition-all duration-300 ease-out ${
                      isSelected
                        ? 'text-white'
                        : isExpanded
                          ? isDarkMode ? 'text-white' : 'text-blue-600'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    } ${isExpanded ? 'rotate-180' : ''}`}
                  />
                )}
              </div>

              {hasSubcategories && (
                <div className={`overflow-hidden category-expandable ${
                  isExpanded 
                    ? 'max-h-[1000px] opacity-100 mt-2' 
                    : 'max-h-0 opacity-0'
                }`}>
                  <div className="ml-6 ">
                    {subcategories.map((subcategory) => {
                      const isSubSelected = selectedSubCategory === subcategory._id && selectedCategory === category._id;

                      return (
                        <div
                          key={subcategory._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSubcategory(category._id, subcategory._id);
                          }}
                          className={`p-3 rounded-lg cursor-pointer
                          subcategory-transition hover:translate-x-2 ${
                            isSubSelected
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md'
                              : isDarkMode
                                ? 'hover:bg-gray-600'
                                : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {renderSubcategoryIcon(subcategory, isSubSelected)}
                              <h4 className={`font-medium text-sm transition-colors duration-300 ${
                                isSubSelected ? 'text-white' : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                              }`}>
                                {subcategory.name}
                              </h4>
                            </div>
                            <span className={`text-xs transition-colors duration-300 ${
                              isSubSelected ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {subcategory.postCount || 0} Posts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesSidebar;