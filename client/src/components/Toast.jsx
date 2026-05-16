import { useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { ToastContext } from "../hooks/useToast";

const ICONS = {
 success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
 error: <XCircle size={18} className="text-red-500 shrink-0" />,
 warning: <AlertCircle size={18} className="text-yellow-500 shrink-0" />,
};

const BG = {
 success: "border-l-green-500",
 error: "border-l-red-500",
 warning: "border-l-yellow-500",
};

export const ToastProvider = ({ children }) => {
 const [toasts, setToasts] = useState([]);

 const toast = useCallback(({ message, type = "success", duration = 3500 }) => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(
   () => setToasts((prev) => prev.filter((t) => t.id !== id)),
   duration,
  );
 }, []);

 const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

 return (
  <ToastContext.Provider value={toast}>
   {children}
   <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
    {toasts.map((t) => (
     <div
      key={t.id}
      className={`flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-100 border-l-4 ${BG[t.type]} px-4 py-3 animate-in slide-in-from-right`}
     >
      {ICONS[t.type]}
      <p className="text-sm text-gray-800 flex-1">{t.message}</p>
      <button
       onClick={() => dismiss(t.id)}
       className="text-gray-400 hover:text-gray-600"
      >
       <X size={14} />
      </button>
     </div>
    ))}
   </div>
  </ToastContext.Provider>
 );
};
