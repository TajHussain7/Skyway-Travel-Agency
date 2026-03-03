import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import PackageBookingModal from "../../components/PackageBookingModal";
import axios from "axios";

const PackageOffers = () => {
  const [user, setUser] = useState(null);
  const [packageOffers, setPackageOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    loadPackageOffers();

    // Check if redirected with booking intent
    if (location.state?.bookingType === "package" && location.state?.offer) {
      setSelectedOffer(location.state.offer);
      setShowBookingModal(true);
    }
  }, []);

  useEffect(() => {
    filterOffers();
  }, [searchTerm, selectedCategory, packageOffers]);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData) {
        navigate("/login");
      } else {
        setUser(userData);
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadPackageOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/package-offers"
      );
      if (response.data.success) {
        const offers = response.data.data;
        setPackageOffers(offers);
        setFilteredOffers(offers);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(offers.map((offer) => offer.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error loading package offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = [...packageOffers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (offer) =>
          offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (offer) => offer.category === selectedCategory
      );
    }

    setFilteredOffers(filtered);
  };

  const handleBookOffer = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading offers...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <i className="fas fa-tags me-3"></i>
                Package Offers
              </h1>
              <p className="text-gray-100 text-lg">
                Discover amazing travel deals and exclusive packages
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <i className="fas fa-gift text-2xl"></i>
              <div>
                <p className="text-sm opacity-80">Available Offers</p>
                <p className="text-2xl font-bold">{packageOffers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tags text-4xl text-yellow-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No offers found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Check back later for new exciting offers!"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge */}
                  {offer.badge && (
                    <div
                      className={`absolute top-4 right-4 bg-gradient-to-r from-${offer.badgeColor}-400 to-${offer.badgeColor}-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
                    >
                      {offer.badge}
                    </div>
                  )}
                  {/* Category */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {offer.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {offer.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Features */}
                  {offer.features && offer.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {offer.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          <i className={`${feature.icon} mr-1`}></i>
                          {feature.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        {offer.priceUnit === "percentage"
                          ? `${offer.price}% OFF`
                          : `$${offer.price.toLocaleString()}`}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {offer.priceUnit}
                      </span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => handleBookOffer(offer)}
                    disabled={!offer.isBookable}
                    className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      offer.isBookable
                        ? "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white hover:shadow-lg"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <i
                      className={`fas ${
                        offer.isBookable ? "fa-calendar-check" : "fa-lock"
                      }`}
                    ></i>
                    {offer.isBookable ? "Book Now" : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredOffers.length > 0 && (
          <div className="mt-6 text-center text-gray-500">
            Showing {filteredOffers.length} of {packageOffers.length} offers
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedOffer && (
        <PackageBookingModal
          offer={selectedOffer}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedOffer(null);
          }}
          onSuccess={() => {
            loadPackageOffers();
          }}
        />
      )}
    </UserLayout>
  );
};

export default PackageOffers;
