import { useEffect, useState } from 'react';
import PaginationControls from './PaginationControls';
import PostsGrid from './PostsGrid';
import Loading from '../../Loading/Loading';

const MainContent = ({
  posts,
  pagination,
  currentUser,
  gridNumber,
  onLike,
  onPageChange,
  isLoading
}) => {
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [displayPosts, setDisplayPosts] = useState([]);
  const [masonryColumns, setMasonryColumns] = useState([]);

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

  useEffect(() => {
    if (!isLoading && posts.length > 0) {
      // Start the 1-second loading delay when new posts arrive
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
      }, 1000);

      return () => clearTimeout(timer);
    } else if (!isLoading && posts.length === 0) {
      // Handle no posts case immediately
      setDisplayPosts([]);
      setMasonryColumns([]);
      setIsContentLoading(false);
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

  // Show loading during our 1-second delay
  if (isContentLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loading />
      </div>
    );
  }

  // Show no posts message
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