import { useState, useEffect } from "react";
import axios from "axios";

const MandatoryFeedbackModal = ({ settings, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }

    if (!message.trim()) {
      setError("Please provide your feedback");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await axios.post(
        "/api/user/feedback",
        {
          rating,
          category,
          message: message.trim(),
          type: "evaluation",
          feedbackType: "mandatory",
        },
        { withCredentials: true },
      );

      // Call onClose to refresh user data and close modal
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(
        error.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <i className="fas fa-comment-dots text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-center">
            {settings?.feedbackTitle || "We Value Your Feedback"}
          </h2>
          <p className="text-white/90 text-center mt-2">
            {settings?.feedbackMessage ||
              "Please share your experience with SkyWay Travel Agency"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="text-center">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              How would you rate your experience?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all transform hover:scale-110"
                >
                  <i
                    className={`fas fa-star text-5xl ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {rating === 0
                ? "Click to rate"
                : rating === 1
                  ? "Poor"
                  : rating === 2
                    ? "Fair"
                    : rating === 3
                      ? "Good"
                      : rating === 4
                        ? "Very Good"
                        : "Excellent"}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-tags mr-2 text-primary"></i>
              Feedback Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
            >
              <option value="general">General Experience</option>
              <option value="booking">Booking Process</option>
              <option value="customer_service">Customer Service</option>
              <option value="website">Website Usability</option>
              <option value="flights">Flight Options</option>
              <option value="pricing">Pricing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-comment mr-2 text-primary"></i>
              Your Feedback *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Tell us about your experience..."
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters required
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why we need your feedback:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Helps us improve our services</li>
                  <li>Ensures better customer experience</li>
                  <li>Guides our future developments</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !message.trim() || rating === 0}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
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

          <p className="text-center text-xs text-gray-500">
            Your feedback will help us serve you better. Thank you for your
            time!
          </p>
        </form>
      </div>
    </div>
  );
};

export default MandatoryFeedbackModal;
