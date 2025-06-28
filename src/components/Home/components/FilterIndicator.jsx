import { Button, Card } from 'antd';
import { useContext } from 'react';
import { ThemeContext } from '../../../app/ClientLayout';
import { getCategoryName } from '../utils/postUtils';


const FilterIndicator = ({ urlParams, posts, onClearFilters }) => {
  const { isDarkMode } = useContext(ThemeContext);

  if (!urlParams.category && !urlParams.subcategory && !urlParams.search) {
    return null;
  }

  const displayName = urlParams.search
    ? `Search results for "${urlParams.search}"`
    : getCategoryName(posts, urlParams);

  const sortDisplay = urlParams.sort !== "newest"
    ? `(Sorted by: ${urlParams.sort === "oldest" ? "Oldest first" : "Most popular"})`
    : "";

  return (
    <Card className="mb-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} mr-2`}>
            Viewing:
          </span>
          <span className="font-medium text-blue-600">
            {displayName}
          </span>
          {sortDisplay && (
            <span className="ml-2 text-gray-500">
              {sortDisplay}
            </span>
          )}
        </div>
        <Button type="link" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      </div>
    </Card>
  );
};

export default FilterIndicator;