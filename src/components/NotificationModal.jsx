import { useEffect } from "react";

const NotificationModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
  autoClose = true,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-50",
      icon: "fas fa-check-circle text-green-600",
      border: "border-green-200",
      progressBar: "bg-green-600",
    },
    error: {
      bg: "bg-red-50",
      icon: "fas fa-times-circle text-red-600",
      border: "border-red-200",
      progressBar: "bg-red-600",
    },
    warning: {
      bg: "bg-yellow-50",
      icon: "fas fa-exclamation-triangle text-yellow-600",
      border: "border-yellow-200",
      progressBar: "bg-yellow-600",
    },
    info: {
      bg: "bg-blue-50",
      icon: "fas fa-info-circle text-blue-600",
      border: "border-blue-200",
      progressBar: "bg-blue-600",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-bounceIn">
        <div
          className={`${style.bg} ${style.border} border-b px-6 py-4 rounded-t-xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <i className={`${style.icon} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {autoClose && (
          <div className="h-1 bg-gray-200 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${style.progressBar} animate-progress`}
              style={{ animationDuration: `${duration}ms` }}
            ></div>
          </div>
        )}

        {!autoClose && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
