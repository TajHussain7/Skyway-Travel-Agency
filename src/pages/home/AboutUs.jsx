import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";

const AboutUs = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">
              <i className="fas fa-plane-departure me-3"></i>
              About SkyWay Travel Agency
            </h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Your trusted partner in creating unforgettable travel experiences
              worldwide
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to SkyWay Travel
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                SkyWay Travel is more than just a travel agency – we're your
                gateway to exploring the world with confidence and ease. We
                believe travel should be inspiring, stress-free, and accessible
                to everyone.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our platform showcases the capabilities of modern web
                technologies while solving real-world travel challenges. We've
                designed every aspect of our service to enhance your travel
                experience — from the initial search to your safe return home —
                with smart features, real-time updates, and dedicated support
                every step of the way.
              </p>
            </div>
            <div className="flex justify-center items-center animate-fade-in">
              <i
                className="fas fa-globe-americas text-primary opacity-70"
                style={{ fontSize: "20rem" }}
              ></i>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              <i className="fas fa-star text-primary me-2"></i>
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              What drives us to deliver excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "fa-bullseye",
                title: "Our Purpose",
                text: "Created to help users explore and book Hajj, Umrah, and travel packages with ease. We serve as an interactive platform that demonstrates excellence in web development and user experience.",
                color: "from-blue-500 to-blue-700",
              },
              {
                icon: "fa-rocket",
                title: "Our Mission",
                text: "To deliver a seamless and user-friendly platform where travelers can find essential services, locations, and information. We make online travel planning accessible and efficient for everyone.",
                color: "from-purple-500 to-purple-700",
              },
              {
                icon: "fa-heart",
                title: "Our Values",
                text: "We believe in transparency, reliability, and putting our customers first. Every feature we build is designed with your convenience and safety in mind. We listen to your feedback to enhance our services continuously.",
                color: "from-red-500 to-red-700",
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  <div
                    className={`bg-gradient-to-r ${item.color} text-white p-6 text-center`}
                  >
                    <i className={`fas ${item.icon} text-6xl mb-3`}></i>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              <i className="fas fa-star text-primary me-2"></i>
              Platform Features
            </h2>
            <p className="text-lg text-gray-600">
              Discover what makes SkyWay Travel special
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "fa-map-marked-alt",
                title: "Interactive Google Maps",
                text: "Showcase locations of our offices and help you find us easily",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
              },
              {
                icon: "fa-kaaba",
                title: "Hajj & Umrah Services",
                text: "Dedicated sections with detailed service information and packages",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
              },
              {
                icon: "fa-mobile-alt",
                title: "Responsive Design",
                text: "User-friendly interface that works perfectly on all devices",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600",
              },
              {
                icon: "fa-shield-alt",
                title: "Secure & Reliable",
                text: "Built with security and reliability as top priorities",
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
              },
            ].map((feature, idx) => (
              <div key={idx}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`${feature.iconBg} rounded-lg p-4 flex-shrink-0`}
                    >
                      <i
                        className={`fas ${feature.icon} ${feature.iconColor} text-2xl`}
                      ></i>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h5>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">
            <i className="fas fa-rocket me-3"></i>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Thank you for visiting SkyWay Travel! We hope you enjoy exploring
            our features and learning about our services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/flights"
              className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-search"></i>
              Search Flights
            </Link>
            <Link
              to="/contact-us"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <i className="fas fa-envelope"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default AboutUs;
