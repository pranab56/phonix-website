"use client";

import Banner from '@/components/Banner';
import { default as CategoriesSidebar } from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Pagination, Spin } from 'antd';
import moment from 'moment';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Loading from '../components/Loading/Loading';
import { NotFound } from '../components/NotFound';
import { ThemeContext } from './ClientLayout';

const HomePage = () => {
  // Hooks and context
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useContext(ThemeContext);
  const postsContainerRef = useRef(null);

  // Extract URL parameters with defaults
  const urlParams = useMemo(() => ({
    search: searchParams.get("search"),
    page: parseInt(searchParams.get("page") || "1"),
    category: searchParams.get("category"),
    subcategory: searchParams.get("subcategory"),
    sort: searchParams.get("sort") || "newest",
    limit: parseInt(searchParams.get("limit") || "10")
  }), [searchParams]);

  // State management
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [currentUser, setCurrentUser] = useState({ id: null });
  const [isScrolling, setIsScrolling] = useState(false);

  // Initialize user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser({ id: localStorage.getItem("login_user_id") });
    }
  }, []);

  // Window resize handler with debounce
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

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

  // API query params
  const queryParams = useMemo(() => ({
    ...(urlParams.search && { searchTerm: urlParams.search }),
    ...(urlParams.category && { category: urlParams.category }),
    ...(urlParams.subcategory && { subCategory: urlParams.subcategory }),
    sort: urlParams.sort,
    page: urlParams.page,
    limit: urlParams.limit
  }), [urlParams]);

  // API calls
  const { data, isLoading, error, refetch } = useGetPostQuery(queryParams);
  const [likePost] = useLikePostMutation();

  // Extract data from API response
  const { posts, pagination } = useMemo(() => {
    const postsData = data?.data?.data || [];
    const meta = data?.data?.meta || {};

    return {
      posts: postsData,
      pagination: {
        currentPage: meta.page || urlParams.page,
        postsPerPage: meta.limit || urlParams.limit,
        totalPosts: meta.total || 0,
        totalPages: meta.totalPage || Math.ceil((meta.total || 0) / (meta.limit || urlParams.limit))
      }
    };
  }, [data, urlParams]);

  // Layout calculations
  const { isDesktop, isGrid2, columnCount } = useMemo(() => {
    const desktop = windowWidth >= 1024;
    const grid2 = gridNumber === 2 && desktop;

    let columns = 1;
    if (windowWidth >= 1024) {
      columns = grid2 ? 2 : 1;
    } else if (windowWidth >= 640) {
      columns = gridNumber === 2 ? 2 : 1;
    }

    return {
      isDesktop: desktop,
      isGrid2: grid2,
      columnCount: columns
    };
  }, [windowWidth, gridNumber]);

  // Utility functions
  const formatTime = useCallback((timestamp) => (
    timestamp ? moment.utc(timestamp).utcOffset(6).fromNow() : "Just now"
  ), []);

  const formatPostData = useCallback((post) => ({
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
    isLiked: post.likes?.includes(currentUser.id) || false
  }), [formatTime, currentUser.id]);

  // Distribute posts into columns
  const postColumns = useMemo(() => {
    if (!posts.length) return Array(columnCount).fill([]);
    const columns = Array(columnCount).fill().map(() => []);
    posts.forEach((post, index) => columns[index % columnCount].push(post));
    return columns;
  }, [posts, columnCount]);

  const getCategoryName = useCallback(() => {
    if (urlParams.subcategory) {
      const post = posts.find(p => p.subCategory?._id === urlParams.subcategory);
      return post?.subCategory?.name || "Selected Subcategory";
    }
    if (urlParams.category) {
      const post = posts.find(p => p.category?._id === urlParams.category);
      return post?.category?.name || "Selected Category";
    }
    return "All Posts";
  }, [posts, urlParams.subcategory, urlParams.category]);

  // Event handlers
  const handleLike = useCallback(async (postId) => {
    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Like error:", error);
    }
  }, [likePost]);

  // Fixed category selection handler
  const handleCategorySelect = useCallback((categoryId, subCategoryId = null) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Clear existing category/subcategory params
    newParams.delete('category');
    newParams.delete('subcategory');

    // Set new params
    if (categoryId) newParams.set('category', categoryId);
    if (subCategoryId) newParams.set('subcategory', subCategoryId);
    newParams.set('page', '1');

    // Use router.push instead of replaceState to maintain smooth navigation
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const updateUrlParams = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      value ? newParams.set(key, value) : newParams.delete(key);
    });
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleSortChange = useCallback((sortOption) => {
    updateUrlParams({ sort: sortOption, page: 1 });
  }, [updateUrlParams]);

  const handlePageChange = useCallback((page) => {
    updateUrlParams({ page });
    // Smooth scroll to top only for pagination
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [updateUrlParams]);

  const clearAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);





  const PostsGrid = () => (
    <div
      ref={postsContainerRef}
      className={`flex gap-4 mb-6 transition-all duration-300 ${isScrolling ? 'scroll-smooth' : ''}`}
      style={{
        scrollBehavior: 'smooth',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {isLoading ? <div className='flex justify-center h-[300px]'><Loading /></div> : postColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-4">
          {column.map((post) => (
            <PostCard
              key={post._id}
              postData={formatPostData(post)}
              currentUser={currentUser}
              onLike={handleLike}
              className="transition-transform duration-200 hover:scale-[1.01]"
            />
          ))}
        </div>
      ))}
    </div>
  );

  const FilterIndicator = () => {
    if (!urlParams.category && !urlParams.subcategory && !urlParams.search) return null;

    return (
      <Card className="mb-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} mr-2`}>Viewing: </span>
            <span className="font-medium text-blue-600">
              {urlParams.search ? `Search results for "${urlParams.search}"` : getCategoryName()}
            </span>
            {urlParams.sort !== "newest" && (
              <span className="ml-2 text-gray-500">
                (Sorted by: {urlParams.sort === "oldest" ? "Oldest first" : "Most popular"})
              </span>
            )}
          </div>
          <Button type="link" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      </Card>
    );
  };

  // Loading and error states
  if (isLoading) return <div className='flex justify-center items-center h-[400px]'><Loading /></div>;
  if (error) return (
    <div className="flex justify-center items-center h-[800px]">
      <NotFound />
    </div>
  );

  // Main render
  return (
    <div className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Banner />
      <main className="container mx-auto px-4 py-6">
        {isDesktop ? (
          <div className="flex">
            <div className={`${isGrid2 ? 'w-3/12 pr-6' : 'w-3/12 pr-6 sticky top-20 self-start'}`}>
              <CategoriesSidebar
                onSelectCategory={handleCategorySelect}
                selectedCategory={urlParams.category}
                selectedSubCategory={urlParams.subcategory}
              />
            </div>

            <section className={`${isGrid2 ? 'w-9/12' : 'w-6/12'} flex flex-col gap-3`}>
              <FeedNavigation
                handlefeedGrid={setGridNumber}
                onSortChange={handleSortChange}
                currentSort={urlParams.sort}
              />

              <FilterIndicator />

              {/* Loading state for category changes */}
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                 <Loading />
                </div>
              ) : posts.length === 0 ? (
                // <EmptyState />
                <div className="flex justify-center items-center h-[400px]">
                  <h1>No posts found</h1>
                </div>
              ) : (
                <PostsGrid />
              )}
            </section>
          </div>
        ) : (
          <div className="flex flex-col">
            <CategoriesSidebar
              onSelectCategory={handleCategorySelect}
              selectedCategory={urlParams.category}
              selectedSubCategory={urlParams.subcategory}
            />
            <FeedNavigation
              handlefeedGrid={setGridNumber}
              onSortChange={handleSortChange}
              currentSort={urlParams.sort}
            />

            <FilterIndicator />

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loading />
              </div>
            ) : posts.length === 0 ? (
              <div>
                <h1>No posts Avalable</h1>
              </div>
            ) : (
              <PostsGrid />
            )}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center my-1">
            <Pagination
              current={pagination.currentPage}
              total={pagination.totalPosts}
              pageSize={pagination.postsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              itemRender={(current, type, originalElement) => {
                if (type === 'prev') return <Button icon={<LeftOutlined />} />;
                if (type === 'next') return <Button icon={<RightOutlined />} />;
                return originalElement;
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;