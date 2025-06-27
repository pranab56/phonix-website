"use client";

import { useContext } from 'react';
import { ThemeContext } from '../app/ClientLayout';




export const LoadingSkeleton = () => {

  const { isDarkMode } = useContext(ThemeContext);
  return (

    <div className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left sidebar */}
          <div className="hidden lg:block w-3/12 pr-6 sticky top-20 self-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 animate-pulse">
              <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-full mb-5"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded-full opacity-80"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="w-full lg:w-6/12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="grid grid-cols-1 gap-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 animate-pulse"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Author */}
                  <div className="flex items-center mb-5">
                    <div className="h-11 w-11 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full opacity-75"></div>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="mb-5 space-y-3">
                    <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded-full opacity-90"></div>
                    <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded-full opacity-80"></div>
                  </div>

                  {/* Image placeholder */}
                  <div className="h-52 bg-gray-200 dark:bg-gray-700 rounded-lg mb-5 opacity-90"></div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}