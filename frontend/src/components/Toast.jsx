/**
 * Toast Notification Component
 * Displays success/error messages to users
 * 
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - 'success' or 'error'
 * @param {boolean} props.show - Whether to show the toast
 * @param {Function} props.onClose - Callback to close the toast
 */
import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

function Toast({ message, type = 'success', show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const toastConfig = {
    success: {
      bg: 'bg-purple-500',
      border: 'border-purple-600',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      icon: <XCircle className="w-5 h-5" />,
    }
  };

  const config = toastConfig[type];

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full duration-300">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg shadow-black/10 flex items-center gap-3 border backdrop-blur-sm min-w-80 max-w-md ${config.bg} ${config.border} text-white`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        
        {/* Message */}
        <div className="flex-1">
          <span className="font-semibold text-sm leading-tight">
            {message}
          </span>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 hover:bg-white/20 rounded-full p-1 transition-all w-6 h-6 flex items-center justify-center"
          aria-label="Close notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default Toast;