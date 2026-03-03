import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import TicketViewer from "../../components/TicketViewer";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    upcomingFlights: 0,
    totalSpent: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [availableFlights, setAvailableFlights] = useState([]);
  const [showTicketViewer, setShowTicketViewer] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

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

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user bookings
      const bookingsResponse = await axios.get("/api/user/bookings", {
        withCredentials: true,
      });
      const allBookings = bookingsResponse.data.data?.bookings || [];

      // Filter out archived bookings - only show active bookings on dashboard
      const bookings = allBookings.filter((b) => !b.isArchived);

      // Calculate stats
      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;

      // Get upcoming bookings (flights with future departure + all confirmed packages)
      const upcoming = bookings.filter((b) => {
        if (b.status !== "confirmed") return false;

        // Include package bookings
        if (b.bookingType === "package") return true;

        // Include flight bookings with future departure
        if (b.flightId?.departureTime) {
          return new Date(b.flightId.departureTime) > new Date();
        }

        return false;
      });

      const upcomingFlights = upcoming.length;
      const totalSpent = bookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      setStats({
        totalBookings,
        confirmedBookings,
        upcomingFlights,
        totalSpent,
      });

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));

      // Get upcoming bookings for ticket download (up to 4)
      setUpcomingBookings(upcoming.slice(0, 4));

      // Load available flights
      try {
        const flightsResponse = await axios.get("/api/booking/flights");
        const flights = flightsResponse.data.data || [];
        setAvailableFlights(flights.slice(0, 5));
      } catch (error) {
        console.error("Error loading flights:", error);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (booking, passengerIndex = 0) => {
    // Add passenger index to booking object for ticket viewer
    const bookingWithPassenger = {
      ...booking,
      currentPassengerIndex: passengerIndex,
    };
    setSelectedTicket(bookingWithPassenger);
    setShowTicketViewer(true);
  };

  const searchFlights = () => {
    navigate("/flights");
  };

  const exploreUmrah = () => {
    navigate("/umrah");
  };

  const viewOffers = () => {
    navigate("/offers");
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading dashboard...</p>
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
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back,{" "}
                <span className="text-yellow-300">{user?.name || "User"}</span>!
              </h1>
              <p className="text-gray-100 text-lg">
                Manage your flights and bookings
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={searchFlights}
              >
                <i className="fas fa-plus"></i> Book New Flight
              </button>
              <button
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={exploreUmrah}
              >
                <i className="fas fa-kaaba"></i> Hajj & Umrah
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={viewOffers}
              >
                <i className="fas fa-tags"></i> Special Offers
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4">
              <i className="fas fa-ticket-alt text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalBookings}
              </h3>
              <p className="text-gray-600">Total Bookings</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-4">
              <i className="fas fa-check-circle text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.confirmedBookings}
              </h3>
              <p className="text-gray-600">Confirmed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4">
              <i className="fas fa-clock text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.upcomingFlights}
              </h3>
              <p className="text-gray-600">Upcoming Flights</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-4">
              <i className="fas fa-dollar-sign text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.totalSpent.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Special Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Special Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={exploreUmrah}
            >
              <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6">
                <i className="fas fa-kaaba text-5xl mb-3"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Hajj & Umrah Packages
                </h3>
                <p className="text-gray-600 mb-4">
                  Explore our spiritual journey packages with complete guidance
                  and support.
                </p>
                <span className="text-primary font-semibold group-hover:text-primary-dark transition-colors duration-300">
                  <i className="fas fa-arrow-right"></i> Explore Packages
                </span>
              </div>
            </div>
            <div
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={viewOffers}
            >
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-6">
                <i className="fas fa-tags text-5xl mb-3"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Special Offers
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover amazing deals and discounts on flights and travel
                  packages.
                </p>
                <span className="text-primary font-semibold group-hover:text-primary-dark transition-colors duration-300">
                  <i className="fas fa-arrow-right"></i> View Offers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tickets - Download Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <i className="fas fa-ticket-alt text-primary mr-2"></i>
              Your Upcoming Tickets
            </h2>
            <a
              href="/my-bookings"
              className="text-primary hover:text-primary-dark font-semibold transition-colors duration-300"
            >
              View All Bookings →
            </a>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-ticket-alt text-4xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No upcoming flights
              </h3>
              <p className="text-gray-600 mb-6">
                Book a flight to see your tickets here
              </p>
              <button
                onClick={searchFlights}
                className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <i className="fas fa-search mr-2"></i>
                Search Flights
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => {
                const isPackage = booking.bookingType === "package";
                const packageInfo = booking.packageOfferId || {};
                const flightInfo = booking.flightId || {};

                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Ticket Header */}
                    <div
                      className={`bg-gradient-to-r ${
                        isPackage
                          ? "from-purple-500 to-purple-700"
                          : "from-primary to-primary-dark"
                      } text-white p-4`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <i
                            className={`fas ${
                              isPackage ? "fa-tags" : "fa-plane"
                            } text-xl`}
                          ></i>
                          <span className="font-bold">
                            {isPackage
                              ? packageInfo.name || "Package Offer"
                              : flightInfo.number || "N/A"}
                          </span>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {booking.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-5">
                      {isPackage ? (
                        /* Package Details */
                        <>
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <i className="fas fa-box-open text-purple-600"></i>
                              <span className="font-semibold text-gray-800">
                                {packageInfo.category || "Package"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-clock text-gray-500"></i>
                              <span className="text-gray-700">
                                Duration: {packageInfo.duration || "N/A"}
                              </span>
                            </div>
                            {packageInfo.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {packageInfo.description}
                              </p>
                            )}
                          </div>

                          {/* Package Details */}
                          <div className="grid grid-cols-2 gap-3 py-3 border-t border-dashed border-gray-200">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">
                                Persons
                              </p>
                              <p className="text-sm font-semibold text-gray-700">
                                {booking.personCount || 1}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">
                                Total Price
                              </p>
                              <p className="text-sm font-semibold text-green-600">
                                ${(booking.totalPrice || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Flight Details */
                        <>
                          {/* Route */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">
                                {flightInfo.origin || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {flightInfo.departureTime
                                  ? new Date(
                                      flightInfo.departureTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="relative flex items-center justify-center">
                                <div className="w-full h-[2px] bg-gray-200"></div>
                                <div className="absolute bg-white px-2">
                                  <i className="fas fa-plane text-primary"></i>
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">
                                {flightInfo.destination || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {flightInfo.arrivalTime
                                  ? new Date(
                                      flightInfo.arrivalTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Flight Details */}
                          <div className="grid grid-cols-3 gap-3 py-3 border-t border-dashed border-gray-200">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">
                                Date
                              </p>
                              <p className="text-sm font-semibold text-gray-700">
                                {flightInfo.departureTime
                                  ? new Date(
                                      flightInfo.departureTime
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">
                                Seats
                              </p>
                              <p className="text-sm font-semibold text-gray-700">
                                {booking.seatCount || 1}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">
                                Price
                              </p>
                              <p className="text-sm font-semibold text-green-600">
                                ${(booking.totalPrice || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Action Buttons - Multiple passengers support */}
                      {booking.passengerDetails &&
                      booking.passengerDetails.length > 1 ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500 text-center">
                            Select passenger to view ticket:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {booking.passengerDetails.map(
                              (passenger, index) => (
                                <button
                                  key={index}
                                  onClick={() =>
                                    handleViewTicket(booking, index)
                                  }
                                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm"
                                >
                                  <i className="fas fa-user text-xs"></i>
                                  {passenger.name || `Passenger ${index + 1}`}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleViewTicket(booking, 0)}
                          className="w-full mt-3 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-eye"></i>
                          View & Download Ticket
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Bookings
            </h2>
            <a
              href="/my-bookings"
              className="text-primary hover:text-primary-dark font-semibold transition-colors duration-300"
            >
              View All →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start booking your first flight!
                </p>
                <button
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
                  onClick={searchFlights}
                >
                  <i className="fas fa-plus me-2"></i>Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const isPackage = booking.bookingType === "package";
                  const packageInfo = booking.packageOfferId || {};
                  const flightInfo = booking.flightId || {};

                  return (
                    <div
                      key={booking._id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors duration-300"
                    >
                      <div className="mb-2 md:mb-0">
                        {isPackage ? (
                          <>
                            <h4 className="font-bold text-gray-900 mb-1">
                              <i className="fas fa-tags text-purple-600 me-2"></i>
                              {packageInfo.name || "Package Offer"}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              <i className="fas fa-box-open me-2"></i>
                              {packageInfo.category || "Package"} -{" "}
                              {packageInfo.duration || "N/A"}
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-bold text-gray-900 mb-1">
                              <i className="fas fa-plane text-primary me-2"></i>
                              {flightInfo.number || "N/A"} -{" "}
                              {flightInfo.origin || "N/A"} →{" "}
                              {flightInfo.destination || "N/A"}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              <i className="fas fa-calendar me-2"></i>
                              {flightInfo.departureTime
                                ? new Date(
                                    flightInfo.departureTime
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status || "pending"}
                        </span>
                        <span className="text-lg font-bold text-success">
                          ${(booking.totalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Available Flights */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Flights
            </h2>
            <a
              href="/flights"
              className="text-primary hover:text-primary-dark font-semibold transition-colors duration-300"
            >
              View All →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {availableFlights.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-plane text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No flights available
                </h3>
                <p className="text-gray-600">
                  Check back later for new flights
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFlights.map((flight) => (
                  <div
                    key={flight._id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">
                        <i className="fas fa-plane-departure text-primary me-2"></i>
                        {flight.number || "N/A"}
                      </h4>
                      <span className="text-xl font-bold text-success">
                        ${flight.price || 0}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <i className="fas fa-map-marker-alt text-gray-400 me-2"></i>
                      {flight.origin || "N/A"} → {flight.destination || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Viewer Modal */}
      <TicketViewer
        booking={selectedTicket}
        isOpen={showTicketViewer}
        onClose={() => {
          setShowTicketViewer(false);
          setSelectedTicket(null);
        }}
      />
    </UserLayout>
  );
};

export default Dashboard;
