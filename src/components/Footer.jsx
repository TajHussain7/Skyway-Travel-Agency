import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-600 to-gray-800 text-white ">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 px-4">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <i className="fas fa-plane-departure"></i>
              SkyWay Travel Agency
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for seamless travel experiences worldwide. We
              make your journey memorable and hassle-free.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 hover:-translate-y-1 transition-all duration-300"
              >
                <i className="fab fa-facebook text-lg"></i>
              </a>
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 hover:-translate-y-1 transition-all duration-300"
              >
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a
                href="#"
                className="text-pink-400 hover:text-pink-300 hover:-translate-y-1 transition-all duration-300"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a
                href="#"
                className="text-blue-500 hover:text-blue-400 hover:-translate-y-1 transition-all duration-300"
              >
                <i className="fab fa-linkedin text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/flights"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Flights
                </Link>
              </li>
              <li>
                <Link
                  to="/umrah"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Umrah Packages
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/flights"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Flight Booking
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Travel Insurance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Visa Assistance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Hotel Booking
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Car Rental
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  Travel Guides
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <i className="fas fa-phone text-primary mt-1 flex-shrink-0"></i>
                <a
                  href="https://wa.me/+923438002540"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  +923438002540
                </a>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-envelope text-primary mt-1 flex-shrink-0"></i>
                <a
                  href="mailto:SkyWayTravels@gmail.com"
                  className="text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  SkyWayTravels@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-map-marker-alt text-primary mt-1 flex-shrink-0"></i>
                <span className="text-gray-300">
                  Avenue 1 Khayaban-e-Jinnah, Pir Mansur Johar Town, Lahore,
                  Punjab, Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-500 mt-8 py-8 text-center text-gray-300 text-sm">
          <p>
            © 2025 <strong>Skyway Travel Agency</strong>. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
