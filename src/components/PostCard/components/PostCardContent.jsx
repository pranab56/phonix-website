const PostCardContent = ({
  postData,
  isDarkMode,
  isMobile,
  handlePostDetails,
  handleCommentClick,
  isTablet
}) => {
  const renderTitle = () => (
    postData.title && (
      <h2
        onClick={handlePostDetails}
        className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
          } cursor-pointer transition-colors ${isDarkMode
            ? 'text-gray-100 hover:text-blue-400'
            : 'text-gray-800 hover:text-blue-700'
          } font-bold mb-3`}
      >
        {postData.title}
      </h2>
    )
  );

  const renderContent = () => (
    <div className={`mb-3 ${isMobile ? 'text-sm' : 'text-base'} ${isDarkMode ? 'text-gray-300' : 'text-gray-800'
      }`}>
      {postData.content?.replace(/<[^>]+>/g, '')?.split(' ')?.length > 20 ? (
        <>
          {postData.content.replace(/<[^>]+>/g, '').split(' ').slice(0, 20).join(' ')}...
          <button
            className={`${isDarkMode
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-blue-600 hover:text-blue-800'
              } cursor-pointer font-medium ml-1`}
            onClick={handleCommentClick}
          >
            See more
          </button>
        </>
      ) : (
        postData.content.replace(/<[^>]+>/g, '')
      )}
    </div>
  );

  return (
    <>
      {renderTitle()}
      {renderContent()}
    </>
  );
};

export default PostCardContent;