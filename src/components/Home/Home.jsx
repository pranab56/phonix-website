"use client";

import { useContext } from 'react';
import { ThemeContext } from '../../app/ClientLayout';
import Banner from '../Banner';
import Loading from '../Loading/Loading';
import { NotFound } from '../NotFound';
import { useHomePage } from './hooks/useHomePage';
import { useLayout } from './hooks/useLayout';
import CategoriesSidebar from '../CategoriesSidebar';
import FeedNavigation from '../FeedNavigation';
import FilterIndicator from './components/FilterIndicator';
import PostsGrid from './components/PostsGrid';
import PaginationControls from './components/PaginationControls';



const HomePage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const {
    urlParams,
    data,
    isLoading,
    error,
    currentUser,
    handleCategorySelect,
    handleSortChange,
    handlePageChange,
    handleLike,
    clearAllFilters
  } = useHomePage();

  const { isDesktop, gridNumber, setGridNumber } = useLayout();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[400px]'>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[800px]">
        <NotFound />
      </div>
    );
  }

  const { posts, pagination } = data;

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <Banner />
      <main className="container mx-auto px-4 py-6">
        {isDesktop ? (
          <DesktopLayout
            gridNumber={gridNumber}
            setGridNumber={setGridNumber}
            urlParams={urlParams}
            posts={posts}
            pagination={pagination}
            currentUser={currentUser}
            onCategorySelect={handleCategorySelect}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onLike={handleLike}
            onClearFilters={clearAllFilters}
            isLoading={isLoading}
          />
        ) : (
          <MobileLayout
            gridNumber={gridNumber}
            setGridNumber={setGridNumber}
            urlParams={urlParams}
            posts={posts}
            pagination={pagination}
            currentUser={currentUser}
            onCategorySelect={handleCategorySelect}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onLike={handleLike}
            onClearFilters={clearAllFilters}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
};

const DesktopLayout = ({
  gridNumber,
  setGridNumber,
  urlParams,
  posts,
  pagination,
  currentUser,
  onCategorySelect,
  onSortChange,
  onPageChange,
  onLike,
  onClearFilters,
  isLoading
}) => {
  const isGrid2 = gridNumber === 2;

  return (
    <div className="flex">
      <aside className={`${isGrid2 ? 'w-3/12 pr-6' : 'w-3/12 pr-6 sticky top-20 self-start'}`}>
        <CategoriesSidebar
          onSelectCategory={onCategorySelect}
          selectedCategory={urlParams.category}
          selectedSubCategory={urlParams.subcategory}
        />
      </aside>

      <section className={`${isGrid2 ? 'w-9/12' : 'w-6/12'} flex flex-col gap-3`}>
        <FeedNavigation
          handlefeedGrid={setGridNumber}
          onSortChange={onSortChange}
          currentSort={urlParams.sort}
        />

        <FilterIndicator
          urlParams={urlParams}
          posts={posts}
          onClearFilters={onClearFilters}
        />

        <MainContent
          posts={posts}
          pagination={pagination}
          currentUser={currentUser}
          gridNumber={gridNumber}
          onLike={onLike}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

const MobileLayout = ({
  gridNumber,
  setGridNumber,
  urlParams,
  posts,
  pagination,
  currentUser,
  onCategorySelect,
  onSortChange,
  onPageChange,
  onLike,
  onClearFilters,
  isLoading
}) => (
  <div className="flex flex-col">
    <CategoriesSidebar
      onSelectCategory={onCategorySelect}
      selectedCategory={urlParams.category}
      selectedSubCategory={urlParams.subcategory}
    />

    <FeedNavigation
      handlefeedGrid={setGridNumber}
      onSortChange={onSortChange}
      currentSort={urlParams.sort}
    />

    <FilterIndicator
      urlParams={urlParams}
      posts={posts}
      onClearFilters={onClearFilters}
    />

    <MainContent
      posts={posts}
      pagination={pagination}
      currentUser={currentUser}
      gridNumber={gridNumber}
      onLike={onLike}
      onPageChange={onPageChange}
      isLoading={isLoading}
    />
  </div>
);

const MainContent = ({
  posts,
  pagination,
  currentUser,
  gridNumber,
  onLike,
  onPageChange,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <h1>No posts found</h1>
      </div>
    );
  }

  return (
    <>
      <PostsGrid
        posts={posts}
        currentUser={currentUser}
        gridNumber={gridNumber}
        onLike={onLike}
      />

      {pagination.totalPages > 1 && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default HomePage;