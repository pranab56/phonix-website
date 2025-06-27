import { useContext } from "react";
import { ThemeContext } from "../../app/ClientLayout";

const CategorySidebar = ({ categories, activeCategory, onCategoryClick }) => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="md:col-span-1">
      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category._id}
            className={`cursor-pointer font-medium text-base px-4 py-2 rounded-lg transition-colors ${activeCategory === category._id
                ? 'bg-primary text-white' // Active item style
                : isDarkMode
                  ? 'bg-gray-900 text-white hover:bg-gray-700 duration-150' // Dark mode inactive
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 duration-150' // Light mode inactive
              }`}
            onClick={() => onCategoryClick(category._id)}
          >
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySidebar;