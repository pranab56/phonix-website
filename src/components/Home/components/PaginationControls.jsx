import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Pagination } from 'antd';

const PaginationControls = ({ pagination, onPageChange }) => (
  <div className="flex justify-center my-1">
    <Pagination
      current={pagination.currentPage}
      total={pagination.totalPosts}
      pageSize={pagination.postsPerPage}
      onChange={onPageChange}
      showSizeChanger={false}
      itemRender={(current, type, originalElement) => {
        if (type === 'prev') return <Button icon={<LeftOutlined />} />;
        if (type === 'next') return <Button icon={<RightOutlined />} />;
        return originalElement;
      }}
    />
  </div>
);

export default PaginationControls;