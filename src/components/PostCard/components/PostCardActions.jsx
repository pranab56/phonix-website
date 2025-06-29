import Image from 'next/image';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { PostSEEDark, PostSEELight } from '../../../../utils/svgImage';
import PostCardTags from './PostCardTags';

const PostCardActions = ({
  postData,
  isDarkMode,
  isMobile,
  handleLike,
  handleCommentClick,
  handleShare,
  likePostLoading
}) => {

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={handleLike}
          disabled={likePostLoading}
          className={`flex items-center cursor-pointer p-2 rounded transition-colors ${likePostLoading
            ? 'opacity-50 cursor-not-allowed'
            : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
        >
          {likePostLoading ? (
            // Loading spinner
            <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`}>
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : postData.isLiked ? (
            <FaHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} />
          ) : (
            <FaRegHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
          )}
          <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            {postData.stats.likes || 0}
          </span>
        </button>

        <button
          onClick={handleCommentClick}
          className={`flex items-center cursor-pointer p-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
        >
          <Image
            src={isDarkMode ? "/icons/commentdark.png" : "/icons/message.png"}
            width={20}
            height={20}
            alt="message icon"
          />
          <span className={`ml-1 -mt-[1px] ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            {postData.stats.comments || 0}
          </span>
        </button>

        <PostCardTags postData={postData} isDarkMode={isDarkMode} />
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
          {isDarkMode ? <PostSEEDark /> : <PostSEELight />}
          <span>{postData.stats.reads}</span>
        </div>

        <button
          onClick={handleShare}
          className={`px-2 py-2 cursor-pointer rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
        >
          <Image
            src={isDarkMode ? "/icons/sharedark.png" : "/icons/share.png"}
            width={20}
            height={20}
            alt="share button"
          />
        </button>
      </div>
    </div>
  );
};

export default PostCardActions;