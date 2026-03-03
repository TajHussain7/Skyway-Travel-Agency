import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal";

const ManageSeating = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [stats, setStats] = useState({
    totalSeats: 0,
    bookedSeats: 0,
    availableSeats: 0,
    occupancyRate: 0,
  });
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [notificationType, setNotificationType] = useState("reminder");
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadFlights();
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    if (selectedFlight) {
      loadFlightBookings(selectedFlight._id);
      generateSeatMap();
    }
  }, [selectedFlight]);

  // Regenerate seat map and stats whenever bookings change
  useEffect(() => {
    if (selectedFlight) {
      generateSeatMap();
      calculateStats();
    }
  }, [bookings]);

  // Auto-refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (selectedFlight) {
        loadFlightBookings(selectedFlight._id);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [selectedFlight]);

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

  const loadFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/flights", {
        withCredentials: true,
      });
      const flightsData =
        response.data.data?.flights ||
        response.data.flights ||
        response.data.data ||
        [];
      setFlights(flightsData);
    } catch (error) {
      console.error("Error loading flights:", error);
      showNotification("error", "Failed to load flights");
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await axios.get("/api/admin/notifications/settings", {
        withCredentials: true,
      });
      setNotificationSettings(response.data.data);
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const sendFlightNotifications = async () => {
    if (!selectedFlight || !notificationSettings) return;

    if (!notificationSettings.emailNotifications) {
      showNotification(
        "error",
        "Email notifications are disabled in settings. Please enable them first.",
      );
      return;
    }

    // Validate cancellation reason if cancellation type
    if (notificationType === "cancellation" && !cancellationReason.trim()) {
      showNotification(
        "error",
        "Please provide a cancellation reason before sending.",
      );
      return;
    }

    setConfirmAction({
      title: "Send Flight Notifications",
      message: `Send ${notificationType} notifications to all passengers on flight ${selectedFlight.number}? This will email ${bookings.length} passenger(s).${notificationType === "cancellation" ? " This will also cancel all bookings and free up seats." : notificationType === "confirmation" ? " This will also mark all bookings as confirmed." : ""}`,
      type: notificationType === "cancellation" ? "danger" : "info",
      callback: async () => {
        try {
          setSendingNotifications(true);
          const response = await axios.post(
            "/api/admin/notifications/send-flight",
            {
              flightId: selectedFlight._id,
              notificationType,
              cancellationReason:
                notificationType === "cancellation" ? cancellationReason : null,
            },
            { withCredentials: true },
          );
          showNotification(
            "success",
            response.data.message || "Notifications sent successfully",
          );
          setShowNotificationPanel(false);
          setCancellationReason("");
          // Reload bookings to reflect status changes (confirmation or cancellation)
          if (
            notificationType === "cancellation" ||
            notificationType === "confirmation"
          ) {
            loadFlightBookings(selectedFlight._id);
          }
        } catch (error) {
          console.error("Error sending notifications:", error);
          showNotification(
            "error",
            error.response?.data?.message || "Failed to send notifications",
          );
        } finally {
          setSendingNotifications(false);
        }
      },
    });
    setShowConfirmModal(true);
  };

  const sendSelectedBookingNotifications = async () => {
    if (selectedBookings.length === 0) {
      showNotification("error", "Please select at least one booking");
      return;
    }

    if (!notificationSettings?.emailNotifications) {
      showNotification("error", "Email notifications are disabled in settings");
      return;
    }

    // Validate cancellation reason if cancellation type
    if (notificationType === "cancellation" && !cancellationReason.trim()) {
      showNotification(
        "error",
        "Please provide a cancellation reason before sending.",
      );
      return;
    }

    setConfirmAction({
      title: "Send Selected Notifications",
      message: `Send ${notificationType} notifications to ${selectedBookings.length} selected passenger(s)?${notificationType === "cancellation" ? " This will also cancel these bookings and free up their seats." : notificationType === "confirmation" ? " This will also mark these bookings as confirmed." : ""}`,
      type: notificationType === "cancellation" ? "danger" : "info",
      callback: async () => {
        try {
          setSendingNotifications(true);
          const response = await axios.post(
            "/api/admin/notifications/send-bulk",
            {
              bookingIds: selectedBookings,
              notificationType,
              cancellationReason:
                notificationType === "cancellation" ? cancellationReason : null,
            },
            { withCredentials: true },
          );
          showNotification(
            "success",
            response.data.message || "Notifications sent successfully",
          );
          setSelectedBookings([]);
          setShowNotificationPanel(false);
          setCancellationReason("");
          // Reload bookings to reflect status changes (confirmation or cancellation)
          if (
            notificationType === "cancellation" ||
            notificationType === "confirmation"
          ) {
            loadFlightBookings(selectedFlight._id);
          }
        } catch (error) {
          console.error("Error sending notifications:", error);
          showNotification(
            "error",
            error.response?.data?.message || "Failed to send notifications",
          );
        } finally {
          setSendingNotifications(false);
        }
      },
    });
    setShowConfirmModal(true);
  };

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId],
    );
  };

  const loadFlightBookings = async (flightId) => {
    try {
      const response = await axios.get(
        `/api/admin/bookings?flightId=${flightId}`,
        {
          withCredentials: true,
        },
      );
      const bookingsData = response.data.data || [];
      // Filter for this flight and only confirmed/pending bookings (not cancelled)
      const relevantBookings = bookingsData.filter(
        (b) =>
          b.flightId?._id === flightId &&
          (b.status === "confirmed" || b.status === "pending"),
      );
      setBookings(relevantBookings);
      calculateStats();
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const generateSeatMap = () => {
    if (!selectedFlight) return;

    const rows = Math.ceil(selectedFlight.totalSeats / 6); // 6 seats per row (A-F)
    const seatLayout = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < 6; col++) {
        const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
        const seatIndex = (row - 1) * 6 + col + 1;

        if (seatIndex <= selectedFlight.totalSeats) {
          rowSeats.push({
            number: seatNumber,
            index: seatIndex,
            status: "available",
            booking: null,
          });
        }
      }
      seatLayout.push(rowSeats);
    }

    // Mark booked seats
    bookings.forEach((booking) => {
      if (booking.seatNumbers && Array.isArray(booking.seatNumbers)) {
        booking.seatNumbers.forEach((seatNum) => {
          const row = parseInt(seatNum.match(/\d+/)[0]);
          const colChar = seatNum.match(/[A-F]/)[0];
          const col = colChar.charCodeAt(0) - 65;

          if (seatLayout[row - 1] && seatLayout[row - 1][col]) {
            seatLayout[row - 1][col].status = "booked";
            seatLayout[row - 1][col].booking = booking;
          }
        });
      }
    });

    setSeatMap(seatLayout);
  };

  const calculateStats = () => {
    if (!selectedFlight) return;

    const totalSeats = selectedFlight.totalSeats;

    // Calculate booked seats from actual active bookings, not from flight.availableSeats
    const bookedSeats = bookings.reduce((total, booking) => {
      return total + (booking.seatCount || 0);
    }, 0);

    const availableSeats = totalSeats - bookedSeats;
    const occupancyRate =
      totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;

    setStats({
      totalSeats,
      bookedSeats,
      availableSeats,
      occupancyRate,
    });
  };

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setSeatMap([]);
    setBookings([]);
  };

  const getSeatClass = (seat) => {
    const baseClass =
      "relative w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all cursor-pointer";

    if (seat.status === "booked") {
      return `${baseClass} bg-red-500 border-red-600 text-white hover:bg-red-600`;
    }
    return `${baseClass} bg-green-500 border-green-600 text-white hover:bg-green-600`;
  };

  const handleSeatClick = (seat) => {
    // Click functionality disabled - use hover instead
  };

  const handleSeatHover = (seat, isEntering) => {
    if (isEntering && seat.booking) {
      setHoveredSeat(seat);
    } else if (!isEntering) {
      setHoveredSeat(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredFlights = flights.filter(
    (flight) =>
      flight.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <i className="fas fa-spinner fa-spin text-5xl text-primary"></i>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <i className="fas fa-chair"></i>
                Seating Management
              </h1>
              <p className="mt-2 text-white/90">
                Manage flight seating and view seat availability
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : notification.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Select Flight
              </h2>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>

              {/* Flights List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFlights.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No flights found
                  </p>
                ) : (
                  filteredFlights.map((flight) => (
                    <div
                      key={flight._id}
                      onClick={() => handleFlightSelect(flight)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFlight?._id === flight._id
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {flight.number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {flight.airline}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            flight.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : flight.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {flight.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {flight.origin} → {flight.destination}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          <i className="fas fa-chair mr-1"></i>
                          {flight.availableSeats}/{flight.totalSeats} available
                        </span>
                        <span>
                          {(
                            ((flight.totalSeats - flight.availableSeats) /
                              flight.totalSeats) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Seat Map Panel */}
          <div className="lg:col-span-2">
            {!selectedFlight ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <i className="fas fa-hand-pointer text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Flight
                </h3>
                <p className="text-gray-500">
                  Choose a flight from the list to view its seat map
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header with Refresh Button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    <i className="fas fa-chair mr-2 text-primary"></i>
                    {selectedFlight.number} - Seat Map
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setShowNotificationPanel(!showNotificationPanel)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        showNotificationPanel
                          ? "bg-gray-200 text-gray-700"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                      title="Send email notifications to passengers"
                    >
                      <i
                        className={`fas ${showNotificationPanel ? "fa-times" : "fa-bell"}`}
                      ></i>
                      {showNotificationPanel ? "Close" : "Notify Passengers"}
                    </button>
                    <button
                      onClick={() => loadFlightBookings(selectedFlight._id)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <i className="fas fa-sync-alt"></i>
                      Refresh Seats
                    </button>
                  </div>
                </div>

                {/* Notification Panel */}
                {showNotificationPanel && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <i className="fas fa-envelope text-2xl text-purple-600"></i>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Send professional email notifications to passengers
                        </p>
                      </div>
                    </div>

                    {/* Notification Settings Status */}
                    {notificationSettings && (
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">
                            <i className="fas fa-cog mr-2 text-gray-500"></i>
                            Email Notifications:
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              notificationSettings.emailNotifications
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {notificationSettings.emailNotifications
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>
                        {!notificationSettings.emailNotifications && (
                          <p className="mt-2 text-xs text-red-600">
                            ⚠️ Email notifications are disabled. Enable them in
                            Settings → Notification Settings.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notification Type Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="fas fa-tag mr-2"></i>
                        Notification Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setNotificationType("confirmation")}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            notificationType === "confirmation"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <i className="fas fa-check-circle text-green-600"></i>
                            <span className="font-semibold text-gray-900">
                              Confirmation
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Booking confirmed
                          </p>
                        </button>

                        <button
                          onClick={() => setNotificationType("reminder")}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            notificationType === "reminder"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-gray-200 hover:border-yellow-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <i className="fas fa-clock text-yellow-600"></i>
                            <span className="font-semibold text-gray-900">
                              Reminder
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Flight reminder
                          </p>
                        </button>

                        <button
                          onClick={() => setNotificationType("seatChange")}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            notificationType === "seatChange"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <i className="fas fa-exchange-alt text-blue-600"></i>
                            <span className="font-semibold text-gray-900">
                              Seat Change
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">Seat updated</p>
                        </button>

                        <button
                          onClick={() => setNotificationType("cancellation")}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            notificationType === "cancellation"
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-red-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <i className="fas fa-times-circle text-red-600"></i>
                            <span className="font-semibold text-gray-900">
                              Cancellation
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Booking cancelled
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Cancellation Reason Input - Only show when cancellation is selected */}
                    {notificationType === "cancellation" && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-exclamation-circle mr-2 text-red-600"></i>
                          Cancellation Reason{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={cancellationReason}
                          onChange={(e) =>
                            setCancellationReason(e.target.value)
                          }
                          placeholder="Enter the reason for cancellation (required)..."
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          This reason will be included in the cancellation email
                          sent to passengers.
                        </p>
                      </div>
                    )}

                    {/* Booking Selection for Individual Notifications */}
                    {bookings.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-users mr-2"></i>
                          Select Passengers (Optional)
                        </label>
                        <div className="max-h-40 overflow-y-auto bg-white rounded-lg border border-gray-200 p-2">
                          {bookings.map((booking) => (
                            <label
                              key={booking._id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBookings.includes(booking._id)}
                                onChange={() =>
                                  toggleBookingSelection(booking._id)
                                }
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                              />
                              <div className="flex-1 text-sm">
                                <span className="font-medium text-gray-900">
                                  {booking.userId?.name || "Unknown"}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  (
                                  {booking.seatNumbers?.join(", ") ||
                                    "No seats"}
                                  )
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to notify all passengers
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={sendFlightNotifications}
                        disabled={
                          sendingNotifications ||
                          bookings.length === 0 ||
                          !notificationSettings?.emailNotifications
                        }
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingNotifications ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Send to All ({bookings.length})
                          </>
                        )}
                      </button>

                      {selectedBookings.length > 0 && (
                        <button
                          onClick={sendSelectedBookingNotifications}
                          disabled={
                            sendingNotifications ||
                            !notificationSettings?.emailNotifications
                          }
                          className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingNotifications ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check mr-2"></i>
                              Send to Selected ({selectedBookings.length})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Total Seats
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.totalSeats}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">
                      Available
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.availableSeats}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Booked</p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.bookedSeats}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">
                      Occupancy
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.occupancyRate}%
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mb-6 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                  </div>
                </div>

                {/* Seat Map */}
                <div className="bg-gray-50 p-6 rounded-lg overflow-auto">
                  <div className="flex flex-col items-center space-y-2">
                    {seatMap.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-2">
                        {row.slice(0, 3).map((seat, seatIndex) => (
                          <div key={seatIndex} className="relative">
                            <button
                              onClick={() => handleSeatClick(seat)}
                              onMouseEnter={() => handleSeatHover(seat, true)}
                              onMouseLeave={() => handleSeatHover(seat, false)}
                              className={getSeatClass(seat)}
                              title={`Seat ${seat.number} - ${seat.status}`}
                            >
                              {seat.number}
                            </button>
                            {hoveredSeat?.number === seat.number &&
                              seat.booking && (
                                <div
                                  className={`absolute z-50 ${
                                    seat.number.startsWith("1")
                                      ? "top-full mt-2"
                                      : "bottom-full mb-2"
                                  } left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none`}
                                >
                                  <div className="font-semibold">
                                    {seat.booking.userId?.name || "Unknown"}
                                  </div>
                                  <div className="text-gray-300">
                                    {seat.booking.bookingReference ||
                                      seat.booking.ticketNumber ||
                                      "No ticket #"}
                                  </div>
                                  {seat.number.startsWith("1") ? (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                                      <div className="border-4 border-transparent border-b-gray-900"></div>
                                    </div>
                                  ) : (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                        {/* Aisle */}
                        <div className="w-6"></div>
                        {row.slice(3, 6).map((seat, seatIndex) => (
                          <div key={seatIndex + 3} className="relative">
                            <button
                              onClick={() => handleSeatClick(seat)}
                              onMouseEnter={() => handleSeatHover(seat, true)}
                              onMouseLeave={() => handleSeatHover(seat, false)}
                              className={getSeatClass(seat)}
                              title={`Seat ${seat.number} - ${seat.status}`}
                            >
                              {seat.number}
                            </button>
                            {hoveredSeat?.number === seat.number &&
                              seat.booking && (
                                <div
                                  className={`absolute z-50 ${
                                    seat.number.startsWith("1")
                                      ? "top-full mt-2"
                                      : "bottom-full mb-2"
                                  } left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none`}
                                >
                                  <div className="font-semibold">
                                    {seat.booking.userId?.name || "Unknown"}
                                  </div>
                                  <div className="text-gray-300">
                                    {seat.booking.bookingReference ||
                                      seat.booking.ticketNumber ||
                                      "No ticket #"}
                                  </div>
                                  {seat.number.startsWith("1") ? (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                                      <div className="border-4 border-transparent border-b-gray-900"></div>
                                    </div>
                                  ) : (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction?.callback) {
            confirmAction.callback();
          }
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        title={confirmAction?.title || "Confirm Action"}
        message={confirmAction?.message || "Are you sure?"}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmAction?.type || "info"}
      />
    </AdminLayout>
  );
};

export default ManageSeating;
