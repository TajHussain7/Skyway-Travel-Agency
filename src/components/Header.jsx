import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/flights", label: "Flights" },
    { path: "/umrah", label: "Umrah" },
    { path: "/offers", label: "Offers" },
    { path: "/about-us", label: "About" },
    { path: "/contact-us", label: "Contact" },
  ];

  return (
    <>
      {/* Top Header */}
      <div className="bg-white border-b-4 border-primary py-3 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-300">
                <i className="fas fa-phone"></i>
                <a
                  href="https://wa.me/+923438002540"
                  className="no-underline hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +923438002540
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-300">
                <i className="fas fa-envelope"></i>
                <a
                  href="mailto:SkyWayTravels@gmail.com"
                  className="no-underline hover:text-primary"
                >
                  SkyWayTravels@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook text-lg"></i>
            </a>
            <a
              href="#"
              className="text-blue-400 hover:text-blue-500 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-twitter text-lg"></i>
            </a>
            <a
              href="#"
              className="text-red-500 hover:text-red-600 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram text-lg"></i>
            </a>
            <a
              href="#"
              className="text-gray-800 hover:text-gray-900 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github text-lg"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary font-semibold text-lg hover:opacity-80 transition-opacity duration-300"
            >
              <i className="fas fa-plane-departure text-4xl"></i>
              <span className="hidden sm:inline">SkyWay</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-primary bg-primary-light"
                      : "text-gray-600 hover:text-primary hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-md font-medium bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Login
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-primary text-xl hover:opacity-70 transition-opacity"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i
                className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}
              ></i>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-primary bg-primary-light"
                      : "text-gray-600 hover:text-primary hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-2 rounded-md font-medium bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
