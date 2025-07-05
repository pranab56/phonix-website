"use client";

import { FileText } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { ThemeContext } from '../../../app/ClientLayout';
import Loading from '../../Loading/Loading';
import PaginationControls from './PaginationControls';
import PostsGrid from './PostsGrid';

const MainContent = ({
  posts,
  pagination,
  currentUser,
  gridNumber,
  onLike,
  onPageChange,
  isLoading,
  likePostLoading
}) => {
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [displayPosts, setDisplayPosts] = useState([]);
  const [masonryColumns, setMasonryColumns] = useState([]);
  const prevPostsRef = useRef([]);
  const { isDarkMode } = useContext(ThemeContext);

  // Function to distribute posts into columns for masonry layout
  const distributePostsIntoColumns = (postsArray) => {
    if (gridNumber === 1) {
      return postsArray;
    }

    const columns = [[], []]; // Two columns for gridNumber = 2
    const columnHeights = [0, 0];

    postsArray.forEach((post) => {
      // Find the column with less height
      const shortestColumnIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1;

      // Add post to the shortest column
      columns[shortestColumnIndex].push(post);

      // Estimate post height (you can adjust this based on your actual post structure)
      const estimatedHeight = estimatePostHeight(post);
      columnHeights[shortestColumnIndex] += estimatedHeight;
    });

    return columns;
  };

  // Estimate post height based on content
  const estimatePostHeight = (post) => {
    let height = 300; // Base height for image and basic content

    if (post.title) {
      height += Math.ceil(post.title.length / 50) * 20;
    }

    if (post.description) {
      height += Math.ceil(post.description.length / 100) * 16;
    }

    return height + 80; // Add padding and margins
  };

  // Check if posts array has structurally changed (not just reactions)
  const hasPostsStructureChanged = (newPosts, oldPosts) => {
    // If this is the initial load (oldPosts is empty), always treat as structural change
    if (oldPosts.length === 0 && newPosts.length > 0) return true;

    if (newPosts.length !== oldPosts.length) return true;

    // Check if post IDs are the same (assuming posts have an id field)
    return newPosts.some((post, index) =>
      !oldPosts[index] || post.id !== oldPosts[index].id
    );
  };

  useEffect(() => {
    if (!isLoading && posts.length > 0) {
      const hasStructureChanged = hasPostsStructureChanged(posts, prevPostsRef.current);

      if (hasStructureChanged) {
        // Reduced loading delay for faster user experience
        setIsContentLoading(true);
        setDisplayPosts([]); // Clear current posts during loading
        setMasonryColumns([]);

        const timer = setTimeout(() => {
          setDisplayPosts(posts);

          // Set up masonry columns if gridNumber is 2
          if (gridNumber === 2) {
            const columns = distributePostsIntoColumns(posts);
            setMasonryColumns(columns);
          }

          setIsContentLoading(false);
          // Update the ref only after the timer completes successfully
          prevPostsRef.current = posts;
        }, 300); // Reduced from 1000ms to 300ms for faster loading

        return () => clearTimeout(timer);
      } else {
        // For reaction updates, update posts immediately without loading delay
        setDisplayPosts(posts);

        if (gridNumber === 2) {
          const columns = distributePostsIntoColumns(posts);
          setMasonryColumns(columns);
        }

        // Update the ref for reaction updates
        prevPostsRef.current = posts;
      }
    } else if (!isLoading && posts.length === 0) {
      // Handle no posts case immediately - no delay
      setDisplayPosts([]);
      setMasonryColumns([]);
      setIsContentLoading(false);
      prevPostsRef.current = [];
    }
  }, [posts, isLoading, gridNumber]);

  // Show loading if data is still being fetched from API
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-[400px] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loading />
      </div>
    );
  }

  // Show loading during our reduced delay (only when there is data)
  if (isContentLoading) {
    return (
      <div className={`flex justify-center items-center h-[400px] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loading />
      </div>
    );
  }

  // Show no posts message immediately when there's no data
  if (!displayPosts.length) {
    return (
      <div className={`max-w-md mx-auto sm:mt-20 mt-10 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {/* Icon Container */}
        <div className="relative mb-3">
          <div className={`w-20 h-20 mx-auto rounded-full shadow-lg flex items-center justify-center relative overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${isDarkMode ? 'from-blue-900 to-purple-900' : 'from-blue-100 to-purple-100'
              }`}></div>
            <FileText className={`w-10 h-10 relative z-10 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'
              }`} strokeWidth={1.5} />
          </div>
          {/* Floating Elements */}
          <div className={`absolute top-4 right-8 w-6 h-6 rounded-full opacity-60 animate-pulse ${isDarkMode ? 'bg-blue-800' : 'bg-blue-200'
            }`}></div>
          <div className={`absolute bottom-8 left-4 w-4 h-4 rounded-full opacity-40 animate-pulse delay-500 ${isDarkMode ? 'bg-purple-800' : 'bg-purple-200'
            }`}></div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mb-8">
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-slate-800'
            }`}>
            No Posts Found
          </h2>
          <p className={`text-md leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>
            It looks like there aren't any posts here yet. Be the first to share something amazing!
          </p>
        </div>
      </div>
    );
  }

  // Show the actual content
  return (
    <>
      {gridNumber === 1 ? (
        // Single column layout - use existing PostsGrid
        <PostsGrid
          posts={displayPosts}
          currentUser={currentUser}
          gridNumber={gridNumber}
          onLike={onLike}
          likePostLoading={likePostLoading}
        />
      ) : (
        // Two column masonry layout
        <div className="flex gap-4">
          {masonryColumns.map((columnPosts, columnIndex) => (
            <div key={columnIndex} className="flex-1">
              <PostsGrid
                posts={columnPosts}
                currentUser={currentUser}
                gridNumber={1} // Pass 1 to ensure single column layout within each column
                onLike={onLike}
                likePostLoading={likePostLoading}
              />
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default MainContent;