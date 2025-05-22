
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const TransactionsPagination: React.FC<TransactionsPaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const isMobile = useIsMobile();
  
  if (totalPages <= 1) return null;
  
  // Calculate page range to display
  const visiblePages = [];
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;
  
  if (isMobile) {
    // Simplified pagination for mobile: current page, previous and next buttons
    visiblePages.push(currentPage);
  } else if (totalPages <= 7) {
    // If we have 7 pages or fewer, show all pages
    for (let i = 1; i <= totalPages; i++) {
      visiblePages.push(i);
    }
  } else {
    // Always show page 1
    visiblePages.push(1);
    
    // Show ellipsis if not near the start
    if (showEllipsisStart) {
      visiblePages.push(-1); // -1 signifies ellipsis
    }
    
    // Calculate the range of pages around the current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    // Show ellipsis if not near the end
    if (showEllipsisEnd) {
      visiblePages.push(-2); // -2 signifies ellipsis (using different value to avoid React key issues)
    }
    
    // Always show the last page
    visiblePages.push(totalPages);
  }
  
  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent className="flex-wrap justify-center">
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(currentPage - 1)} 
                className={isMobile ? "px-2" : ""}
              />
            </PaginationItem>
          )}
          
          {visiblePages.map((page, index) => (
            page < 0 ? (
              <PaginationItem key={`ellipsis-${page}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(currentPage + 1)} 
                className={isMobile ? "px-2" : ""}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};
