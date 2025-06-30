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
  likePostLoading // This should now be specific to this post
}) => {

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => handleLike(postData.id)} // Pass the post ID
          disabled={likePostLoading}
          className={`flex items-center cursor-pointer p-2 rounded transition-colors `} >
          {postData.isLiked ? (
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