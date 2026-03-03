import { useNavigate } from "react-router-dom";

const LoginPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate("/login", { state: { from: window.location.pathname } });
  };

  const handleRegister = () => {
    navigate("/register", { state: { from: window.location.pathname } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-bounceIn">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                <i className="fas fa-lock text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white">Login Required</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            To book this amazing offer, please login to your account or create a
            new one. It only takes a minute!
          </p>

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3"
            >
              <i className="fas fa-sign-in-alt"></i>
              Login to Your Account
            </button>

            <button
              onClick={handleRegister}
              className="w-full px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3"
            >
              <i className="fas fa-user-plus"></i>
              Create New Account
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
