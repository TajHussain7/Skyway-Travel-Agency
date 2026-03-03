import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const MyBookings = () => {
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      if (!response.data.user && !response.data.data?.user) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/booking/user/my-bookings",
        {
          withCredentials: true,
        }
      );
      const bookingsData = response.data.data || [];

      // Filter out archived bookings (should not happen, but safety check)
      const activeBookings = bookingsData.filter((b) => !b.isArchived);

      setBookings(activeBookings);
      setFilteredBookings(activeBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter((b) => b.status === filters.status);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((b) => new Date(b.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((b) => new Date(b.createdAt) <= toDate);
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const showPassengerDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const searchFlights = () => {
    navigate("/flights");
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
    });
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
        
        /* Clear Button Styles */
        .p-calendar-clear-icon,
        .p-dropdown-clear-icon {
          color: #ef4444 !important;
        }
        .p-calendar-clear-icon:hover,
        .p-dropdown-clear-icon:hover {
          color: #dc2626 !important;
        }
      `}</style>

      <UserLayout>
        <div className="p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  <i className="fas fa-ticket-alt me-3"></i>
                  My Bookings
                </h1>
                <p className="text-gray-100 text-lg">
                  View and manage all your flight bookings
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={loadBookings}
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={searchFlights}
                >
                  <i className="fas fa-plus"></i> Book New Flight
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              <i className="fas fa-filter text-primary me-2"></i>
              Filter Bookings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-tag text-gray-400 me-2"></i>
                  Status
                </label>
                <Dropdown
                  value={filters.status}
                  options={statusOptions}
                  onChange={(e) => handleFilterChange("status", e.value)}
                  placeholder="Select Status"
                  className="w-full"
                />
              </div>
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-calendar text-gray-400 me-2"></i>
                  From Date
                </label>
                <Calendar
                  value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                  onChange={(e) => {
                    const formattedDate = e.value
                      ? e.value.toISOString().split("T")[0]
                      : "";
                    handleFilterChange("dateFrom", formattedDate);
                  }}
                  showIcon
                  showButtonBar
                  dateFormat="yy-mm-dd"
                  placeholder="Select from date"
                  className="w-full"
                />
              </div>
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-calendar text-gray-400 me-2"></i>
                  To Date
                </label>
                <Calendar
                  value={filters.dateTo ? new Date(filters.dateTo) : null}
                  onChange={(e) => {
                    const formattedDate = e.value
                      ? e.value.toISOString().split("T")[0]
                      : "";
                    handleFilterChange("dateTo", formattedDate);
                  }}
                  showIcon
                  showButtonBar
                  dateFormat="yy-mm-dd"
                  placeholder="Select to date"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <i className="fas fa-times-circle"></i>
                Clear Filters
              </button>
            </div>
          </div>

          {/* All Bookings */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">All Bookings</h2>
                <span className="bg-white text-primary px-4 py-1 rounded-full font-semibold">
                  {filteredBookings.length} booking
                  {filteredBookings.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 px-4">
                <i className="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't made any flight bookings yet.
                </p>
                <button
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  onClick={searchFlights}
                >
                  <i className="fas fa-plus"></i> Book Your First Flight
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Flight Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Departure Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Departure Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Passengers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Booking Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Passenger Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => {
                      const isPackage = booking.bookingType === "package";
                      const flightInfo = booking.flightId || {};
                      const packageInfo = booking.packageOfferId || {};

                      // Handle different possible field names for flight number
                      const flightNumber =
                        flightInfo.number ||
                        flightInfo.flightNumber ||
                        booking.flightNumber ||
                        "N/A";
                      const origin =
                        flightInfo.origin ||
                        flightInfo.from ||
                        booking.origin ||
                        "N/A";
                      const destination =
                        flightInfo.destination ||
                        flightInfo.to ||
                        booking.destination ||
                        "N/A";

                      const departureDate = flightInfo.departureTime
                        ? new Date(flightInfo.departureTime)
                        : null;
                      const bookingDate = booking.createdAt
                        ? new Date(booking.createdAt)
                        : null;

                      return (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm text-gray-900">
                              <i className="fas fa-hashtag text-gray-400 me-1"></i>
                              {booking._id?.slice(-8) || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.status
                                ? booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)
                                : "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {isPackage ? (
                              <span className="font-semibold text-gray-900">
                                <i className="fas fa-tags text-primary me-2"></i>
                                {packageInfo.name || "Package Offer"}
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-900">
                                <i className="fas fa-plane text-primary me-2"></i>
                                {flightNumber}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {isPackage ? (
                              <span className="text-gray-900">
                                <i className="fas fa-box-open text-gray-400 me-2"></i>
                                {packageInfo.category || "Package"}
                              </span>
                            ) : (
                              <span className="text-gray-900">
                                {origin}
                                <i className="fas fa-arrow-right text-gray-400 mx-2"></i>
                                {destination}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {isPackage && bookingDate
                              ? bookingDate.toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : departureDate
                              ? departureDate.toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {isPackage
                              ? "Package Booking"
                              : departureDate
                              ? departureDate.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-gray-900">
                              <i className="fas fa-users text-gray-400 me-2"></i>
                              {booking.seatCount || 1} passenger
                              {(booking.seatCount || 1) > 1 ? "s" : ""}
                            </span>
                            {booking.seatNumbers &&
                              booking.seatNumbers.length > 0 && (
                                <div className="mt-1 text-xs text-gray-600">
                                  <i className="fas fa-chair text-primary me-1"></i>
                                  Seats: {booking.seatNumbers.join(", ")}
                                </div>
                              )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-lg font-bold text-success">
                              ${(booking.totalPrice || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {new Date(booking.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {booking.passengerDetails &&
                            booking.passengerDetails.length > 0 ? (
                              <button
                                className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                                onClick={() => showPassengerDetails(booking)}
                              >
                                <i className="fas fa-eye"></i> View Details
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No passengers
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Professional Passenger Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fas fa-users"></i>
                    Passenger Details
                  </h3>
                  <p className="text-sm text-gray-100 mt-1">
                    Booking #{selectedBooking._id?.slice(-8) || "N/A"}
                  </p>
                </div>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  onClick={closeModal}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {selectedBooking.passengerDetails &&
                selectedBooking.passengerDetails.length > 0 ? (
                  <div className="space-y-4">
                    {selectedBooking.passengerDetails.map(
                      (passenger, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-6 border-l-4 border-primary"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900">
                                Passenger {index + 1}
                              </h4>
                              {selectedBooking.seatNumbers &&
                                selectedBooking.seatNumbers[index] && (
                                  <p className="text-sm text-primary font-semibold mt-1">
                                    <i className="fas fa-chair mr-1"></i>
                                    Seat: {selectedBooking.seatNumbers[index]}
                                  </p>
                                )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 rounded-lg p-2">
                                <i className="fas fa-signature text-blue-600"></i>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Full Name
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {passenger.name || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-green-100 rounded-lg p-2">
                                <i className="fas fa-birthday-cake text-green-600"></i>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Age
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {passenger.age || "N/A"} years old
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-purple-100 rounded-lg p-2">
                                <i className="fas fa-venus-mars text-purple-600"></i>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Gender
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {passenger.gender
                                    ? passenger.gender.charAt(0).toUpperCase() +
                                      passenger.gender.slice(1)
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            {passenger.passport && (
                              <div className="flex items-start gap-3">
                                <div className="bg-orange-100 rounded-lg p-2">
                                  <i className="fas fa-passport text-orange-600"></i>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">
                                    Passport
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {passenger.passport}
                                  </p>
                                </div>
                              </div>
                            )}
                            {passenger.nationality && (
                              <div className="flex items-start gap-3">
                                <div className="bg-red-100 rounded-lg p-2">
                                  <i className="fas fa-flag text-red-600"></i>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">
                                    Nationality
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {passenger.nationality}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">
                    No passenger details available.
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <button
                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  onClick={closeModal}
                >
                  <i className="fas fa-times me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        )}
      </UserLayout>
    </>
  );
};

export default MyBookings;
