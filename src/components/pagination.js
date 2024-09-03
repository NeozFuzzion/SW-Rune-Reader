import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;

    if (totalPages <= maxPageNumbersToShow) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
        let endPage = startPage + maxPageNumbersToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = endPage - maxPageNumbersToShow + 1;
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (startPage > 1) {
            pageNumbers.unshift('...');
            pageNumbers.unshift(1);
        }

        if (endPage < totalPages) {
            pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ margin: '0 5px' }}
            >
                Previous
            </button>

            {pageNumbers.map((number, index) => (
                <button
                    key={index}
                    onClick={() => typeof number === 'number' && onPageChange(number)}
                    disabled={number === currentPage || number === '...'}
                    style={{
                        margin: '0 5px',
                        backgroundColor: number === currentPage ? '#61dafb' : '#282c34',
                        color: number === currentPage ? '#282c34' : '#ffffff',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '5px 10px',
                        cursor: number === '...' ? 'default' : 'pointer'
                    }}
                >
                    {number}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ margin: '0 5px' }}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;