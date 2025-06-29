
import { useEffect, useMemo, useRef, useState } from 'react';
import Loading from '../../../components/Loading/Loading';

import { useLayout } from '../hooks/useLayout';
import PostCard from '../../PostCard/components/PostCard';


const PostsGrid = ({ posts, currentUser, gridNumber, onLike, isLoading, likePostLoading }) => {
  const postsContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const { columnCount } = useLayout();

  // Scroll handler with cleanup
  useEffect(() => {
    const container = postsContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    let animationFrame;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 100);

      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => { });
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Distribute posts into columns
  const postColumns = useMemo(() => {
    if (!posts.length) return Array(columnCount).fill([]);
    const columns = Array(columnCount).fill().map(() => []);
    posts.forEach((post, index) => columns[index % columnCount].push(post));
    return columns;
  }, [posts, columnCount]);

  if (isLoading) {
    return (
      <div className='flex justify-center h-[300px]'>
        <Loading />
      </div>
    );
  }

  return (
    <div
      ref={postsContainerRef}
      className={`flex gap-4 mb-6 transition-all duration-300 ${isScrolling ? 'scroll-smooth' : ''
        }`}
      style={{
        scrollBehavior: 'smooth',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {postColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-4">
          {column.map((post) => (
            <PostCard
              key={post.id}
              postData={post}
              currentUser={currentUser}
              onLike={onLike}
              likePostLoading={likePostLoading}
              className="transition-transform duration-200 hover:scale-[1.01]"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PostsGrid;