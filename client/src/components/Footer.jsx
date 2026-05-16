import { Link } from "react-router-dom";

const Footer = () => (
 <footer className="border-t border-gray-100 mt-auto">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
   <div className="flex items-center gap-1">
    <span className="text-sm font-bold">
     <span style={{ color: "#002F34" }}>House</span>
     <span style={{ color: "#00A896" }}>Hunt</span>
    </span>
    <span className="text-xs text-gray-400 ml-2">
     © {new Date().getFullYear()} HouseHunt. All rights reserved. Premium
     Property Management.
    </span>
   </div>
   <div className="flex items-center gap-6 text-xs text-gray-500">
    <Link to="#" className="hover:text-gray-800 transition-colors">
     Privacy Policy
    </Link>
    <Link to="#" className="hover:text-gray-800 transition-colors">
     Terms of Service
    </Link>
    <Link to="#" className="hover:text-gray-800 transition-colors">
     Cookie Policy
    </Link>
    <Link to="#" className="hover:text-gray-800 transition-colors">
     Support
    </Link>
   </div>
  </div>
 </footer>
);

export default Footer;
