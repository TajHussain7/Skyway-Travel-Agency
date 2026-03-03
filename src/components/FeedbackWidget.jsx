import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const FeedbackWidget = ({ onClose, userEmail, userName }) => {
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError("Please select a rating");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/user/feedback`, {
        email: userEmail,
        name: userName,
        rating,
        message,
        type: "general",
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md mx-auto text-center w-full">
        <div className="mb-3 md:mb-4">
          <i className="fas fa-check-circle text-4xl md:text-5xl text-green-500"></i>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-gray-600">
          Your feedback has been submitted successfully. We appreciate your
          input!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-md mx-auto max-h-[85vh] md:max-h-[90vh] overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-comment-dots text-primary"></i>
          Share Your Feedback
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
            How would you rate your experience?
          </label>
          <div className="flex justify-center gap-2 md:gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setError("");
                }}
                className={`text-2xl md:text-3xl transition-all transform hover:scale-110 ${
                  rating && star <= rating
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                <i className="fas fa-star"></i>
              </button>
            ))}
          </div>
          {rating && (
            <p className="text-center text-sm text-gray-500 mt-2">
              {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError("");
            }}
            placeholder="Tell us what you think..."
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm md:text-base"
            rows="3"
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            Max 500 characters • Markdown supported
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-red-500"></i>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-2.5 md:py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackWidget;
