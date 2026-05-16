const LoadingSpinner = ({ fullScreen = false, size = "md" }) => {
 const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

 const spinner = (
  <div
   className={`${sizes[size]} border-3 border-[#EBEEEF] border-t-[#00A896] rounded-full animate-spin`}
  />
 );

 if (fullScreen) {
  return (
   <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    {spinner}
   </div>
  );
 }

 return spinner;
};

export default LoadingSpinner;
