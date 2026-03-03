import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FeedbackWidget from "../../components/FeedbackWidget";
import axios from "axios";

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("feedback");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [showWidget, setShowWidget] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOpenWidget = (e) => {
    e.preventDefault();
    if (!userEmail || !userName) {
      alert("Please enter your name and email");
      return;
    }
    setShowWidget(true);
  };

  const handleCloseWidget = () => {
    setShowWidget(false);
    setUserEmail("");
    setUserName("");
    setSuccessMessage("Thank you for your feedback!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-6 md:py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container relative z-10 px-4">
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              <i className="fas fa-comments me-2 md:me-3"></i>
              Your Feedback Matters
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-100 max-w-3xl mx-auto px-4">
              Help us improve SkyWay Travel by sharing your thoughts and
              suggestions
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 md:py-10 lg:py-12 bg-gray-50 min-h-screen">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="bg-white rounded-t-lg shadow-md border-b border-gray-200 flex flex-wrap">
              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex-1 py-3 md:py-4 px-3 md:px-6 text-center font-medium transition-all text-sm md:text-base ${
                  activeTab === "feedback"
                    ? "text-primary border-b-2 border-primary bg-primary bg-opacity-5"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-star me-1 md:me-2"></i>
                <span className="hidden sm:inline">Share </span>Feedback
              </button>
              <button
                onClick={() => setActiveTab("suggestions")}
                className={`flex-1 py-3 md:py-4 px-3 md:px-6 text-center font-medium transition-all text-sm md:text-base ${
                  activeTab === "suggestions"
                    ? "text-primary border-b-2 border-primary bg-primary bg-opacity-5"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-lightbulb me-1 md:me-2"></i>
                <span className="hidden sm:inline">Feature </span>Suggestions
              </button>
              <button
                onClick={() => setActiveTab("issues")}
                className={`flex-1 py-3 md:py-4 px-3 md:px-6 text-center font-medium transition-all text-sm md:text-base ${
                  activeTab === "issues"
                    ? "text-primary border-b-2 border-primary bg-primary bg-opacity-5"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fas fa-exclamation-circle me-1 md:me-2"></i>
                <span className="hidden sm:inline">Report </span>Issues
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4 flex items-center gap-3">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
                <span className="text-green-800 font-semibold">
                  {successMessage}
                </span>
              </div>
            )}

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
              {activeTab === "feedback" && (
                <div className="p-4 md:p-6 lg:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      Share Your Experience
                    </h2>
                    <p className="text-gray-600">
                      We'd love to hear about your experience with SkyWay
                      Travel. Your feedback helps us serve you better.
                    </p>
                  </div>

                  <form onSubmit={handleOpenWidget} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-user me-2"></i>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-envelope me-2"></i>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <i className="fas fa-arrow-right"></i>
                      Open Feedback Form
                    </button>
                  </form>

                  {/* Info Box */}
                  <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                    <div className="flex gap-3">
                      <i className="fas fa-info-circle text-blue-500 text-xl mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">
                          What happens next?
                        </h4>
                        <ul className="text-blue-800 space-y-1 text-sm">
                          <li>✓ Your feedback is reviewed by our team</li>
                          <li>✓ We respond within 24-48 hours</li>
                          <li>✓ Your suggestions help shape SkyWay's future</li>
                          <li>✓ All feedback is kept confidential</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "suggestions" && (
                <div className="p-4 md:p-6 lg:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      Suggest a Feature
                    </h2>
                    <p className="text-gray-600">
                      Have an idea that would make SkyWay Travel better? We'd
                      love to hear it!
                    </p>
                  </div>

                  <form onSubmit={handleOpenWidget} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-user me-2"></i>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-envelope me-2"></i>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-arrow-right"></i>
                      Share Suggestion
                    </button>
                  </form>

                  {/* Recent Suggestions */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Popular Feature Ideas
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Mobile app for easier booking",
                        "Loyalty rewards program",
                        "Real-time flight notifications",
                        "Travel insurance integration",
                      ].map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <i className="fas fa-thumbs-up text-primary"></i>
                          <span className="text-gray-700">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "issues" && (
                <div className="p-4 md:p-6 lg:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      Report an Issue
                    </h2>
                    <p className="text-gray-600">
                      Found a bug or something not working? Let us know so we
                      can fix it quickly.
                    </p>
                  </div>

                  <form onSubmit={handleOpenWidget} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-user me-2"></i>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-envelope me-2"></i>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-arrow-right"></i>
                      Report Issue
                    </button>
                  </form>

                  {/* Info Box */}
                  <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                    <div className="flex gap-3">
                      <i className="fas fa-lightbulb text-yellow-500 text-xl mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          Tips for reporting issues:
                        </h4>
                        <ul className="text-yellow-800 space-y-1 text-sm">
                          <li>• Describe what happened step by step</li>
                          <li>• Include your browser and device information</li>
                          <li>• Attach screenshots if possible</li>
                          <li>
                            • Our support team will investigate and respond
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Widget Modal */}
      {showWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="animate-fade-in">
            <FeedbackWidget
              onClose={handleCloseWidget}
              userEmail={userEmail}
              userName={userName}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Feedback;
