/**
 * Functional core for pagination logic.
 * Contains pure functions for paging calculations.
 */

export interface PaginationInfo {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
    visiblePages: number;
}

/**
 * Calculates the array of page numbers/placeholders to display.
 * @returns Array like [1, '...', 4, 5, 6, '...', 10]
 */
export function calculateVisiblePages(info: PaginationInfo): (number | string)[] {
    const { totalCount, pageSize, pageIndex, visiblePages } = info;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const current = pageIndex;

    if (totalPages <= visiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const half = Math.floor(visiblePages / 2);

    let start = current - half;
    let end = current + half;

    if (start <= 1) {
        start = 1;
        end = visiblePages;
    }

    if (end >= totalPages) {
        end = totalPages;
        start = totalPages - visiblePages + 1;
    }

    // Ensure we show at least some pages if visiblePages is very small
    if (start < 1) start = 1;

    if (start > 1) {
        pages.push(1);
        if (start > 2) {
            pages.push('...');
        }
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            pages.push('...');
        }
        pages.push(totalPages);
    }

    return pages;
}

/**
 * Calculates the total number of pages.
 */
export function calculateTotalPages(totalCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(totalCount / pageSize));
}

/**
 * Calculates the start and end item index for current page (1-based).
 */
export function calculateDisplayRange(pageIndex: number, pageSize: number, totalCount: number) {
    const start = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
    const end = Math.min(pageIndex * pageSize, totalCount);
    return { start, end };
}
