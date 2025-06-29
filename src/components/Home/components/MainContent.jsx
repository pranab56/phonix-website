import { useEffect, useRef, useState } from 'react';
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
      <div className="flex justify-center items-center h-[400px]">
        <Loading />
      </div>
    );
  }

  // Show loading during our reduced delay (only when there is data)
  if (isContentLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loading />
      </div>
    );
  }

  // Show no posts message immediately when there's no data
  if (!displayPosts.length) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <h1>No posts found</h1>
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