import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import axios from "axios";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isAccountRecovery, setIsAccountRecovery] = useState(false);

  useEffect(() => {
    // Check if user came from account deletion
    const contactReason = sessionStorage.getItem("contactReason");
    const contactEmail = sessionStorage.getItem("contactEmail");

    if (contactReason === "account_recovery") {
      setIsAccountRecovery(true);
      setFormData((prev) => ({
        ...prev,
        email: contactEmail || "",
        subject: "Account Recovery Request",
        type: "account_recovery",
        message:
          "I recently deleted my account and would like to recover it. Please help me restore my account.",
      }));
      // Clear session storage
      sessionStorage.removeItem("contactReason");
      sessionStorage.removeItem("contactEmail");
    }

    // Initialize Google Maps if API is available
    const initMap = () => {
      if (window.google && window.google.maps) {
        try {
          const map = new window.google.maps.Map(
            document.getElementById("map"),
            {
              zoom: 15,
              center: { lat: 31.5204, lng: 74.3587 }, // Lahore coordinates
            },
          );

          new window.google.maps.Marker({
            position: { lat: 31.5204, lng: 74.3587 },
            map: map,
            title: "SkyWay Travel Agency",
          });
          setMapLoaded(true);
        } catch (error) {
          console.error("Error initializing map:", error);
          setMapLoaded(false);
        }
      } else {
        // If Google Maps script is not loaded, try again after a delay
        setTimeout(initMap, 500);
      }
    };

    initMap();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await axios.post("/api/contact", formData);

      if (response.data.success) {
        setSuccessMessage(
          isAccountRecovery
            ? "Your account recovery request has been submitted. Our support team will contact you within 24 hours."
            : "Thank you! Your message has been sent successfully.",
        );
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          type: "general",
        });
        setIsAccountRecovery(false);
      }
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">
              <i className="fas fa-headset me-3"></i>
              Contact Us
            </h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              We're here to assist you with all your travel needs. Get in touch
              today!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 text-center">
                <i className="fas fa-phone text-5xl mb-3"></i>
              </div>
              <div className="p-6 text-center">
                <h5 className="text-xl font-bold text-gray-900 mb-3">
                  Call Us
                </h5>
                <a
                  href="https://wa.me/+923438002540"
                  className="text-primary hover:text-primary-dark font-bold text-lg transition-colors duration-300 block mb-2"
                >
                  +923 800 2540
                </a>
                <p className="text-gray-600 font-medium">
                  Available 24/7 for emergencies
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 text-center">
                <i className="fas fa-envelope text-5xl mb-3"></i>
              </div>
              <div className="p-6 text-center">
                <h5 className="text-xl font-bold text-gray-900 mb-3">
                  Email Us
                </h5>
                <a
                  href="mailto:SkyWayTravels@gmail.com"
                  className="text-primary hover:text-primary-dark font-bold text-lg transition-colors duration-300 block mb-2"
                >
                  SkyWayTravels@gmail.com
                </a>
                <p className="text-gray-600 font-medium">
                  We'll respond within 24 hours
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 text-center">
                <i className="fas fa-map-marker-alt text-5xl mb-3"></i>
              </div>
              <div className="p-6 text-center">
                <h5 className="text-xl font-bold text-gray-900 mb-3">
                  Visit Us
                </h5>
                <p className="text-primary font-bold text-lg mb-2">
                  University of Central Punjab
                  <br />
                  Lahore, Pakistan
                </p>
                <p className="text-gray-600 font-medium">
                  Monday - Friday, 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
                <h3 className="text-2xl font-bold mb-2">
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Us a Message
                </h3>
                <p className="text-gray-100">
                  Fill out the form below and we'll get back to you soon
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                      <p className="font-medium">{errors.general}</p>
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                      <p className="font-medium">{successMessage}</p>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && (
                      <span className="text-danger text-sm mt-1 block">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                    />
                    {errors.email && (
                      <span className="text-danger text-sm mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-tag me-2 text-primary"></i>
                      Subject
                    </label>
                    <select
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled defaultValue>
                        Select a subject
                      </option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Booking Information">
                        Booking Information
                      </option>
                      <option value="Feedback">Feedback</option>
                      <option value="Support">Technical Support</option>
                      <option value="Partnership">Partnership Inquiry</option>
                    </select>
                    {errors.subject && (
                      <span className="text-danger text-sm mt-1 block">
                        {errors.subject}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-comment me-2 text-primary"></i>
                      Message
                    </label>
                    <textarea
                      className="form-control"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Write your message here..."
                      required
                    ></textarea>
                    {errors.message && (
                      <span className="text-danger text-sm mt-1 block">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    <i className="fas fa-paper-plane"></i>
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
                <h3 className="text-2xl font-bold mb-2">
                  <i className="fas fa-map-marked-alt me-2"></i>
                  Find Us on Map
                </h3>
                <p className="text-gray-100">
                  Our office location for in-person visits
                </p>
              </div>
              <div className="relative" style={{ height: "530px" }}>
                <div id="map" className="w-full h-full"></div>
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <i className="fas fa-map-marked-alt text-6xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600 font-medium">
                        Loading map...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        University of Central Punjab, Lahore
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              <i className="fas fa-star text-primary me-2"></i>
              Why Choose SkyWay Travel?
            </h2>
            <p className="text-lg text-gray-600">
              Here's what makes us different
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "fa-clock",
                title: "24/7 Support",
                text: "Round-the-clock customer assistance for all your travel needs",
                gradient: "from-blue-500 to-blue-700",
              },
              {
                icon: "fa-award",
                title: "Expert Team",
                text: "Experienced travel professionals dedicated to your journey",
                gradient: "from-purple-500 to-purple-700",
              },
              {
                icon: "fa-shield-alt",
                title: "Secure Booking",
                text: "Safe and secure payment processing for peace of mind",
                gradient: "from-green-500 to-green-700",
              },
              {
                icon: "fa-star",
                title: "Best Prices",
                text: "Competitive rates and exclusive deals for all destinations",
                gradient: "from-yellow-500 to-yellow-700",
              },
            ].map((feature, idx) => (
              <div key={idx}>
                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  <div
                    className={`bg-gradient-to-r ${feature.gradient} text-white p-6 text-center`}
                  >
                    <i className={`fas ${feature.icon} text-5xl mb-3`}></i>
                  </div>
                  <div className="p-6 text-center">
                    <h5 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h5>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ContactUs;
