import React from 'react';
import { Button } from 'antd';
import './CustomPagination.css';

/**
 * Custom Pagination Component
 * Reusable pagination component with page size selector on left and controls on right
 * Based on the pagination logic from AreasTable.js
 */
const CustomPagination = ({
    currentPage = 1,
    pageSize = 10,
    total = 0,
    pageSizeOptions = [10, 20, 50],
    onPageChange,
    onPageSizeChange,
    showTotal = true,
    showPageSizeSelector = true,
    className = '',
    style = {}
}) => {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    const handlePageChange = (page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    const handlePageSizeChange = (e) => {
        if (onPageSizeChange) {
            onPageSizeChange(Number(e.target.value));
        }
    };

    return (
        <div
            className={`custom-pagination ${className}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8,
                marginTop: 16,
                ...style
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Page Size Selector - Left Side */}
                {showPageSizeSelector && (
                    <select
                        className="page-size-selector"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                )}

                {/* Pagination Controls - Right Side */}
                <div className="pagination-controls">
                    <Button
                        type="text"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || total === 0}
                    >
                        {'<<'}
                    </Button>
                    <Button
                        type="text"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || total === 0}
                    >
                        {'<'}
                    </Button>
                    <Button type="primary" disabled={total === 0}>
                        {currentPage}
                    </Button>
                    <Button
                        type="text"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || total === 0}
                    >
                        {'>'}
                    </Button>
                    <Button
                        type="text"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || total === 0}
                    >
                        {'>>'}
                    </Button>
                </div>
            </div>

            {/* Total Display */}
            {showTotal && (
                <span className="pagination-total">
                    Hiển thị từ {startItem} đến {endItem} trong tổng số {total}
                </span>
            )}
        </div>
    );
};

export default CustomPagination; 