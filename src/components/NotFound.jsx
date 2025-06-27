"use client";

import { Card } from 'antd';
import { useContext } from 'react';
import { ThemeContext } from '../app/ClientLayout';

export const NotFound = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <Card className="text-center bg-white dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center py-5 px-6 text-center">
        <div className="mb-6">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isDarkMode ? "text-gray-400" : "text-gray-300"}
          >
            <path
              d="M70 35H40C35 35 30 40 30 45V75C30 80 35 85 40 85H80C85 85 90 80 90 75V55L70 35Z"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M70 35V55H90"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle
              cx="55"
              cy="60"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="4 4"
              fill="none"
            />
            <path
              d="M65 65L75 75"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          No posts found
        </h3>
        <p className={`text-sm mb-6 max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          There are no posts to display at the moment. Check back later or try adjusting your search criteria.
        </p>
      </div>
    </Card>
  );
}