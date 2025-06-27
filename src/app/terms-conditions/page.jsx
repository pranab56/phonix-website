"use client";

import CustomBanner from '@/components/CustomBanner';
import { Spin } from 'antd';
import { useContext } from 'react';
import { useTermsAndConditionQuery } from '../../features/About/AboutApi';
import { ThemeContext } from '../ClientLayout';

const page = () => {
  const { data, isLoading, isError } = useTermsAndConditionQuery();
  const { isDarkMode } = useContext(ThemeContext);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='flex justify-center'>
          <Spin className={isDarkMode ? 'dark-spin' : ''} />
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

    return (
      <div
        className={`terms-conditions-content ${isDarkMode ? 'dark-content' : ''}`}
        dangerouslySetInnerHTML={{ __html: data.data.content }}
      />
    );
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <style jsx global>{`
        /* Dark mode styles for dynamically rendered content */
        .dark .terms-conditions-content,
        .dark-content {
          color: #f3f4f6 !important;
        }
        
        .dark .terms-conditions-content h1,
        .dark .terms-conditions-content h2,
        .dark .terms-conditions-content h3,
        .dark .terms-conditions-content h4,
        .dark .terms-conditions-content h5,
        .dark .terms-conditions-content h6,
        .dark-content h1,
        .dark-content h2,
        .dark-content h3,
        .dark-content h4,
        .dark-content h5,
        .dark-content h6 {
          color: #ffffff !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
        }
        
        .dark .terms-conditions-content p,
        .dark .terms-conditions-content div,
        .dark .terms-conditions-content span,
        .dark .terms-conditions-content li,
        .dark .terms-conditions-content td,
        .dark-content p,
        .dark-content div,
        .dark-content span,
        .dark-content li,
        .dark-content td {
          color: #e5e7eb !important;
          line-height: 1.6 !important;
        }
        
        .dark .terms-conditions-content a,
        .dark-content a {
          color: #60a5fa !important;
          text-decoration: underline !important;
        }
        
        .dark .terms-conditions-content a:hover,
        .dark-content a:hover {
          color: #93c5fd !important;
        }
        
        .dark .terms-conditions-content table,
        .dark-content table {
          border-color: #374151 !important;
          background-color: #1f2937 !important;
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        .dark .terms-conditions-content th,
        .dark .terms-conditions-content td,
        .dark-content th,
        .dark-content td {
          border: 1px solid #374151 !important;
          padding: 0.75rem !important;
          background-color: transparent !important;
        }
        
        .dark .terms-conditions-content th,
        .dark-content th {
          background-color: #374151 !important;
          font-weight: 600 !important;
          color: #ffffff !important;
        }
        
        .dark .terms-conditions-content blockquote,
        .dark-content blockquote {
          border-left: 4px solid #374151 !important;
          background-color: #1f2937 !important;
          padding: 1rem !important;
          margin: 1rem 0 !important;
          border-radius: 0.375rem !important;
        }
        
        .dark .terms-conditions-content code,
        .dark-content code {
          background-color: #1f2937 !important;
          color: #fbbf24 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875em !important;
        }
        
        .dark .terms-conditions-content pre,
        .dark-content pre {
          background-color: #111827 !important;
          border: 1px solid #374151 !important;
          padding: 1rem !important;
          border-radius: 0.375rem !important;
          overflow-x: auto !important;
        }
        
        .dark .terms-conditions-content hr,
        .dark-content hr {
          border-color: #374151 !important;
          margin: 2rem 0 !important;
        }
        
        /* Dark mode for Ant Design Spin component */
        .dark-spin .ant-spin-dot-item {
          background-color: #60a5fa !important;
        }
        
        .dark .ant-spin-dot-item {
          background-color: #60a5fa !important;
        }
        
        /* Ensure all text elements in dark mode have proper contrast */
        .dark .terms-conditions-content strong,
        .dark .terms-conditions-content b,
        .dark-content strong,
        .dark-content b {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        .dark .terms-conditions-content em,
        .dark .terms-conditions-content i,
        .dark-content em,
        .dark-content i {
          color: #d1d5db !important;
          font-style: italic !important;
        }
        
        /* Dark mode for form elements if any */
        .dark .terms-conditions-content input,
        .dark .terms-conditions-content textarea,
        .dark .terms-conditions-content select,
        .dark-content input,
        .dark-content textarea,
        .dark-content select {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
          border-radius: 0.375rem !important;
          padding: 0.5rem !important;
        }
        
        .dark .terms-conditions-content input:focus,
        .dark .terms-conditions-content textarea:focus,
        .dark .terms-conditions-content select:focus,
        .dark-content input:focus,
        .dark-content textarea:focus,
        .dark-content select:focus {
          border-color: #60a5fa !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
        }
        
        /* Dark mode for lists */
        .dark .terms-conditions-content ul,
        .dark .terms-conditions-content ol,
        .dark-content ul,
        .dark-content ol {
          color: #e5e7eb !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        
        .dark .terms-conditions-content li,
        .dark-content li {
          margin: 0.5rem 0 !important;
        }
        
        /* Dark mode for images */
        .dark .terms-conditions-content img,
        .dark-content img {
          opacity: 0.9 !important;
          border-radius: 0.375rem !important;
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Dark mode for definition lists */
        .dark .terms-conditions-content dl,
        .dark-content dl {
          color: #e5e7eb !important;
        }
        
        .dark .terms-conditions-content dt,
        .dark-content dt {
          color: #ffffff !important;
          font-weight: 600 !important;
          margin-top: 1rem !important;
        }
        
        .dark .terms-conditions-content dd,
        .dark-content dd {
          color: #d1d5db !important;
          margin-left: 1rem !important;
          margin-bottom: 0.5rem !important;
        }
        
        /* Dark mode scrollbar */
        .dark .terms-conditions-content::-webkit-scrollbar,
        .dark-content::-webkit-scrollbar {
          width: 8px !important;
        }
        
        .dark .terms-conditions-content::-webkit-scrollbar-track,
        .dark-content::-webkit-scrollbar-track {
          background: #1f2937 !important;
        }
        
        .dark .terms-conditions-content::-webkit-scrollbar-thumb,
        .dark-content::-webkit-scrollbar-thumb {
          background: #4b5563 !important;
          border-radius: 4px !important;
        }
        
        .dark .terms-conditions-content::-webkit-scrollbar-thumb:hover,
        .dark-content::-webkit-scrollbar-thumb:hover {
          background: #6b7280 !important;
        }
      `}</style>

      <CustomBanner prevRoute="About us" routeName="Terms - Conditions" />

      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}>
        <div className="max-w-5xl mx-auto py-8 px-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default page;