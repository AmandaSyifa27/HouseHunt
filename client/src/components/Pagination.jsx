import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
 if (totalPages <= 1) return null;

 const getPages = () => {
  const pages = [];
  if (totalPages <= 7) {
   for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
   pages.push(1);
   if (currentPage > 3) pages.push("...");
   for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
   ) {
    pages.push(i);
   }
   if (currentPage < totalPages - 2) pages.push("...");
   pages.push(totalPages);
  }
  return pages;
 };

 return (
  <div className="flex items-center justify-center gap-1 mt-8">
   <button
    onClick={() => onPageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#002F34] hover:text-[#002F34] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
   >
    <ChevronLeft size={16} />
   </button>

   {getPages().map((page, idx) =>
    page === "..." ? (
     <span
      key={`ellipsis-${idx}`}
      className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
     >
      ...
     </span>
    ) : (
     <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
       currentPage === page
        ? "text-white"
        : "border border-gray-200 text-gray-700 hover:border-[#002F34] hover:text-[#002F34]"
      }`}
      style={currentPage === page ? { backgroundColor: "#002F34" } : {}}
     >
      {page}
     </button>
    ),
   )}

   <button
    onClick={() => onPageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#002F34] hover:text-[#002F34] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
   >
    <ChevronRight size={16} />
   </button>
  </div>
 );
};

export default Pagination;
