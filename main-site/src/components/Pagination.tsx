import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  perPage: number
  onPageChange: (page: number) => void
  from?: number
  to?: number
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  perPage,
  onPageChange,
  from,
  to
}) => {
  // Don't show pagination if there's only one page or no data
  if (totalPages <= 1) return null

  // Calculate from and to if not provided
  const displayFrom = from ?? (currentPage - 1) * perPage + 1
  const displayTo = to ?? Math.min(currentPage * perPage, totalRecords)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="pagination-wrapper">
      <style>{`
        .pagination-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          padding: 30px 0 10px;
          margin-top: 30px;
          border-top: 2px solid rgba(4, 158, 187, 0.1);
        }
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pagination-btn {
          min-width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          background: var(--surface-color);
          color: var(--heading-color);
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .pagination-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--accent-color);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .pagination-btn span {
          position: relative;
          z-index: 1;
        }

        .pagination-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(4, 158, 187, 0.25);
          border-color: var(--accent-color);
        }

        .pagination-btn:hover:not(:disabled)::before {
          opacity: 0.1;
        }

        .pagination-btn:active:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 3px 12px rgba(4, 158, 187, 0.2);
        }

        .pagination-btn.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          box-shadow: 0 6px 20px rgba(4, 158, 187, 0.35);
          transform: translateY(-2px);
        }

        .pagination-btn.active::before {
          opacity: 0;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        .pagination-btn.nav-btn {
          padding: 0 16px;
          font-weight: 700;
          gap: 6px;
        }

        .pagination-btn.nav-btn i {
          font-size: 0.85rem;
          transition: transform 0.3s ease;
        }

        .pagination-btn.nav-btn:hover:not(:disabled) i.bi-chevron-left {
          transform: translateX(-3px);
        }

        .pagination-btn.nav-btn:hover:not(:disabled) i.bi-chevron-right {
          transform: translateX(3px);
        }

        .pagination-ellipsis {
          min-width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 2px;
        }

        /* Responsive Design */
        @media (max-width: 576px) {
          .pagination-wrapper {
            padding: 20px 0;
            gap: 15px;
          }

          .pagination-info {
            font-size: 0.85rem;
            text-align: center;
          }

          .pagination-controls {
            gap: 6px;
          }

          .pagination-btn {
            min-width: 38px;
            height: 38px;
            font-size: 0.9rem;
            border-radius: 8px;
          }

          .pagination-btn.nav-btn {
            padding: 0 12px;
          }

          .pagination-ellipsis {
            min-width: 38px;
            height: 38px;
          }
        }

        /* Animation for page transitions */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pagination-wrapper {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
      {/* Pagination Controls */}
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          className="pagination-btn nav-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <i className="bi bi-chevron-left"></i>
          <span>Prev</span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <div key={`ellipsis-${index}`} className="pagination-ellipsis">
                •••
              </div>
            )
          }

          return (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page as number)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              <span>{page}</span>
            </button>
          )
        })}

        {/* Next Button */}
        <button
          className="pagination-btn nav-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}

export default Pagination
