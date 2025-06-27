"use client"

import { useContext, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { ThemeContext } from '../ClientLayout';
import CustomBanner from '@/components/CustomBanner';
import { useGetfaqCategoryQuery, useGetfaqQuery } from '@/features/faqs/faqsApi';
import CategorySidebar from '../../components/support/CategorySidebar';
import FaqList from '../../components/support/FaqList';
import Loading from '../../components/Loading/Loading';

const FaqPage = () => {
  // Get dark mode state from context
  const { isDarkMode } = useContext(ThemeContext);

  // Fetch data from API
  const { data: faqData, isLoading: faqLoading, isError: faqError } = useGetfaqQuery();
  const {
    data: faqCategoryData,
    isLoading: categoryLoading,
    isError: categoryError
  } = useGetfaqCategoryQuery();

  // Extract categories and faqs from API response
  const categories = faqCategoryData?.data || [];
  const faqs = faqData?.data?.data || [];

  // Set initial active category (use first category from API or "All" if none)
  const [activeCategory, setActiveCategory] = useState(null);

  // Initialize active category once data is loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id);
    }
  }, [categories.length, activeCategory]);

  // Filter FAQs based on active category
  const filteredFaqs = activeCategory
    ? faqs.filter(faq => faq.category === activeCategory)
    : faqs;

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Error handling
  if (faqError || categoryError) {
    return (
      <div className={`min-h-screen flex items-center justify-end ${isDarkMode ? 'bg-gray-900 text-white' : ''}`}>
        <div className="text-end text-red-500">
          <p>Failed to load FAQ data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white' : ''}>
      <CustomBanner routeName="Help & Support" />
      <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>Any Question? We can help you.</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Can't find an answer? Email us at <a href="mailto:support@yourdomain.com" className={`hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>support@yourdomain.com</a>
            </p>
          </div>

          {
            faqLoading || categoryLoading ? (
              <div className='flex justify-center'>
                <Loading />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Categories Sidebar */}
                <CategorySidebar
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryClick={handleCategoryClick}
                  isDarkMode={isDarkMode}
                />

                {/* FAQs Content */}
                <div className="md:col-span-3">
                  <FaqList faqs={filteredFaqs} isDarkMode={isDarkMode} />
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default FaqPage;