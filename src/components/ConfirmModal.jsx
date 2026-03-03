import { useEffect } from "react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
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
    danger: {
      bg: "bg-red-50",
      icon: "fas fa-exclamation-triangle text-red-600",
      button: "bg-red-600 hover:bg-red-700",
      border: "border-red-200",
    },
    warning: {
      bg: "bg-yellow-50",
      icon: "fas fa-exclamation-circle text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700",
      border: "border-yellow-200",
    },
    info: {
      bg: "bg-blue-50",
      icon: "fas fa-info-circle text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      border: "border-blue-200",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        <div
          className={`${style.bg} ${style.border} border-b px-6 py-4 rounded-t-xl`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <i className={`${style.icon} text-xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${style.button} text-white px-5 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
