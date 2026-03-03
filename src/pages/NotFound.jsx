import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home with search query or implement search functionality
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary-dark/5 flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Large 404 Background Text */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <svg
            width="761"
            height="301"
            viewBox="0 0 761 301"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto max-w-4xl"
          >
            <path
              d="M0.596592 241.023V199.119L124.034 4.0909H158.977V63.75H137.67L54.5739 195.426V197.699H226.875V241.023H0.596592ZM139.375 295V228.239L139.943 209.489V4.0909H189.659V295H139.375ZM379.787 300.54C356.397 300.54 336.321 294.621 319.56 282.784C302.893 270.852 290.062 253.665 281.065 231.222C272.164 208.684 267.713 181.553 267.713 149.83C267.808 118.106 272.306 91.1174 281.207 68.8636C290.204 46.5151 303.035 29.4697 319.702 17.7273C336.463 5.98484 356.491 0.113626 379.787 0.113626C403.082 0.113626 423.111 5.98484 439.872 17.7273C456.634 29.4697 469.465 46.5151 478.366 68.8636C487.363 91.2121 491.861 118.201 491.861 149.83C491.861 181.648 487.363 208.826 478.366 231.364C469.465 253.807 456.634 270.947 439.872 282.784C423.205 294.621 403.177 300.54 379.787 300.54ZM379.787 256.08C397.969 256.08 412.315 247.131 422.827 229.233C433.433 211.241 438.736 184.773 438.736 149.83C438.736 126.723 436.321 107.311 431.491 91.5909C426.662 75.8712 419.844 64.0341 411.037 56.0795C402.23 48.0303 391.813 44.0057 379.787 44.0057C361.7 44.0057 347.401 53.0019 336.889 70.9943C326.378 88.892 321.075 115.17 320.98 149.83C320.885 173.03 323.205 192.538 327.94 208.352C332.77 224.167 339.588 236.098 348.395 244.148C357.202 252.102 367.666 256.08 379.787 256.08ZM533.8 241.023V199.119L657.237 4.0909H692.18V63.75H670.874L587.777 195.426V197.699H760.078V241.023H533.8ZM672.578 295V228.239L673.146 209.489V4.0909H722.862V295H672.578Z"
              fill="currentColor"
              className="text-gray-400"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="z-10 max-w-2xl w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 space-y-8 animate-fadeIn">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                <i className="fas fa-exclamation-triangle text-4xl text-white"></i>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                We Lost This Page
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
                The page you are looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search our site..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-medium"
              >
                Search
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Go Back</span>
              </button>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <i className="fas fa-home"></i>
                <span>Go Home</span>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Or try these popular pages:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  to="/flights"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <i className="fas fa-plane-departure text-2xl text-primary group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium text-gray-700">
                    Flights
                  </span>
                </Link>
                <Link
                  to="/umrah"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <i className="fas fa-kaaba text-2xl text-primary group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium text-gray-700">
                    Umrah
                  </span>
                </Link>
                <Link
                  to="/offers"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <i className="fas fa-tag text-2xl text-primary group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium text-gray-700">
                    Offers
                  </span>
                </Link>
                <Link
                  to="/contact-us"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <i className="fas fa-phone text-2xl text-primary group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium text-gray-700">
                    Contact
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-dark/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
