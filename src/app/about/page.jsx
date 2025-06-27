"use client";
import CustomBanner from '@/components/CustomBanner';
import { useAboutQuery } from '@/features/About/AboutApi';
import { Spin } from 'antd';
import Link from 'next/link';
import { useContext } from 'react';
import { ThemeContext } from '../ClientLayout';
import Loading from '../../components/Loading/Loading';

const About = () => {
  const { data, isLoading, isError } = useAboutQuery();
  const { isDarkMode } = useContext(ThemeContext);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div>
          <Loading />
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className={`flex justify-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          Failed to load content
        </div>
      );
    }
    
    if (!data?.data?.content) {
      return (
        <span className={`flex justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No Available Content
        </span>
      );
    }
    
    // Use dangerouslySetInnerHTML to render the HTML content
    return (
      <div
        className={`privacy-policy-content ${isDarkMode ? 'dark-content' : ''}`}
        dangerouslySetInnerHTML={{ __html: data.data.content }}
      />
    );
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <style jsx global>{`
        /* Dark mode styles for dynamically rendered content */
        .dark .privacy-policy-content,
        .dark-content {
          color: #f3f4f6 !important;
        }
        
        .dark .privacy-policy-content h1,
        .dark .privacy-policy-content h2,
        .dark .privacy-policy-content h3,
        .dark .privacy-policy-content h4,
        .dark .privacy-policy-content h5,
        .dark .privacy-policy-content h6,
        .dark-content h1,
        .dark-content h2,
        .dark-content h3,
        .dark-content h4,
        .dark-content h5,
        .dark-content h6 {
          color: #ffffff !important;
        }
        
        .dark .privacy-policy-content p,
        .dark .privacy-policy-content div,
        .dark .privacy-policy-content span,
        .dark .privacy-policy-content li,
        .dark .privacy-policy-content td,
        .dark-content p,
        .dark-content div,
        .dark-content span,
        .dark-content li,
        .dark-content td {
          color: #e5e7eb !important;
        }
        
        .dark .privacy-policy-content a,
        .dark-content a {
          color: #60a5fa !important;
        }
        
        .dark .privacy-policy-content a:hover,
        .dark-content a:hover {
          color: #93c5fd !important;
        }
        
        .dark .privacy-policy-content table,
        .dark-content table {
          border-color: #374151 !important;
          background-color: #1f2937 !important;
        }
        
        .dark .privacy-policy-content th,
        .dark .privacy-policy-content td,
        .dark-content th,
        .dark-content td {
          border-color: #374151 !important;
          background-color: transparent !important;
        }
        
        .dark .privacy-policy-content blockquote,
        .dark-content blockquote {
          border-left-color: #374151 !important;
          background-color: #1f2937 !important;
        }
        
        .dark .privacy-policy-content code,
        .dark-content code {
          background-color: #1f2937 !important;
          color: #fbbf24 !important;
        }
        
        .dark .privacy-policy-content pre,
        .dark-content pre {
          background-color: #111827 !important;
          border-color: #374151 !important;
        }
        
        .dark .privacy-policy-content hr,
        .dark-content hr {
          border-color: #374151 !important;
        }
        
        /* Dark mode for Ant Design Spin component */
        .dark-spin .ant-spin-dot-item {
          background-color: #60a5fa !important;
        }
        
        .dark .ant-spin-dot-item {
          background-color: #60a5fa !important;
        }
        
        /* Ensure all text elements in dark mode have proper contrast */
        .dark .privacy-policy-content *,
        .dark-content * {
          color: inherit !important;
        }
        
        .dark .privacy-policy-content strong,
        .dark .privacy-policy-content b,
        .dark-content strong,
        .dark-content b {
          color: #ffffff !important;
        }
        
        .dark .privacy-policy-content em,
        .dark .privacy-policy-content i,
        .dark-content em,
        .dark-content i {
          color: #d1d5db !important;
        }
        
        /* Dark mode for form elements if any */
        .dark .privacy-policy-content input,
        .dark .privacy-policy-content textarea,
        .dark .privacy-policy-content select,
        .dark-content input,
        .dark-content textarea,
        .dark-content select {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
          border-color: #4b5563 !important;
        }
        
        /* Dark mode for lists */
        .dark .privacy-policy-content ul,
        .dark .privacy-policy-content ol,
        .dark-content ul,
        .dark-content ol {
          color: #e5e7eb !important;
        }
        
        /* Dark mode for images - ensure they don't get too bright */
        .dark .privacy-policy-content img,
        .dark-content img {
          opacity: 0.9;
        }
      `}</style>
      
      <CustomBanner routeName="About us" />
      
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="max-w-5xl mx-auto py-8 px-6">
          {renderContent()}
        </div>
        
        <div className={`flex justify-center gap-5 pb-8 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Link 
            href="/terms-conditions" 
            className={`font-medium text-base cursor-pointer transition-colors duration-200 hover:underline ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Terms and Conditions
          </Link>
          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>|</span>
          <Link 
            href="/privacy-policy" 
            className={`font-medium text-base cursor-pointer transition-colors duration-200 hover:underline ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;