import React from "react";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const getItemProps = (index: number) => ({
        variant: currentPage === index ? "gradient" : "text",
        color: currentPage === index ? "blue" : "blue-gray",
        onClick: () => onPageChange(index),
        className: `rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 font-bold text-sm ${currentPage === index
            ? "shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40"
            : "hover:bg-blue-gray-50 text-blue-gray-500"
            }`,
    } as any);

    const next = () => {
        if (currentPage === totalPages) return;
        onPageChange(currentPage + 1);
    };

    const prev = () => {
        if (currentPage === 1) return;
        onPageChange(currentPage - 1);
    };

    // Logic to show limited page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-blue-gray-50 shadow-sm">
            <Button
                variant="text"
                className="flex items-center gap-2 rounded-full px-4 py-2 font-semibold capitalize text-blue-gray-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                onClick={prev}
                disabled={currentPage === 1}
            >
                <ArrowLeftIcon strokeWidth={2} className="h-3.5 w-3.5" /> Previous
            </Button>
            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, index) =>
                    typeof page === "string" ? (
                        <span key={index} className="text-blue-gray-400 font-medium px-1 select-none">
                            ...
                        </span>
                    ) : (
                        <IconButton key={index} {...getItemProps(page)}>
                            {page}
                        </IconButton>
                    )
                )}
            </div>
            <Button
                variant="text"
                className="flex items-center gap-2 rounded-full px-4 py-2 font-semibold capitalize text-blue-gray-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                onClick={next}
                disabled={currentPage === totalPages}
            >
                Next <ArrowRightIcon strokeWidth={2} className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export default Pagination;
