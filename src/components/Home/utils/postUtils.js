// utils/postUtils.js
import moment from 'moment';

// Extract URL parameters with defaults
export const extractUrlParams = (searchParams) => ({
  search: searchParams.get("search"),
  page: parseInt(searchParams.get("page") || "1"),
  category: searchParams.get("category"),
  subcategory: searchParams.get("subcategory"),
  sort: searchParams.get("sort") || "newest",
  limit: parseInt(searchParams.get("limit") || "10")
});

// Create API query params from URL params
export const createQueryParams = (urlParams) => ({
  ...(urlParams.search && { searchTerm: urlParams.search }),
  ...(urlParams.category && { category: urlParams.category }),
  ...(urlParams.subcategory && { subCategory: urlParams.subcategory }),
  sort: urlParams.sort,
  page: urlParams.page,
  limit: urlParams.limit
});

// Format timestamp
export const formatTime = (timestamp) => (
  timestamp ? moment.utc(timestamp).utcOffset(6).fromNow() : "Just now"
);

// Format post data for consistent structure
export const formatPostData = (post, currentUserId) => ({
  id: post._id,
  author: {
    id: post.author._id,
    username: post?.author?.userName || "Anonymous",
    avatar: post?.author?.profile,
    name: post?.author?.name || "User"
  },
  timePosted: formatTime(post.createdAt),
  title: post.title,
  content: post.content,
  images: post.images,
  tags: [{
    category: post.category?.name,
    subcategory: post.subCategory?.name
  }],
  stats: {
    likes: post.likes?.length || 0,
    comments: post.comments?.length || 0,
    reads: post.views || 0,
    likedBy: post.likes || []
  },
  isLiked: post.likes?.includes(currentUserId) || false
});

// Get category display name
export const getCategoryName = (posts, urlParams) => {
  if (urlParams.subcategory) {
    const post = posts.find(p => p.subCategory?._id === urlParams.subcategory);
    return post?.subCategory?.name || "Selected Subcategory";
  }
  if (urlParams.category) {
    const post = posts.find(p => p.category?._id === urlParams.category);
    return post?.category?.name || "Selected Category";
  }
  return "All Posts";
};

// Distribute posts into columns for grid layout
export const distributePostsIntoColumns = (posts, columnCount) => {
  if (!posts.length) return Array(columnCount).fill([]);
  const columns = Array(columnCount).fill().map(() => []);
  posts.forEach((post, index) => columns[index % columnCount].push(post));
  return columns;
};

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};