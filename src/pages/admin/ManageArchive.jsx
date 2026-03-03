import { useState, useEffect } from "react";
import { format } from "date-fns";
import AdminLayout from "../../components/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const ManageArchive = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [contactQueries, setContactQueries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [notification, setNotification] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [queryResponse, setQueryResponse] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/archive/stats`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchArchivedBookings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/bookings?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching archived bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedFlights = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/flights?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setFlights(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching archived flights:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAutoArchive = async () => {
    try {
      setActionLoading("autoArchive");
      const response = await fetch(`${API_URL}/admin/archive/run`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("success", "Auto-archive completed successfully!");
        fetchStats();
        if (activeTab === "bookings") fetchArchivedBookings();
        else fetchArchivedFlights();
      } else {
        showNotification("error", data.message || "Failed to run auto-archive");
      }
    } catch (error) {
      showNotification("error", "Error running auto-archive");
    } finally {
      setActionLoading(null);
    }
  };

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showFlightEditModal, setShowFlightEditModal] = useState(false);
  const [flightFormData, setFlightFormData] = useState({});

  const openFlightEditModal = (flight) => {
    setSelectedFlight(flight);
    setFlightFormData({
      number: flight.number,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
      price: flight.price,
      totalSeats: flight.totalSeats,
      availableSeats: flight.availableSeats || flight.totalSeats,
      status: flight.status,
      aircraft: flight.aircraft || "",
    });
    setShowFlightEditModal(true);
  };

  const closeFlightEditModal = () => {
    setSelectedFlight(null);
    setFlightFormData({});
    setShowFlightEditModal(false);
  };

  const handleFlightFormChange = (field, value) => {
    setFlightFormData({ ...flightFormData, [field]: value });
  };

  const handleUpdateArchivedFlight = async () => {
    if (!selectedFlight) return;

    // Validate that departure time is in the future
    const departureTime = new Date(flightFormData.departureTime);
    const now = new Date();
    // Give 1 minute tolerance to account for timezone issues and processing time
    const oneMinuteFromNow = new Date(now.getTime() + 60000);

    if (departureTime < oneMinuteFromNow) {
      showNotification(
        "error",
        "Cannot make flight live with a past departure time. Please set a future date.",
      );
      return;
    }

    // Validate arrival time is after departure time
    const arrivalTime = new Date(flightFormData.arrivalTime);
    if (arrivalTime <= departureTime) {
      showNotification("error", "Arrival time must be after departure time");
      return;
    }

    try {
      setActionLoading(selectedFlight._id);

      // Update flight and unarchive it
      const updateData = {
        ...flightFormData,
        isArchived: false,
        archivedAt: null,
        archivedReason: null,
      };

      const response = await fetch(
        `${API_URL}/admin/flights/${selectedFlight._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updateData),
        },
      );

      if (response.ok) {
        showNotification(
          "success",
          "Flight updated and restored successfully!",
        );
        closeFlightEditModal();
        fetchArchivedFlights(pagination.page);
        fetchStats();
      } else {
        const data = await response.json();
        showNotification("error", data.message || "Failed to update flight");
      }
    } catch (error) {
      console.error("Error updating flight:", error);
      showNotification("error", "Error updating flight");
    } finally {
      setActionLoading(null);
    }
  };

  const fetchArchivedUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/users?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching archived users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/feedback?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactQueries = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/contact-queries?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const data = await response.json();
        setContactQueries(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching contact queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const restoreUser = async (id) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_URL}/admin/archive/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        showNotification("success", "User account restored successfully!");
        fetchArchivedUsers(pagination.page);
        fetchStats();
      } else {
        showNotification("error", "Failed to restore user");
      }
    } catch (error) {
      showNotification("error", "Error restoring user");
    } finally {
      setActionLoading(null);
    }
  };

  const deletePermanentlyUser = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) {
      return;
    }
    try {
      setActionLoading(id);
      const response = await fetch(
        `${API_URL}/admin/archive/user/${id}/permanent`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (response.ok) {
        showNotification("success", "User deleted permanently!");
        fetchArchivedUsers(pagination.page);
        fetchStats();
      } else {
        showNotification("error", "Failed to delete user permanently");
      }
    } catch (error) {
      showNotification("error", "Error deleting user");
    } finally {
      setActionLoading(null);
    }
  };

  const updateFeedbackStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_URL}/admin/archive/feedback/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        showNotification("success", "Feedback status updated!");
        fetchFeedback(pagination.page);
      } else {
        showNotification("error", "Failed to update feedback");
      }
    } catch (error) {
      showNotification("error", "Error updating feedback");
    } finally {
      setActionLoading(null);
    }
  };

  const updateQueryStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const response = await fetch(
        `${API_URL}/admin/archive/contact-queries/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );
      if (response.ok) {
        showNotification("success", "Query status updated!");
        fetchContactQueries(pagination.page);
        setShowQueryModal(false);
      } else {
        showNotification("error", "Failed to update query");
      }
    } catch (error) {
      showNotification("error", "Error updating query");
    } finally {
      setActionLoading(null);
    }
  };

  const sendQueryResponse = async () => {
    if (!selectedQuery || !queryResponse.trim()) {
      showNotification("error", "Please enter a response message");
      return;
    }

    try {
      setSendingResponse(true);
      const response = await fetch(
        `${API_URL}/admin/archive/contact-queries/${selectedQuery._id}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ response: queryResponse }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showNotification("success", "Response sent successfully!");
        setQueryResponse("");
        setShowQueryModal(false);
        fetchContactQueries(pagination.page);
      } else {
        showNotification("error", data.message || "Failed to send response");
      }
    } catch (error) {
      console.error("Error sending response:", error);
      showNotification("error", "Error sending response");
    } finally {
      setSendingResponse(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const clearArchiveSection = (section) => {
    setConfirmAction({
      section,
      title: "Clear Archive",
      message: `Are you sure you want to permanently delete all archived ${section}? This action cannot be undone.`,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmClear = async () => {
    if (!confirmAction) return;

    const section = confirmAction.section;
    setShowConfirmModal(false);
    setConfirmAction(null);

    try {
      setActionLoading(`clear-${section}`);
      const response = await fetch(
        `${API_URL}/admin/archive/clear/${section}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        showNotification(
          "success",
          `${data.message} (${data.deletedCount} items deleted)`,
        );
        fetchStats();

        // Refresh current tab
        if (section === "bookings") {
          fetchArchivedBookings(1);
        } else if (section === "flights") {
          fetchArchivedFlights(1);
        } else if (section === "users") {
          fetchArchivedUsers(1);
        } else if (section === "feedback") {
          fetchFeedback(1);
        } else if (section === "contact-queries") {
          fetchContactQueries(1);
        }
      } else {
        showNotification("error", "Failed to clear archive");
      }
    } catch (error) {
      console.error("Error clearing archive:", error);
      showNotification("error", "Error clearing archive");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchArchivedBookings();
    } else if (activeTab === "flights") {
      fetchArchivedFlights();
    } else if (activeTab === "users") {
      fetchArchivedUsers();
    } else if (activeTab === "feedback") {
      fetchFeedback();
    } else if (activeTab === "queries") {
      fetchContactQueries();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const getReasonBadge = (reason) => {
    const badges = {
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      expired: { color: "bg-yellow-100 text-yellow-800", label: "Expired" },
      manual: { color: "bg-gray-100 text-gray-800", label: "Manual" },
      self_deleted: {
        color: "bg-orange-100 text-orange-800",
        label: "Self Deleted",
      },
      admin_deleted: {
        color: "bg-red-100 text-red-800",
        label: "Admin Deleted",
      },
    };
    const badge = badges[reason] || badges.manual;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      read: { color: "bg-gray-100 text-gray-800", label: "Read" },
      resolved: { color: "bg-green-100 text-green-800", label: "Resolved" },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        label: "In Progress",
      },
      closed: { color: "bg-gray-100 text-gray-800", label: "Closed" },
    };
    const badge = badges[status] || badges.new;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { color: "bg-blue-100 text-blue-800", label: "Medium" },
      high: { color: "bg-orange-100 text-orange-800", label: "High" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          ></i>
        ))}
      </div>
    );
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-archive text-primary"></i>
            Archive Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage archived bookings and flights
          </p>
        </div>
        <button
          onClick={runAutoArchive}
          disabled={actionLoading === "autoArchive"}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {actionLoading === "autoArchive" ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-sync-alt"></i>
          )}
          Run Auto-Archive
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-ticket-alt text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Archived Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.bookings.archived}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.bookings.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-plane text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Archived Flights</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.flights.archived}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-plane-departure text-orange-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Flights</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.flights.active}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "bookings"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-ticket-alt mr-2"></i>
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("flights")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "flights"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-plane mr-2"></i>
              Flights
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Deleted Users
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "feedback"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-comment-dots mr-2"></i>
              Feedback
            </button>
            <button
              onClick={() => setActiveTab("queries")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "queries"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-headset mr-2"></i>
              Contact Queries
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
            </div>
          ) : activeTab === "bookings" ? (
            /* Bookings Table */
            <>
              {bookings.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Archived Bookings ({bookings.length})
                  </h3>
                  <button
                    onClick={() => clearArchiveSection("bookings")}
                    disabled={actionLoading === "clear-bookings"}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === "clear-bookings" ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash-alt"></i>
                    )}
                    Clear All
                  </button>
                </div>
              )}
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-archive text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No archived bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Booking ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Details
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Reason
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Archived On
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm font-mono">
                            {booking._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {booking.userId?.name || (
                                  <span className="text-gray-400 italic">
                                    Deleted User
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.userId?.email || ""}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                booking.bookingType === "flight"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {booking.bookingType === "flight"
                                ? "Flight"
                                : "Package"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {booking.bookingType === "flight"
                              ? `${booking.flightId?.origin || "?"} → ${
                                  booking.flightId?.destination || "?"
                                }`
                              : booking.packageOfferId?.name || "Package"}
                          </td>
                          <td className="py-3 px-4">
                            {getReasonBadge(booking.archivedReason)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(booking.archivedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : activeTab === "flights" ? (
            /* Flights Table */
            <>
              {flights.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Archived Flights ({flights.length})
                  </h3>
                  <button
                    onClick={() => clearArchiveSection("flights")}
                    disabled={actionLoading === "clear-flights"}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === "clear-flights" ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash-alt"></i>
                    )}
                    Clear All
                  </button>
                </div>
              )}
              {flights.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-plane text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No archived flights found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Flight #
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Route
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Airline
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Departure
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Reason
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Archived On
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {flights.map((flight) => (
                        <tr
                          key={flight._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {flight.number}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {flight.origin || "?"} → {flight.destination || "?"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {flight.airline}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(flight.departureTime)}
                          </td>
                          <td className="py-3 px-4">
                            {getReasonBadge(flight.archivedReason)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(flight.archivedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openFlightEditModal(flight)}
                              disabled={actionLoading === flight._id}
                              className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading === flight._id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fas fa-edit mr-1"></i> Update
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : activeTab === "users" ? (
            /* Users Table */
            <>
              {users.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Deleted Users ({users.length})
                  </h3>
                  <button
                    onClick={() => clearArchiveSection("users")}
                    disabled={actionLoading === "clear-users"}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === "clear-users" ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash-alt"></i>
                    )}
                    Clear All
                  </button>
                </div>
              )}
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-user-slash text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No deleted users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Phone
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Deleted
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Time Remaining
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Reason
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {user.email}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.phone || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(user.archivedAt)}
                          </td>
                          <td className="py-3 px-4">
                            {getTimeRemaining(user.archiveExpiresAt) ? (
                              <span
                                className={`text-sm font-medium ${
                                  getTimeRemaining(user.archiveExpiresAt) ===
                                  "Expired"
                                    ? "text-red-600"
                                    : "text-orange-600"
                                }`}
                              >
                                {getTimeRemaining(user.archiveExpiresAt)}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {getReasonBadge(user.archiveReason)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => restoreUser(user._id)}
                                disabled={actionLoading === user._id}
                                className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                              >
                                {actionLoading === user._id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <>
                                    <i className="fas fa-undo mr-1"></i> Restore
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => deletePermanentlyUser(user._id)}
                                disabled={actionLoading === user._id}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                              >
                                <i className="fas fa-trash mr-1"></i> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : activeTab === "feedback" ? (
            /* Feedback Table */
            <>
              {feedback.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Archived Feedback ({feedback.length})
                  </h3>
                  <button
                    onClick={() => clearArchiveSection("feedback")}
                    disabled={actionLoading === "clear-feedback"}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === "clear-feedback" ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash-alt"></i>
                    )}
                    Clear All
                  </button>
                </div>
              )}
              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-comment text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No feedback found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Rating
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Message
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.userName || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.userEmail}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.type === "account_deletion"
                                  ? "bg-red-100 text-red-800"
                                  : item.type === "suggestion"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.type === "complaint"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.type?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {item.rating ? getRatingStars(item.rating) : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.message}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                updateFeedbackStatus(
                                  item._id,
                                  item.status === "new" ? "read" : "resolved",
                                )
                              }
                              disabled={actionLoading === item._id}
                              className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading === item._id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : item.status === "new" ? (
                                <>
                                  <i className="fas fa-envelope-open mr-1"></i>{" "}
                                  Mark Read
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check-circle mr-1"></i>{" "}
                                  Mark Resolved
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : activeTab === "queries" ? (
            /* Contact Queries Table */
            <>
              {contactQueries.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Archived Contact Queries ({contactQueries.length})
                  </h3>
                  <button
                    onClick={() => clearArchiveSection("contact-queries")}
                    disabled={actionLoading === "clear-contact-queries"}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === "clear-contact-queries" ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash-alt"></i>
                    )}
                    Clear All
                  </button>
                </div>
              )}
              {contactQueries.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-envelope text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No contact queries found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          From
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactQueries.map((query) => (
                        <tr
                          key={query._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {query.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {query.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                            {query.subject}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                query.type === "account_recovery"
                                  ? "bg-purple-100 text-purple-800"
                                  : query.type === "booking"
                                    ? "bg-blue-100 text-blue-800"
                                    : query.type === "complaint"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {query.type?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {getPriorityBadge(query.priority)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(query.status)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(query.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedQuery(query);
                                setShowQueryModal(true);
                              }}
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                              <i className="fas fa-eye mr-1"></i> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (activeTab === "bookings")
                    fetchArchivedBookings(pagination.page - 1);
                  else if (activeTab === "flights")
                    fetchArchivedFlights(pagination.page - 1);
                  else if (activeTab === "users")
                    fetchArchivedUsers(pagination.page - 1);
                  else if (activeTab === "feedback")
                    fetchFeedback(pagination.page - 1);
                  else if (activeTab === "queries")
                    fetchContactQueries(pagination.page - 1);
                }}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => {
                  if (activeTab === "bookings")
                    fetchArchivedBookings(pagination.page + 1);
                  else if (activeTab === "flights")
                    fetchArchivedFlights(pagination.page + 1);
                  else if (activeTab === "users")
                    fetchArchivedUsers(pagination.page + 1);
                  else if (activeTab === "feedback")
                    fetchFeedback(pagination.page + 1);
                  else if (activeTab === "queries")
                    fetchContactQueries(pagination.page + 1);
                }}
                disabled={pagination.page === pagination.pages}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Query Detail Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedQuery.subject}</h3>
                  <p className="text-primary-100 text-sm mt-1">
                    From: {selectedQuery.name} ({selectedQuery.email})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowQueryModal(false);
                    setQueryResponse("");
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                {getStatusBadge(selectedQuery.status)}
                {getPriorityBadge(selectedQuery.priority)}
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {selectedQuery.type?.replace("_", " ")}
                </span>
              </div>

              {/* Original Query */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-envelope mr-2"></i>Customer Message
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedQuery.message}
                </p>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <p>
                  <i className="fas fa-calendar mr-2"></i>
                  Received: {formatDate(selectedQuery.createdAt)}
                </p>
                {selectedQuery.phone && (
                  <p>
                    <i className="fas fa-phone mr-2"></i>
                    Phone: {selectedQuery.phone}
                  </p>
                )}
              </div>

              {/* Admin Response Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  <i className="fas fa-reply mr-2"></i>Send Response
                </h4>
                <textarea
                  value={queryResponse}
                  onChange={(e) => setQueryResponse(e.target.value)}
                  placeholder="Type your response here... This will be sent to the customer's email."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows="6"
                  disabled={sendingResponse}
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Your response will be sent via email with a professional
                  template.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={sendQueryResponse}
                  disabled={sendingResponse || !queryResponse.trim()}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingResponse ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Response via Email
                    </>
                  )}
                </button>
              </div>

              {/* Status Update Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() =>
                    updateQueryStatus(selectedQuery._id, "in_progress")
                  }
                  disabled={actionLoading === selectedQuery._id}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() =>
                    updateQueryStatus(selectedQuery._id, "resolved")
                  }
                  disabled={actionLoading === selectedQuery._id}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Edit Modal */}
      {showFlightEditModal && selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-2xl font-bold">
                <i className="fas fa-edit mr-3"></i>
                Update Archived Flight
              </h3>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                onClick={closeFlightEditModal}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  Important: Making Flight Live
                </p>
                <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                  <li>
                    This will unarchive the flight and make it visible on the
                    website
                  </li>
                  <li>
                    <strong>
                      Departure time must be set to a future date/time
                    </strong>
                  </li>
                  <li>Flight will be immediately available for booking</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.number || ""}
                    onChange={(e) =>
                      handleFlightFormChange("number", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Airline *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.airline || ""}
                    onChange={(e) =>
                      handleFlightFormChange("airline", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Origin *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.origin || ""}
                    onChange={(e) =>
                      handleFlightFormChange("origin", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.destination || ""}
                    onChange={(e) =>
                      handleFlightFormChange("destination", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Departure Time *{" "}
                    <span className="text-red-600">
                      (Must be in the future)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.departureTime || ""}
                    onChange={(e) =>
                      handleFlightFormChange("departureTime", e.target.value)
                    }
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Arrival Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.arrivalTime || ""}
                    onChange={(e) =>
                      handleFlightFormChange("arrivalTime", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.price || ""}
                    onChange={(e) =>
                      handleFlightFormChange(
                        "price",
                        parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.totalSeats || ""}
                    onChange={(e) =>
                      handleFlightFormChange(
                        "totalSeats",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Seats *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.availableSeats || ""}
                    onChange={(e) =>
                      handleFlightFormChange(
                        "availableSeats",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.status || "scheduled"}
                    onChange={(e) =>
                      handleFlightFormChange("status", e.target.value)
                    }
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Aircraft
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={flightFormData.aircraft || ""}
                    onChange={(e) =>
                      handleFlightFormChange("aircraft", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleUpdateArchivedFlight}
                  disabled={actionLoading === selectedFlight._id}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading === selectedFlight._id ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Update & Make Live
                    </>
                  )}
                </button>
                <button
                  onClick={closeFlightEditModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmClear}
        title={confirmAction?.title || "Confirm Action"}
        message={confirmAction?.message || "Are you sure?"}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

// Wrap with AdminLayout
const ManageArchivePage = () => (
  <AdminLayout>
    <ManageArchive />
  </AdminLayout>
);

export default ManageArchivePage;
