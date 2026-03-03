import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const checkAdminAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData || userData.role !== "admin") {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/bookings", {
        withCredentials: true,
      });
      const bookingsData = response.data.data || [];
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);

      // Calculate stats - only confirmed bookings contribute to revenue
      setStats({
        totalBookings: bookingsData.length,
        confirmedBookings: bookingsData.filter((b) => b.status === "confirmed")
          .length,
        pendingBookings: bookingsData.filter((b) => b.status === "pending")
          .length,
        totalRevenue: bookingsData
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      });
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking._id?.toLowerCase().includes(searchTerm) ||
          booking.userId?.name?.toLowerCase().includes(searchTerm) ||
          booking.userId?.email?.toLowerCase().includes(searchTerm) ||
          booking.flightId?.number?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.status === filters.status
      );
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `/api/admin/bookings/${bookingId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      // Reload bookings after status update to refresh revenue
      await loadBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert(error.response?.data?.message || "Failed to update booking status");
    }
  };

  const confirmBooking = async (bookingId) => {
    try {
      const response = await axios.post(
        `/api/admin/bookings/${bookingId}/confirm`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Reload bookings after confirmation
        await loadBookings();
        alert("Booking confirmed successfully! Ticket number assigned.");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert(error.response?.data?.message || "Failed to confirm booking");
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <i className="fas fa-ticket-alt me-3"></i> Booking Management
              </h1>
              <p className="text-gray-100 text-lg">
                View and manage all flight bookings
              </p>
            </div>
            <button
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
              onClick={loadBookings}
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-4">
              <i className="fas fa-clock text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.pendingBookings}
              </h3>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4">
              <i className="fas fa-dollar-sign text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* All Bookings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
            <h2 className="text-2xl font-bold">All Bookings</h2>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-search text-gray-400 me-2"></i>
                  Search
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by booking ID, user, or flight..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-filter text-gray-400 me-2"></i>
                  Status
                </label>
                <select
                  className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type / Flight
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <i className="fas fa-inbox text-4xl mb-2"></i>
                      <p>No bookings found</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const isPackage = booking.bookingType === "package";
                    const flightInfo = booking.flightId || {};
                    const packageInfo = booking.packageOfferId || {};
                    const userName = booking.userId
                      ? booking.userId.name || booking.userId.email || "Unknown"
                      : "Unknown User";
                    const userImage = booking.userId?.profileImage;

                    return (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-gray-900">
                            #{booking._id?.slice(-8) || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-900">
                          <div className="flex items-center gap-2">
                            {userImage ? (
                              <img
                                src={userImage}
                                alt={userName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {userName}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {isPackage ? (
                            <span className="font-semibold text-gray-900">
                              <i className="fas fa-tags text-purple-600 me-2"></i>
                              {packageInfo.name || "Package Offer"}
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              <i className="fas fa-plane text-primary me-2"></i>
                              {flightInfo.number || "N/A"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-900">
                          {isPackage ? (
                            <span>
                              <i className="fas fa-box-open text-gray-400 me-2"></i>
                              {packageInfo.category || "Package"} -{" "}
                              {packageInfo.duration || "N/A"}
                            </span>
                          ) : (
                            <span>
                              {flightInfo.origin || "N/A"}{" "}
                              <i className="fas fa-arrow-right text-gray-400 mx-2"></i>{" "}
                              {flightInfo.destination || "N/A"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-900">
                          {flightInfo.departureTime
                            ? new Date(
                                flightInfo.departureTime
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-lg font-semibold text-gray-900">
                            ${(booking.totalPrice || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                              onClick={() => viewBookingDetails(booking)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {booking.status === "pending" && (
                              <>
                                <button
                                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                                  onClick={() => confirmBooking(booking._id)}
                                  title="Confirm Booking"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "cancelled"
                                    )
                                  }
                                  title="Cancel Booking"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-bold">
                  <i className="fas fa-ticket-alt mr-3"></i>
                  Booking Details
                </h3>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  onClick={closeDetailsModal}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Booking Status Banner */}
                <div
                  className={`p-4 rounded-lg text-center ${
                    selectedBooking.status === "confirmed"
                      ? "bg-green-100 border-2 border-green-300"
                      : selectedBooking.status === "pending"
                      ? "bg-yellow-100 border-2 border-yellow-300"
                      : "bg-red-100 border-2 border-red-300"
                  }`}
                >
                  <span
                    className={`text-2xl font-bold uppercase ${
                      selectedBooking.status === "confirmed"
                        ? "text-green-800"
                        : selectedBooking.status === "pending"
                        ? "text-yellow-800"
                        : "text-red-800"
                    }`}
                  >
                    <i
                      className={`fas ${
                        selectedBooking.status === "confirmed"
                          ? "fa-check-circle"
                          : selectedBooking.status === "pending"
                          ? "fa-clock"
                          : "fa-times-circle"
                      } mr-2`}
                    ></i>
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Booking Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-info-circle text-primary mr-2"></i>
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Booking ID
                      </label>
                      <p className="text-gray-900 font-mono">
                        #{selectedBooking._id?.slice(-8) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Booking Date
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.createdAt
                          ? new Date(selectedBooking.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Total Amount
                      </label>
                      <p className="text-2xl font-bold text-primary">
                        ${(selectedBooking.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Number of Passengers
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.passengerDetails?.length || 0}
                      </p>
                    </div>
                    {selectedBooking.seatNumbers &&
                      selectedBooking.seatNumbers.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Seat Numbers
                          </label>
                          <p className="text-gray-900">
                            <i className="fas fa-chair text-primary mr-2"></i>
                            {selectedBooking.seatNumbers.join(", ")}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-user text-blue-600 mr-2"></i>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Name
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.userId?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.userId?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.userId?.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">
                        User ID
                      </label>
                      <p className="text-gray-900 font-mono">
                        {selectedBooking.userId?._id?.slice(-8) || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                {selectedBooking.bookingType === "package" &&
                  selectedBooking.packageOfferId && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-tags text-purple-600 mr-2"></i>
                        Package Offer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Package Name
                          </label>
                          <p className="text-gray-900 font-bold">
                            {selectedBooking.packageOfferId.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Category
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.packageOfferId.category || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Duration
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.packageOfferId.duration || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Price Unit
                          </label>
                          <p className="text-gray-900 capitalize">
                            {selectedBooking.packageOfferId.priceUnit || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Number of Persons
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.personCount || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Base Price
                          </label>
                          <p className="text-gray-900">
                            ${selectedBooking.packageOfferId.price || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Flight Information */}
                {selectedBooking.bookingType === "flight" &&
                  selectedBooking.flightId && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-plane text-blue-600 mr-2"></i>
                        Flight Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Flight Number
                          </label>
                          <p className="text-gray-900 font-bold">
                            {selectedBooking.flightId.number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Airline
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.flightId.airline || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Route
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.flightId.origin || "N/A"}
                            <i className="fas fa-arrow-right text-gray-400 mx-2"></i>
                            {selectedBooking.flightId.destination || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Departure Date
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.flightId.departureTime
                              ? new Date(
                                  selectedBooking.flightId.departureTime
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Arrival Date
                          </label>
                          <p className="text-gray-900">
                            {selectedBooking.flightId.arrivalTime
                              ? new Date(
                                  selectedBooking.flightId.arrivalTime
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 font-semibold">
                            Class
                          </label>
                          <p className="text-gray-900 capitalize">
                            {selectedBooking.flightId.class || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Passengers Information */}
                {selectedBooking.passengers &&
                  selectedBooking.passengers.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-users text-green-600 mr-2"></i>
                        Passenger Details ({selectedBooking.passengers.length})
                      </h4>
                      {/* Show all seat numbers if available */}
                      {selectedBooking.seatNumbers &&
                        selectedBooking.seatNumbers.length > 0 && (
                          <div className="mb-3 p-3 bg-white rounded-lg border border-green-200">
                            <span className="text-sm text-gray-600 font-semibold">
                              <i className="fas fa-chair mr-2 text-green-600"></i>
                              Assigned Seats:
                            </span>
                            <span className="ml-2 text-gray-900 font-bold">
                              {selectedBooking.seatNumbers.join(", ")}
                            </span>
                          </div>
                        )}
                      <div className="space-y-3">
                        {selectedBooking.passengers.map((passenger, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-lg border border-green-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="font-bold text-gray-900">
                                  {passenger.name || "N/A"}
                                </span>
                              </div>
                              {selectedBooking.seatNumbers &&
                                selectedBooking.seatNumbers[index] && (
                                  <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                                    <i className="fas fa-chair text-green-700 text-sm"></i>
                                    <span className="font-bold text-green-800 text-sm">
                                      {selectedBooking.seatNumbers[index]}
                                    </span>
                                  </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Age:</span>
                                <span className="ml-2 text-gray-900">
                                  {passenger.age || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Gender:</span>
                                <span className="ml-2 text-gray-900 capitalize">
                                  {passenger.gender || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Passport:</span>
                                <span className="ml-2 text-gray-900 font-mono">
                                  {passenger.passport || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={closeDetailsModal}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Close
                  </button>
                  {selectedBooking.status === "pending" && (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, "confirmed");
                          closeDetailsModal();
                        }}
                      >
                        <i className="fas fa-check mr-2"></i>
                        Confirm Booking
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, "cancelled");
                          closeDetailsModal();
                        }}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel Booking
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageBookings;
