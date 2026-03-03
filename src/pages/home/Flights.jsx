import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import BookingSuccessAnimation from "../../components/BookingSuccessAnimation";
import SuccessToast from "../../components/SuccessToast";
import SeatSelectionModal from "../../components/SeatSelectionModal";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Airline logo mapping
const airlineLogos = {
  Emirates: "https://images.kiwi.com/airlines/64/EK.png",
  "Qatar Airways": "https://images.kiwi.com/airlines/64/QR.png",
  "Etihad Airways": "https://images.kiwi.com/airlines/64/EY.png",
  "Turkish Airlines": "https://images.kiwi.com/airlines/64/TK.png",
  Lufthansa: "https://images.kiwi.com/airlines/64/LH.png",
  "British Airways": "https://images.kiwi.com/airlines/64/BA.png",
  "Air France": "https://images.kiwi.com/airlines/64/AF.png",
  KLM: "https://images.kiwi.com/airlines/64/KL.png",
  "Singapore Airlines": "https://images.kiwi.com/airlines/64/SQ.png",
  "Cathay Pacific": "https://images.kiwi.com/airlines/64/CX.png",
  ANA: "https://images.kiwi.com/airlines/64/NH.png",
  "Japan Airlines": "https://images.kiwi.com/airlines/64/JL.png",
  "United Airlines": "https://images.kiwi.com/airlines/64/UA.png",
  "American Airlines": "https://images.kiwi.com/airlines/64/AA.png",
  "Delta Air Lines": "https://images.kiwi.com/airlines/64/DL.png",
  PIA: "https://images.kiwi.com/airlines/64/PK.png",
  Saudia: "https://images.kiwi.com/airlines/64/SV.png",
  "Oman Air": "https://images.kiwi.com/airlines/64/WY.png",
  "Gulf Air": "https://images.kiwi.com/airlines/64/GF.png",
  "Fly Dubai": "https://images.kiwi.com/airlines/64/FZ.png",
};

const Flights = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSeatSelectionModal, setShowSeatSelectionModal] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [lastBookingDetails, setLastBookingDetails] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    seatCount: 1,
    seatNumbers: [],
    passengers: [
      {
        name: "",
        age: "",
        gender: "male",
      },
    ],
  });

  // Unified search form
  const [searchFormData, setSearchFormData] = useState({
    origin: "",
    destination: "",
    date: "",
    airline: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [locations, setLocations] = useState([]);
  const [airlines, setAirlines] = useState([]);

  useEffect(() => {
    fetchFlights();
    checkAuth();
    fetchLocations();
  }, []);

  // Template for airline dropdown with logos
  const airlineOptionTemplate = (option) => {
    if (!option) return null;
    return (
      <div className="flex items-center gap-3 py-1">
        <img
          src={getAirlineLogo(option.label)}
          alt={option.label}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/32x32/667eea/ffffff?text=${option.label.charAt(
              0,
            )}`;
          }}
        />
        <span className="font-medium">{option.label}</span>
      </div>
    );
  };

  // Template for selected airline value
  const selectedAirlineTemplate = (option) => {
    if (!option) return <span className="text-gray-500">All Airlines</span>;
    return (
      <div className="flex items-center gap-2">
        <img
          src={getAirlineLogo(option.label)}
          alt={option.label}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/24x24/667eea/ffffff?text=${option.label.charAt(
              0,
            )}`;
          }}
        />
        <span>{option.label}</span>
      </div>
    );
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/booking/flights");
      if (response.data.success) {
        // Sort flights by departure date (newest first)
        const sortedFlights = response.data.data.sort(
          (a, b) => new Date(b.departureTime) - new Date(a.departureTime),
        );
        setFlights(sortedFlights);

        // Extract unique airlines
        const uniqueAirlines = [...new Set(sortedFlights.map((f) => f.airline))]
          .sort()
          .map((airline) => ({
            label: airline,
            value: airline,
          }));

        setAirlines(uniqueAirlines);
      }
    } catch (error) {
      console.error("Error fetching flights:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get("/api/locations");
      if (response.data.success) {
        const transformedLocations = response.data.data.map((loc) => ({
          label: `${loc.name}${loc.country ? ` (${loc.country})` : ""}`,
          value: loc.name,
          code: loc.code,
          country: loc.country,
        }));
        setLocations(transformedLocations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (departure, arrival) => {
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleBookNow = (flight) => {
    if (!user) {
      setSelectedFlight(flight);
      setShowLoginModal(true);
    } else {
      setSelectedFlight(flight);
      setShowBookingModal(true);
      setBookingFormData({
        seatCount: 1,
        seatNumbers: [],
        passengers: [
          {
            name: "",
            age: "",
            gender: "male",
          },
        ],
      });
    }
  };

  const handleSeatCountChange = (count) => {
    const newCount = Math.max(1, Math.min(10, count));
    const passengers = [];
    for (let i = 0; i < newCount; i++) {
      passengers.push(
        bookingFormData.passengers[i] || {
          name: "",
          age: "",
          gender: "male",
        },
      );
    }
    setBookingFormData({
      ...bookingFormData,
      seatCount: newCount,
      passengers,
      seatNumbers: [], // Reset seat selection when count changes
    });
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...bookingFormData.passengers];
    updatedPassengers[index][field] = value;
    setBookingFormData({
      ...bookingFormData,
      passengers: updatedPassengers,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Check if seats are selected
    if (
      !bookingFormData.seatNumbers ||
      bookingFormData.seatNumbers.length === 0
    ) {
      setShowBookingModal(false);
      setShowSeatSelectionModal(true);
      return;
    }

    try {
      const response = await axios.post(
        "/api/booking/create",
        {
          flightId: selectedFlight._id,
          seatCount: bookingFormData.seatCount,
          seatNumbers: bookingFormData.seatNumbers,
          passengers: bookingFormData.passengers,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        // Calculate total price
        const totalAmount = selectedFlight.price * bookingFormData.seatCount;

        // Store booking details for the success animation
        setLastBookingDetails({
          ticketId:
            response.data.data?.bookingReference ||
            response.data.booking?._id?.slice(-10).toUpperCase() ||
            `SKY${Date.now().toString().slice(-10)}`,
          amount: totalAmount,
          date: new Date(),
          cardHolder:
            bookingFormData.passengers[0]?.name || user?.name || "Guest",
          last4Digits: "", // Can be added if payment integration exists
          barcodeValue: Math.random().toString().slice(2, 16),
          title: "Booking Submitted!",
          subtitle: `${selectedFlight.origin} → ${
            selectedFlight.destination
          } • ${bookingFormData.seatCount} seat${
            bookingFormData.seatCount > 1 ? "s" : ""
          } • Seats: ${bookingFormData.seatNumbers.join(", ")}`,
        });

        setShowBookingModal(false);
        setShowBookingSuccess(true);
        fetchFlights(); // Refresh flights to update available seats

        // Reset seat selection
        setBookingFormData((prev) => ({
          ...prev,
          seatNumbers: [],
        }));
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to create booking. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorToast(true);
    }
  };

  const handleSeatConfirmation = (selectedSeats) => {
    setBookingFormData((prev) => ({
      ...prev,
      seatNumbers: selectedSeats,
    }));
    setShowSeatSelectionModal(false);
    setShowBookingModal(true);
  };

  const handleAnimationComplete = () => {
    setShowBookingSuccess(false);
    navigate("/dashboard");
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("/api/booking/flights/search", {
        params: {
          origin: searchFormData.origin,
          destination: searchFormData.destination,
          date: searchFormData.date,
          airline: searchFormData.airline,
        },
      });
      if (response.data.success) {
        // Sort search results by departure date (newest first)
        const sortedResults = response.data.data.sort(
          (a, b) => new Date(b.departureTime) - new Date(a.departureTime),
        );
        setSearchResults(sortedResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const clearSearch = () => {
    setShowResults(false);
    setSearchResults([]);
    setSearchFormData({
      origin: "",
      destination: "",
      date: "",
      airline: "",
    });
  };

  const displayFlights = showResults ? searchResults : flights;

  // Get airline logo or fallback
  const getAirlineLogo = (airlineName) => {
    return (
      airlineLogos[airlineName] ||
      "https://via.placeholder.com/64x64/667eea/ffffff?text=" +
        airlineName.charAt(0)
    );
  };

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
          transition: all 0.2s !important;
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
      <SuccessToast
        isVisible={showErrorToast}
        title="Booking Error"
        message={errorMessage}
        duration={4000}
        onClose={() => setShowErrorToast(false)}
      />
      <Header />
      <section className="section bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              Search & Book Flights
            </h1>
            <p className="text-xl text-gray-600">
              Compare prices and find the best deals on flights worldwide
            </p>
          </div>

          {/* Unified Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 border border-gray-100">
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-plane-departure mr-2 text-primary"></i>
                    From
                  </label>
                  <Dropdown
                    value={searchFormData.origin}
                    onChange={(e) =>
                      setSearchFormData({
                        ...searchFormData,
                        origin: e.value,
                      })
                    }
                    options={locations}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select origin"
                    filter
                    filterPlaceholder="Search location"
                    className="w-full"
                    style={{
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      height: "3rem",
                    }}
                    panelClassName="custom-dropdown-panel"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-plane-arrival mr-2 text-primary"></i>
                    To
                  </label>
                  <Dropdown
                    value={searchFormData.destination}
                    onChange={(e) =>
                      setSearchFormData({
                        ...searchFormData,
                        destination: e.value,
                      })
                    }
                    options={locations}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select destination"
                    filter
                    filterPlaceholder="Search location"
                    className="w-full"
                    style={{
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      height: "3rem",
                    }}
                    panelClassName="custom-dropdown-panel"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-plane mr-2 text-primary"></i>
                    Airline
                  </label>
                  <Dropdown
                    value={searchFormData.airline}
                    onChange={(e) =>
                      setSearchFormData({
                        ...searchFormData,
                        airline: e.value,
                      })
                    }
                    options={[
                      { label: "All Airlines", value: "" },
                      ...airlines,
                    ]}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select airline"
                    filter
                    filterPlaceholder="Search airline"
                    itemTemplate={airlineOptionTemplate}
                    valueTemplate={selectedAirlineTemplate}
                    className="w-full"
                    style={{
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      height: "3rem",
                    }}
                    panelClassName="custom-dropdown-panel"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-calendar mr-2 text-primary"></i>
                    Departure
                  </label>
                  <Calendar
                    value={
                      searchFormData.date ? new Date(searchFormData.date) : null
                    }
                    onChange={(e) => {
                      const selectedDate = e.value;
                      const formattedDate = selectedDate
                        ? selectedDate.toISOString().split("T")[0]
                        : "";
                      setSearchFormData({
                        ...searchFormData,
                        date: formattedDate,
                      });
                    }}
                    showIcon
                    dateFormat="yy-mm-dd"
                    placeholder="Select date"
                    className="w-full"
                    style={{
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      height: "3rem",
                    }}
                    inputStyle={{
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <i className="fas fa-search mr-2"></i>
                    Search Flights
                  </button>
                </div>
              </div>
            </form>
            {showResults && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <i className="fas fa-info-circle mr-2"></i>
                  Showing {searchResults.length} results for your search
                </p>
                <button
                  onClick={clearSearch}
                  className="text-primary hover:text-primary-dark font-semibold text-sm"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-16">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Finding best flights...</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Finding best flights...</p>
            </div>
          )}

          {/* Flights List */}
          {!loading && displayFlights.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <i className="fas fa-plane-slash text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Flights Found
              </h3>
              <p className="text-gray-500">
                {showResults
                  ? "Try adjusting your search criteria"
                  : "No flights available at the moment"}
              </p>
            </div>
          )}

          {!loading && displayFlights.length > 0 && (
            <div className="space-y-4">
              {displayFlights.map((flight) => (
                <div
                  key={flight._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row items-center gap-6 p-6">
                    {/* Airline Logo */}
                    <div className="flex-shrink-0">
                      <img
                        src={getAirlineLogo(flight.airline)}
                        alt={flight.airline}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/80x80/667eea/ffffff?text=" +
                            flight.airline.charAt(0);
                        }}
                      />
                      <p className="text-xs text-gray-600 text-center mt-2 font-medium">
                        {flight.airline}
                      </p>
                    </div>

                    {/* Flight Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center w-full">
                      {/* Departure */}
                      <div className="text-center md:text-left">
                        <p className="text-3xl font-bold text-gray-900">
                          {formatDateTime(flight.departureTime)}
                        </p>
                        <p className="text-lg font-semibold text-gray-700 mt-1">
                          {flight.origin}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(flight.departureTime)}
                        </p>
                      </div>

                      {/* Flight Info */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <div className="flex-1 h-0.5 bg-gray-300 relative">
                            <i className="fas fa-plane text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                          </div>
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {calculateDuration(
                            flight.departureTime,
                            flight.arrivalTime,
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {flight.number}
                        </p>
                        <p className="text-xs font-semibold text-gray-600 mt-1 capitalize">
                          {flight.class || "Economy"}
                        </p>
                      </div>

                      {/* Arrival */}
                      <div className="text-center md:text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          {formatDateTime(flight.arrivalTime)}
                        </p>
                        <p className="text-lg font-semibold text-gray-700 mt-1">
                          {flight.destination}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(flight.arrivalTime)}
                        </p>
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex-shrink-0 text-center lg:text-right border-l-0 lg:border-l-2 border-gray-100 lg:pl-6">
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            flight.status === "active"
                              ? "bg-green-100 text-green-700"
                              : flight.status === "delayed"
                                ? "bg-yellow-100 text-yellow-700"
                                : flight.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {flight.status}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">from</p>
                        <p className="text-4xl font-bold text-primary">
                          ${flight.price}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">per person</p>
                      </div>

                      {/* Seats Available */}
                      <p className="text-sm text-gray-600 mb-3">
                        <i className="fas fa-chair mr-1"></i>
                        {flight.availableSeats || flight.totalSeats} seats left
                      </p>

                      {/* Book Button */}
                      <button
                        onClick={() => handleBookNow(flight)}
                        disabled={
                          flight.availableSeats === 0 ||
                          flight.status === "cancelled"
                        }
                        className={`w-full px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 ${
                          flight.availableSeats === 0 ||
                          flight.status === "cancelled"
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {flight.status === "cancelled"
                          ? "Cancelled"
                          : flight.availableSeats === 0
                            ? "Sold Out"
                            : "Book Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Login Modal for Unregistered Users */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-yellow-600 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Login Required
              </h3>
              <p className="text-gray-600">
                You need to be logged in to book a flight. Please login or
                create an account to continue.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/login"
                className="btn btn-primary w-full text-center block"
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Login to Your Account
              </Link>
              <Link
                to="/register"
                className="btn btn-outline w-full text-center block"
              >
                <i className="fas fa-user-plus me-2"></i>
                Create New Account
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="btn btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal for Registered Users */}
      {showBookingModal && selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8 relative flex flex-col max-h-[90vh]">
            <div className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-lg flex-shrink-0">
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
              <h3 className="text-2xl font-bold mb-2">
                <i className="fas fa-ticket-alt me-2"></i>
                Complete Your Booking
              </h3>
              <p className="text-blue-100">
                Flight {selectedFlight.number} - {selectedFlight.origin} to{" "}
                {selectedFlight.destination}
              </p>
            </div>
            <form
              onSubmit={handleBookingSubmit}
              className="p-6 overflow-y-auto flex-1"
            >
              {/* Flight Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Flight Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Airline</p>
                    <p className="font-semibold">{selectedFlight.airline}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold">
                      {formatDate(selectedFlight.departureTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Departure</p>
                    <p className="font-semibold">
                      {formatDateTime(selectedFlight.departureTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Arrival</p>
                    <p className="font-semibold">
                      {formatDateTime(selectedFlight.arrivalTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seat Selection */}
              <div className="mb-6">
                <label className="form-label">
                  <i className="fas fa-chair me-2 text-primary"></i>
                  Number of Seats
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleSeatCountChange(bookingFormData.seatCount - 1)
                    }
                    className="btn btn-outline px-4"
                    disabled={bookingFormData.seatCount <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="text-2xl font-bold text-primary w-12 text-center">
                    {bookingFormData.seatCount}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSeatCountChange(bookingFormData.seatCount + 1)
                    }
                    className="btn btn-outline px-4"
                    disabled={
                      bookingFormData.seatCount >= 10 ||
                      bookingFormData.seatCount >= selectedFlight.availableSeats
                    }
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  <span className="text-sm text-gray-600 ml-auto">
                    {selectedFlight.availableSeats} seats available
                  </span>
                </div>

                {/* Select Seats Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setShowSeatSelectionModal(true);
                  }}
                  className="mt-3 w-full btn btn-outline btn-primary"
                >
                  <i className="fas fa-chair me-2"></i>
                  {bookingFormData.seatNumbers.length > 0
                    ? `Change Selected Seats (${bookingFormData.seatNumbers.join(
                        ", ",
                      )})`
                    : "Select Seats"}
                </button>
              </div>

              {/* Passenger Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  <i className="fas fa-users me-2 text-primary"></i>
                  Passenger Details
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {bookingFormData.passengers.map((passenger, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h5 className="font-semibold text-gray-700 mb-3">
                        Passenger {index + 1}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter full name"
                            value={passenger.name}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Age"
                            min="0"
                            max="120"
                            value={passenger.age}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "age",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="form-label">Gender</label>
                          <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`gender-${index}`}
                                value="male"
                                checked={passenger.gender === "male"}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "gender",
                                    e.target.value,
                                  )
                                }
                                className="mr-2"
                              />
                              <span>Male</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`gender-${index}`}
                                value="female"
                                checked={passenger.gender === "female"}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "gender",
                                    e.target.value,
                                  )
                                }
                                className="mr-2"
                              />
                              <span>Female</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`gender-${index}`}
                                value="other"
                                checked={passenger.gender === "other"}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "gender",
                                    e.target.value,
                                  )
                                }
                                className="mr-2"
                              />
                              <span>Other</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Price per seat:</span>
                  <span className="font-semibold">${selectedFlight.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Number of seats:</span>
                  <span className="font-semibold">
                    {bookingFormData.seatCount}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ${selectedFlight.price * bookingFormData.seatCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  <i className="fas fa-check me-2"></i>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={showSeatSelectionModal}
        onClose={() => {
          setShowSeatSelectionModal(false);
          setShowBookingModal(true);
        }}
        flight={selectedFlight}
        seatCount={bookingFormData.seatCount}
        onConfirm={handleSeatConfirmation}
      />

      {/* Booking Success Animation */}
      <BookingSuccessAnimation
        isVisible={showBookingSuccess}
        onAnimationComplete={handleAnimationComplete}
        bookingDetails={lastBookingDetails}
      />

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default Flights;
