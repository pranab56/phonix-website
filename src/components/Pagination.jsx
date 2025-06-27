import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

/**
 * Reusable pagination component
 * @param {Object} props Component props
 * @param {number} props.currentPage Current active page
 * @param {number} props.totalPages Total number of pages
 * @param {Function} props.onPageChange Callback function when page changes
 * @param {string} props.className Additional CSS classes
 * @param {string} props.size Button size (small, middle, large)
 */
const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    className = '',
    size = 'small'
}) => {
    // Calculate range of pages to show (max 5 pages)
    const getPageRange = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // If current page is near the beginning
        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }

        // If current page is near the end
        if (currentPage >= totalPages - 2) {
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        // Current page is in the middle
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    // Don't render pagination if there's only one page
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = getPageRange();

    return (
        <div className={`flex items-center justify-center my-4 ${className}`}>
            {/* Previous button */}
            <Button
                type="default"
                icon={<LeftOutlined />}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size={size}
                className="mr-1"
            />

            {/* First page button if not in range */}
            {pageNumbers[0] > 1 && (
                <>
                    <Button
                        type={currentPage === 1 ? "primary" : "default"}
                        onClick={() => onPageChange(1)}
                        size={size}
                    >
                        1
                    </Button>
                    {pageNumbers[0] > 2 && <span className="mx-1">...</span>}
                </>
            )}

            {/* Page numbers */}
            {pageNumbers.map(number => (
                <Button
                    key={number}
                    type={currentPage === number ? "primary" : "default"}
                    onClick={() => onPageChange(number)}
                    size={size}
                    className="mx-0.5"
                >
                    {number}
                </Button>
            ))}

            {/* Last page button if not in range */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="mx-1">...</span>}
                    <Button
                        type={currentPage === totalPages ? "primary" : "default"}
                        onClick={() => onPageChange(totalPages)}
                        size={size}
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            {/* Next button */}
            <Button
                type="default"
                icon={<RightOutlined />}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size={size}
                className="ml-1"
            />
        </div>
    );
};

export default Pagination;