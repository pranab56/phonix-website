const PostCardTags = ({ postData, isDarkMode }) => {
  if (!postData.tags?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {postData.tags.map((tag, index) => (
        <div key={index} className='flex items-center gap-2'>
          {tag.category && (
            <span
              className={`text-xs py-1 px-2 rounded ${isDarkMode
                  ? 'bg-gray-700 text-blue-400 border border-gray-600'
                  : 'bg-[#E6E6FF] text-gray-800 border border-gray-200'
                }`}
            >
              {tag.category}
            </span>
          )}
          {tag.subcategory && (
            <span
              className={`text-xs py-1 px-2 rounded ${isDarkMode
                  ? 'bg-gray-700 text-blue-400 border border-gray-600'
                  : 'bg-[#E6E6FF] text-gray-800 border border-gray-200'
                }`}
            >
              {tag.subcategory}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostCardTags;