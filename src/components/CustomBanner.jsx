
import { useContext } from 'react';
import { ThemeContext } from '../app/ClientLayout';
import Link from 'next/link';


const CustomBanner = ({ prevRoute, routeName }) => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`w-full py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
      <div className="container mx-auto px-4">
        <h1 className={`text-3xl font-bold text-center mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {routeName}
        </h1>
        <div className="flex justify-center items-center space-x-2">
          <a
            href="/"
            className={`hover:${isDarkMode ? 'text-gray-300' : 'text-gray-900'} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
          >
            Home
          </a>

          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>&gt;</span>
          <Link href={"/about"}><span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>
            {prevRoute}
          </span></Link>
         {
          prevRoute &&  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>&gt;</span>
         }
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>
            {routeName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomBanner;
