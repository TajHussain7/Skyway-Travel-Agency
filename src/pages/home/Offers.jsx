import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import LoginPromptModal from "../../components/LoginPromptModal";

const Offers = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch all package offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/package-offers",
        );
        const data = await response.json();

        if (data.success) {
          setOffers(data.data);
        } else {
          setError(data.message || "Failed to fetch offers");
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
        setError("Failed to load offers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Group offers by category
  const offersByCategory = {
    "World Tour": offers.filter((offer) => offer.category === "World Tour"),
    Umrah: offers.filter((offer) => offer.category === "Umrah"),
    Hajj: offers.filter((offer) => offer.category === "Hajj"),
    "Umrah & Hajj": offers.filter((offer) => offer.category === "Umrah & Hajj"),
    "Adventure Tour": offers.filter(
      (offer) => offer.category === "Adventure Tour",
    ),
    "Membership & Student Discounts": offers.filter(
      (offer) => offer.category === "Membership & Student Discounts",
    ),
  };

  const showDetails = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  const PhoneNumber = () => {
    window.open("http://wa.me/+9234338002540", "_blank");
  };

  const handleBookNow = () => {
    if (!user) {
      // Show login prompt modal
      setShowLoginPrompt(true);
    } else {
      // Redirect to booking page with offer details
      navigate("/user/dashboard", {
        state: {
          bookingType: "package",
          offer: selectedOffer,
        },
      });
      setShowModal(false);
    }
  };

  // Badge color mapping
  const getBadgeColors = (badgeColor) => {
    const colorMap = {
      yellow: "from-yellow-400 to-yellow-600",
      blue: "from-blue-500 to-blue-700",
      green: "from-green-500 to-green-700",
      purple: "from-purple-500 to-purple-700",
      orange: "from-orange-500 to-orange-700",
      cyan: "from-cyan-500 to-cyan-700",
      red: "from-red-500 to-red-700",
    };
    return colorMap[badgeColor] || "from-blue-500 to-blue-700";
  };

  // Render offer card
  const renderOfferCard = (offer) => (
    <div
      key={offer._id}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={offer.image}
          alt={offer.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {offer.badge && (
          <div
            className={`absolute top-4 right-4 bg-gradient-to-r ${getBadgeColors(
              offer.badgeColor,
            )} text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg`}
          >
            {offer.badge}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{offer.name}</h3>
        <p className="text-gray-600 mb-4 text-sm">{offer.description}</p>
        <div className="space-y-2 mb-6">
          {offer.features &&
            offer.features.slice(0, 3).map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <i className={`${feature.icon} text-primary`}></i>
                <span>{feature.text}</span>
              </div>
            ))}
        </div>
        <div className="mb-6 pb-4 border-t border-gray-200 pt-4">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-success">
              {offer.priceUnit === "percentage"
                ? offer.price + "% OFF"
                : "$" + offer.price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm mb-1">
              {offer.priceUnit}
            </span>
          </div>
        </div>
        <button
          className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          onClick={() => showDetails(offer)}
        >
          <i className="fas fa-eye"></i> View Details
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 mb-8">
        <div className="container">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              <i className="fas fa-tags"></i> Exclusive Offers
            </h1>
            <p className="text-lg text-gray-100">
              Grab our limited-time deals and special packages!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-gray-50 py-4">
        <div className="container">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                <p className="text-gray-600">Loading offers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* World Tour Packages */}
              {offersByCategory["World Tour"].length > 0 && (
                <section className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                      <i className="fas fa-globe-americas text-primary"></i>{" "}
                      World Tour Special Packages
                    </h2>
                    <p className="text-lg text-gray-600">
                      Explore the world with our premium travel packages
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offersByCategory["World Tour"].map((offer) =>
                      renderOfferCard(offer),
                    )}
                  </div>
                </section>
              )}

              {/* Umrah Packages */}
              {offersByCategory["Umrah"].length > 0 && (
                <section className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                      <i className="fas fa-kaaba text-primary"></i> Umrah
                      Special Packages
                    </h2>
                    <p className="text-lg text-gray-600">
                      Sacred Umrah journey packages with complete spiritual
                      support
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offersByCategory["Umrah"].map((offer) =>
                      renderOfferCard(offer),
                    )}
                  </div>
                </section>
              )}

              {/* Hajj Packages */}
              {offersByCategory["Hajj"].length > 0 && (
                <section className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                      <i className="fas fa-mosque text-primary"></i> Hajj
                      Special Packages
                    </h2>
                    <p className="text-lg text-gray-600">
                      Complete Hajj journey packages with experienced guides
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offersByCategory["Hajj"].map((offer) =>
                      renderOfferCard(offer),
                    )}
                  </div>
                </section>
              )}

              {/* Umrah & Hajj Packages */}
              {offersByCategory["Umrah & Hajj"].length > 0 && (
                <section className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                      <i className="fas fa-mosque text-primary"></i> Umrah &
                      Hajj Special Packages
                    </h2>
                    <p className="text-lg text-gray-600">
                      Sacred journey packages with complete spiritual support
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offersByCategory["Umrah & Hajj"].map((offer) =>
                      renderOfferCard(offer),
                    )}
                  </div>
                </section>
              )}

              {/* Adventure Tour Packages */}
              {offersByCategory["Adventure Tour"].length > 0 && (
                <section className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                      <i className="fas fa-mountain text-primary"></i> Adventure
                      Tour Packages
                    </h2>
                    <p className="text-lg text-gray-600">
                      Thrilling adventures for the bold and adventurous
                      travelers
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offersByCategory["Adventure Tour"].map((offer) =>
                      renderOfferCard(offer),
                    )}
                  </div>
                </section>
              )}

              {/* Membership & Student Discounts */}
              {offersByCategory["Membership & Student Discounts"].length >
                0 && (
                <section className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                      <i className="fas fa-percentage text-primary"></i>{" "}
                      Membership & Student Discounts
                    </h2>
                    <p className="text-lg text-gray-600">
                      Special discounts for our valued members and students
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {offersByCategory["Membership & Student Discounts"].map(
                      (offer) => renderOfferCard(offer),
                    )}
                  </div>
                </section>
              )}

              {offers.length === 0 && (
                <div className="text-center py-16">
                  <i className="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    No Offers Available
                  </h3>
                  <p className="text-gray-500">
                    Check back later for exciting travel offers!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Professional Modal Popup */}
      {showModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-zoom-in">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold">{selectedOffer.name}</h3>
                <p className="text-sm text-gray-100 mt-1">Package Details</p>
              </div>
              <button
                onClick={closeModal}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Offer Image */}
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={selectedOffer.image}
                  alt={selectedOffer.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-6 mb-6">
                <p className="text-gray-700 text-lg">
                  {selectedOffer.fullDetails || selectedOffer.description}
                </p>
              </div>

              {/* Features */}
              {selectedOffer.features && selectedOffer.features.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-star text-primary"></i>
                    Package Features:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {selectedOffer.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <i className={`${feature.icon} text-success`}></i>
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inclusions */}
              {selectedOffer.inclusions &&
                selectedOffer.inclusions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-info-circle text-primary"></i>
                      What's Included:
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      {selectedOffer.inclusions.map((inclusion, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-success"></i>
                          {inclusion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Price */}
              <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 mb-6 text-white text-center">
                <p className="text-sm mb-2">Package Price</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">
                    {selectedOffer.priceUnit === "percentage"
                      ? selectedOffer.price + "% OFF"
                      : "$" + selectedOffer.price.toLocaleString()}
                  </span>
                  <span className="text-lg">{selectedOffer.priceUnit}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  <i className="fas fa-times me-2"></i>Close
                </button>
                <button
                  onClick={handleBookNow}
                  className="flex-1 bg-gradient-to-r from-success to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  <i className="fas fa-calendar-check me-2"></i>Book Now
                </button>
                <button
                  onClick={PhoneNumber}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  <i className="fab fa-whatsapp me-2"></i>WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default Offers;
