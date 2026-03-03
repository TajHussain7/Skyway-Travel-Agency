import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const Home = () => {
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [destination, setDestination] = useState("");

  const destinationOptions = [
    { label: "Lahore", value: "Lahore" },
    { label: "Sialkot", value: "Sialkot" },
    { label: "Karachi", value: "Karachi" },
    { label: "Islamabad", value: "Islamabad" },
    { label: "Dubai", value: "Dubai" },
    { label: "London", value: "London" },
    { label: "New York", value: "New York" },
    { label: "Gujrat", value: "Gujrat" },
    { label: "Gujranwala", value: "Gujranwala" },
    { label: "Faisalabad", value: "Faisalabad" },
    { label: "Bahawalpur", value: "Bahawalpur" },
    { label: "Rawalpindi", value: "Rawalpindi" },
    { label: "Multan", value: "Multan" },
    { label: "Jhelum", value: "Jhelum" },
    { label: "Hyderabad", value: "Hyderabad" },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDepartureDate(today);
  }, []);

  return (
    <>
      <style>{`
        .p-dropdown {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          box-shadow: none !important;
        }
        .p-dropdown:hover {
          border-color: #d1d5db !important;
        }
        .p-dropdown.p-focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
        }
        .p-dropdown .p-dropdown-label {
          padding: 0.75rem 1rem !important;
          font-size: 1rem !important;
        }
        .p-dropdown .p-dropdown-trigger {
          width: 3rem !important;
        }
        .p-dropdown-panel {
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          margin-top: 0.25rem !important;
        }
        .p-dropdown-panel .p-dropdown-items {
          padding: 0.5rem !important;
        }
        .p-dropdown-panel .p-dropdown-item {
          padding: 0.75rem 1rem !important;
          border-radius: 0.375rem !important;
          margin: 0.125rem 0 !important;
          transition: all 0.2s !important;
        }
        .p-dropdown-panel .p-dropdown-item:hover {
          background-color: #f3f4f6 !important;
        }
        .p-dropdown-panel .p-dropdown-item.p-highlight {
          background-color: #667eea !important;
          color: white !important;
        }
        .p-dropdown-panel .p-dropdown-filter-container {
          padding: 0.5rem !important;
        }
        .p-dropdown-panel .p-dropdown-filter {
          padding: 0.5rem 1rem !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem !important;
        }
        .p-dropdown-panel .p-dropdown-filter:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
          outline: none !important;
        }
        
        /* Calendar Styles */
        .p-calendar {
          background: white !important;
        }
        .p-calendar .p-inputtext {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1rem !important;
          font-size: 1rem !important;
          color: #1f2937 !important;
          transition: all 0.2s !important;
        }
        .p-calendar .p-inputtext::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }
        .p-calendar .p-inputtext:hover {
          border-color: #d1d5db !important;
        }
        .p-calendar .p-inputtext:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
          outline: none !important;
        }
        .p-calendar .p-datepicker-trigger {
          background: transparent !important;
          color: #667eea !important;
          width: 3rem !important;
          border: none !important;
        }
        .p-calendar .p-datepicker-trigger:hover {
          background: transparent !important;
          color: #5a67d8 !important;
        }
        .p-datepicker {
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 0.5rem !important;
        }
        .p-datepicker .p-datepicker-header {
          background: white !important;
          border: none !important;
          padding: 0.5rem !important;
          border-radius: 0.375rem !important;
          margin-bottom: 0.5rem !important;
        }
        .p-datepicker .p-datepicker-title {
          color: #1f2937 !important;
          font-weight: 600 !important;
        }
        .p-datepicker .p-datepicker-prev,
        .p-datepicker .p-datepicker-next {
          color: #667eea !important;
          width: 2rem !important;
          height: 2rem !important;
          border-radius: 0.375rem !important;
        }
        .p-datepicker .p-datepicker-prev:hover,
        .p-datepicker .p-datepicker-next:hover {
          background-color: #f3f4f6 !important;
          color: #5a67d8 !important;
        }
        .p-datepicker table td {
          padding: 0.25rem !important;
        }
        .p-datepicker table td > span {
          width: 2.5rem !important;
          height: 2.5rem !important;
          border-radius: 0.375rem !important;
          transition: all 0.2s !important;
        }
        .p-datepicker table td > span:hover {
          background-color: #f3f4f6 !important;
        }
        .p-datepicker table td > span.p-highlight {
          background-color: #667eea !important;
          color: white !important;
          font-weight: 600 !important;
        }
        .p-datepicker table td.p-datepicker-today > span {
          background-color: #e0e7ff !important;
          color: #667eea !important;
          font-weight: 600 !important;
        }
        .p-datepicker table td.p-datepicker-today > span.p-highlight {
          background-color: #667eea !important;
          color: white !important;
        }
        .p-datepicker .p-monthpicker .p-monthpicker-month,
        .p-datepicker .p-yearpicker .p-yearpicker-year {
          border-radius: 0.375rem !important;
          padding: 0.5rem !important;
        }
        .p-datepicker .p-monthpicker .p-monthpicker-month:hover,
        .p-datepicker .p-yearpicker .p-yearpicker-year:hover {
          background-color: #f3f4f6 !important;
        }
        .p-datepicker .p-monthpicker .p-monthpicker-month.p-highlight,
        .p-datepicker .p-yearpicker .p-yearpicker-year.p-highlight {
          background-color: #667eea !important;
          color: white !important;
        }
      `}</style>
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="container">
            <div className="fade-in">
              <h1>Your Gateway to the World</h1>
              <p>
                Discover amazing destinations with SkyWay Travel Agency - Your
                trusted partner for seamless travel experiences
              </p>

              {/* Flight Search Card */}
              <div className="card mt-5 max-w-3xl mx-auto">
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-end">
                    <div className="form-group mb-0">
                      <label className="form-label">Departure Date</label>
                      <Calendar
                        value={departureDate ? new Date(departureDate) : null}
                        onChange={(e) => {
                          const formattedDate = e.value
                            ? e.value.toISOString().split("T")[0]
                            : "";
                          setDepartureDate(formattedDate);
                        }}
                        showIcon
                        dateFormat="yy-mm-dd"
                        placeholder="Select departure date"
                        className="w-full"
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Return Date</label>
                      <Calendar
                        value={returnDate ? new Date(returnDate) : null}
                        onChange={(e) => {
                          const formattedDate = e.value
                            ? e.value.toISOString().split("T")[0]
                            : "";
                          setReturnDate(formattedDate);
                        }}
                        showIcon
                        dateFormat="yy-mm-dd"
                        placeholder="Select return date"
                        className="w-full"
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Destination</label>
                      <Dropdown
                        value={destination}
                        onChange={(e) => setDestination(e.value)}
                        options={destinationOptions}
                        placeholder="Select destination"
                        filter
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <Link to="/flights" className="btn btn-primary btn-lg">
                      <i className="fas fa-search me-2"></i>Search Flights
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="slide-in-left">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="section-subtitle text-left mb-4">
                To simplify the process of booking flights by providing
                travelers with a <strong>reliable</strong>,{" "}
                <strong>fast</strong>, and
                <strong> easy-to-navigate</strong> platform. We aim to connect
                people with their destinations through innovation, exceptional
                customer service, and a user-friendly experience that meets
                modern travel needs.
              </p>
              <p className="section-subtitle text-left">
                Our commitment is to
                <strong>
                  {" "}
                  empower travelers with information, options, and tools{" "}
                </strong>
                to create stress-free, personalized journeys. Whether you're
                flying for business, leisure, or life's most important moments,
                our goal is to make your booking experience seamless, enjoyable,
                and tailored to your preferences.
              </p>
            </div>
            <div className="slide-in-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <div className="card overflow-hidden">
                    <img
                      src="/assets/images/airbus.jpg"
                      alt="Modern Aircraft"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="card overflow-hidden">
                    <img
                      src="/assets/images/Inside airplane.jpg"
                      alt="Cabin Interior"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="card overflow-hidden">
                    <img
                      src="/assets/images/autumn Place.jpg"
                      alt="Beautiful Destination"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="slide-in-left text-3xl font-bold mb-2">
            What We Offer
          </h2>
          <p className="slide-in-left text-gray-500 mb-8">
            Comprehensive travel services designed to make your journey perfect
          </p>

          <div className="slide-in-right grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "fa-shield-alt",
                title: "Travel Insurance",
                text: "Comprehensive coverage options for peace of mind",
              },
              {
                icon: "fa-headset",
                title: "24/7 Support",
                text: "Round-the-clock customer assistance",
              },
              {
                icon: "fa-map-marked-alt",
                title: "Destination Guides",
                text: "Local insights and travel recommendations",
              },
              {
                icon: "fa-passport",
                title: "Visa Assistance",
                text: "Expert help with visa applications and documentation support",
              },
              {
                icon: "fa-bell",
                title: "Price Alerts",
                text: "Notifications for the best deals",
              },
              {
                icon: "fa-exchange-alt",
                title: "Multi-Currency",
                text: "Support for multiple currencies",
              },
              {
                icon: "fa-lock",
                title: "Secure Payments",
                text: "Safe and encrypted transactions",
              },
              {
                icon: "fa-tag",
                title: "Best Price",
                text: "Guaranteed competitive pricing",
              },
            ].map((service, idx) => (
              <div key={idx} className="card text-center">
                <div className="card-body">
                  <i
                    className={`fas ${service.icon} text-4xl text-primary mb-4 block`}
                  ></i>
                  <h5 className="card-title text-lg">{service.title}</h5>
                  <p className="card-text text-sm">{service.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Packages Section */}
      <section className="section bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Hajj and Umrah Packages 2025
              </h2>
              <p className="text-white opacity-90 mb-6 text-left">
                Embark on a journey of spiritual fulfillment and enlightenment
                with our comprehensive Hajj and Umrah packages.
              </p>
              <Link
                to="/umrah"
                className="btn bg-white text-primary hover:shadow-lg hover:-translate-y-0.5 font-medium inline-block"
              >
                <i className="fas fa-kaaba me-2"></i>
                Explore Packages
              </Link>
            </div>
            <div className="text-center">
              <img
                src="/assets/images/Hajj and Umrah.jpg"
                alt="Hajj and Umrah"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Destinations Section */}
      <section
        className="section relative bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/images/Middle_Section Image.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="container relative z-10">
          <div className="text-center text-white">
            <p className="text-xl mb-4">Can't decide where to go?</p>
            <h2 className="text-4xl font-bold mb-8">
              Explore Every Destination
            </h2>
            <div className="text-center">
              <Link to="/flights" className="btn btn-primary btn-lg">
                <i className="fas fa-globe me-2"></i>
                Search Flights Everywhere
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        className="section"
        style={{ backgroundColor: "var(--primary-light)" }}
      >
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Subscribe for Awesome Discounts</h2>
            <p className="section-subtitle mb-8">
              Get notified about our best deals and exclusive offers
            </p>
            <div className="card max-w-2xl mx-auto">
              <div className="card-body">
                <div className="form-group flex flex-col md:flex-row gap-3 items-end mb-0">
                  <input
                    type="email"
                    className="form-control flex-1"
                    placeholder="Enter your email address"
                    id="subscribEmail"
                  />
                  <button
                    type="button"
                    className="btn btn-primary whitespace-nowrap"
                    id="subscrib_Button"
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default Home;
