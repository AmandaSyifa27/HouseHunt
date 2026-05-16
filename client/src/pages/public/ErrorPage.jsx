import { useNavigate, useRouteError } from "react-router-dom";
import { Home, ArrowLeft, SearchX, ServerCrash } from "lucide-react";

const ErrorPage = ({ type = "notfound" }) => {
 const navigate = useNavigate();
 const routeError = useRouteError?.();

 const is404 = type === "notfound" || routeError?.status === 404;

 return (
  <div className="min-h-screen flex flex-col bg-white">
   {/* Minimal Navbar */}
   <nav className="border-b border-gray-100 px-6 h-16 flex items-center">
    <span className="text-2xl font-bold">
     <span style={{ color: "#002F34" }}>House</span>
     <span style={{ color: "#00A896" }}>Hunt</span>
    </span>
   </nav>

   <div className="flex-1 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
     {/* Illustration */}
     <div
      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
      style={{ backgroundColor: "#EBEEEF" }}
     >
      {is404 ? (
       <SearchX size={40} style={{ color: "#002F34" }} />
      ) : (
       <ServerCrash size={40} style={{ color: "#002F34" }} />
      )}
     </div>

     {/* Error code */}
     <h1 className="text-8xl font-bold mb-2" style={{ color: "#EBEEEF" }}>
      {is404 ? "404" : "500"}
     </h1>

     <h2 className="text-2xl font-bold text-gray-900 mb-3">
      {is404 ? "Page Not Found" : "Something Went Wrong"}
     </h2>

     <p className="text-gray-500 mb-8 leading-relaxed">
      {is404
       ? "The page you're looking for doesn't exist or has been moved. Let's get you back on track."
       : "We're experiencing some technical difficulties. Please try again in a moment."}
     </p>

     <div className="flex items-center justify-center gap-3">
      <button
       onClick={() => navigate(-1)}
       className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#002F34] hover:text-[#002F34] transition-colors"
      >
       <ArrowLeft size={16} />
       Go Back
      </button>
      <button
       onClick={() => navigate("/")}
       className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
       style={{ backgroundColor: "#002F34" }}
      >
       <Home size={16} />
       Back to Home
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default ErrorPage;
