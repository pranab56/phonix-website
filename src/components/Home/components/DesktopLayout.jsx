import CategoriesSidebar from '../../CategoriesSidebar';
import FeedNavigation from '../../FeedNavigation';
import FilterIndicator from './FilterIndicator';
import MainContent from './MainContent';

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

export default DesktopLayout;