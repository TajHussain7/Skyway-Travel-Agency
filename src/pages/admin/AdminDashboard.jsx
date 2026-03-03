import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalFlights: 0,
  });
  const [quickStats, setQuickStats] = useState({
    todayBookings: 0,
    onlineUsers: 0,
    pendingApprovals: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadDashboardData();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData || userData.role !== "admin") {
        navigate("/dashboard");
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

      // Load dashboard stats from dedicated endpoint
      const dashboardResponse = await axios.get("/api/admin/dashboard", {
        withCredentials: true,
      });
      const dashboardData = dashboardResponse.data.data || {};

      if (dashboardData.stats) {
        setStats({
          totalUsers: dashboardData.stats.totalUsers || 0,
          totalBookings: dashboardData.stats.totalBookings || 0,
          totalRevenue: dashboardData.stats.totalRevenue || 0,
          totalFlights: dashboardData.stats.totalFlights || 0,
        });
      }

      // Double-check flight count by loading and filtering flights
      try {
        const flightsResponse = await axios.get("/api/admin/flights", {
          withCredentials: true,
        });
        const flightsData =
          flightsResponse.data.data?.flights ||
          flightsResponse.data.flights ||
          flightsResponse.data.data ||
          [];
        const activeFlights = flightsData.filter((f) => f.status === "active");
        setStats((prev) => ({ ...prev, totalFlights: activeFlights.length }));
      } catch (flightError) {
        console.error("Error loading flights for accurate count:", flightError);
      }

      // Load all bookings for accurate calculations
      const allBookingsResponse = await axios.get("/api/admin/bookings", {
        withCredentials: true,
      });
      const allBookings = allBookingsResponse.data.data || [];

      // Set recent bookings with populated data
      const recentBookingsData = allBookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(recentBookingsData);

      // Calculate quick stats from real data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBookings = allBookings.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      }).length;

      const pendingApprovals = allBookings.filter(
        (b) => b.status === "pending",
      ).length;

      setQuickStats({
        todayBookings,
        pendingApprovals,
      });

      // Build recent activity from real data
      const activities = [];

      // Add recent bookings
      const latestBookings = allBookings.slice(0, 3);
      latestBookings.forEach((booking) => {
        const timeAgo = getTimeAgo(booking.createdAt);
        const userName =
          booking.userId?.name || booking.userId?.email || "Unknown User";
        const flightInfo = booking.flightId
          ? `${booking.flightId.origin}-${booking.flightId.destination}`
          : "Flight";
        activities.push({
          type: "booking",
          message: `New booking by ${userName}: ${flightInfo}`,
          time: timeAgo,
        });
      });

      // Add recent users if available
      if (dashboardData.recentUsers && dashboardData.recentUsers.length > 0) {
        dashboardData.recentUsers.slice(0, 2).forEach((user) => {
          const timeAgo = getTimeAgo(user.createdAt);
          activities.push({
            type: "user",
            message: `New user registered: ${user.name || user.email}`,
            time: timeAgo,
          });
        });
      }

      // Sort by most recent and take top 5
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to individual API calls
      await loadStatsIndividually();
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const loadStatsIndividually = async () => {
    try {
      // Load users
      const usersResponse = await axios.get("/api/admin/users", {
        withCredentials: true,
      });
      const users = usersResponse.data.data || [];
      setStats((prev) => ({ ...prev, totalUsers: users.length }));

      // Load bookings
      const bookingsResponse = await axios.get("/api/admin/bookings", {
        withCredentials: true,
      });
      const bookings = bookingsResponse.data.data || [];
      setStats((prev) => ({ ...prev, totalBookings: bookings.length }));
      setRecentBookings(bookings.slice(0, 5));

      // Load flights and count only active ones
      const flightsResponse = await axios.get("/api/admin/flights", {
        withCredentials: true,
      });
      const flightsData =
        flightsResponse.data.data?.flights ||
        flightsResponse.data.flights ||
        flightsResponse.data.data ||
        [];
      const activeFlights = flightsData.filter((f) => f.status === "active");
      setStats((prev) => ({ ...prev, totalFlights: activeFlights.length }));
    } catch (error) {
      console.error("Error loading individual stats:", error);
    }
  };

  const viewBooking = (bookingId) => {
    navigate(`/admin/bookings#${bookingId}`);
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `/api/admin/bookings/${bookingId}`,
        { status: newStatus },
        { withCredentials: true },
      );
      // Reload dashboard data after status update to refresh revenue
      await loadDashboardData();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert(error.response?.data?.message || "Failed to update booking status");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading dashboard...</p>
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
                <i className="fas fa-tachometer-alt me-3"></i>
                Admin Dashboard
              </h1>
              <p className="text-gray-100 text-lg">
                Welcome back,{" "}
                <span className="text-yellow-300 font-semibold">
                  {user?.name || "Administrator"}
                </span>{" "}
                - System Administrator
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={() => setShowQuickActions(true)}
              >
                <i className="fas fa-plus"></i> Quick Actions
              </button>
              <button
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={loadDashboardData}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4">
              <i className="fas fa-users text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalUsers}
              </h3>
              <p className="text-gray-600 mb-2">Total Users</p>
              <span className="text-sm text-green-600 font-semibold">
                <i className="fas fa-arrow-up"></i> +5% this month
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-4">
              <i className="fas fa-ticket-alt text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalBookings}
              </h3>
              <p className="text-gray-600 mb-2">Total Bookings</p>
              <span className="text-sm text-green-600 font-semibold">
                <i className="fas fa-arrow-up"></i> +12% this month
              </span>
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
              <p className="text-gray-600 mb-2">Total Revenue</p>
              <span className="text-sm text-green-600 font-semibold">
                <i className="fas fa-arrow-up"></i> +8% this month
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-4">
              <i className="fas fa-plane text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalFlights}
              </h3>
              <p className="text-gray-600 mb-2">Active Flights</p>
              <span className="text-sm text-gray-600 font-semibold">
                <i className="fas fa-minus"></i> No change
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-clock"></i> Recent Activity
              </h2>
              <a
                href="/admin/activity"
                className="text-white hover:text-gray-200 font-semibold"
              >
                View All <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className="p-6 space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                      activity.type === "user"
                        ? "bg-blue-500"
                        : activity.type === "booking"
                          ? "bg-green-500"
                          : "bg-purple-500"
                    }`}
                  >
                    <i
                      className={`fas ${
                        activity.type === "user"
                          ? "fa-user-plus"
                          : activity.type === "booking"
                            ? "fa-ticket-alt"
                            : "fa-plane"
                      } text-lg`}
                    ></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {activity.message}
                    </p>
                    <small className="text-gray-500">{activity.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-chart-bar"></i> Quick Stats
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-2">Today's Bookings</h4>
                <span className="text-3xl font-bold text-blue-600">
                  {quickStats.todayBookings}
                </span>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-2">
                  Pending Approvals
                </h4>
                <span className="text-3xl font-bold text-yellow-600">
                  {quickStats.pendingApprovals}
                </span>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-2">Total Revenue</h4>
                <span className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-2">System Status</h4>
                <span className="text-lg font-bold text-green-600">
                  <i className="fas fa-check-circle"></i> Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-list"></i> Recent Bookings
            </h2>
            <a
              href="/admin/bookings"
              className="text-white hover:text-gray-200 font-semibold"
            >
              View All <i className="fas fa-arrow-right"></i>
            </a>
          </div>
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
                    Flight
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
                {recentBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <i className="fas fa-inbox text-4xl mb-2"></i>
                      <p>No recent bookings found</p>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => {
                    const flightInfo = booking.flightId
                      ? `${booking.flightId.number || "N/A"} (${
                          booking.flightId.origin || "N/A"
                        } → ${booking.flightId.destination || "N/A"})`
                      : "Flight data unavailable";

                    const userName = booking.userId
                      ? booking.userId.name || booking.userId.email || "Unknown"
                      : "Unknown User";

                    return (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-gray-900">
                            #{booking._id ? booking._id.slice(-6) : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-900">{userName}</td>
                        <td className="px-4 py-4 text-gray-900">
                          {flightInfo}
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
                            {booking.status || "unknown"}
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
                              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                              onClick={() => viewBookingDetails(booking)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {booking.status === "pending" && (
                              <>
                                <button
                                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "confirmed",
                                    )
                                  }
                                  title="Confirm Booking"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "cancelled",
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

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-teal-700 text-white p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-heartbeat"></i> System Health
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Database</div>
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Connected
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">API Services</div>
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Running
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Email Service</div>
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Active
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Backup Status</div>
              <div className="text-yellow-600 font-semibold flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i> Last: 2h ago
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full animate-zoom-in">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Quick Actions</h3>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                onClick={() => setShowQuickActions(false)}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300 group"
                  onClick={() => {
                    navigate("/admin/users");
                    setShowQuickActions(false);
                  }}
                >
                  <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <span className="font-semibold text-gray-900">Add User</span>
                </button>
                <button
                  className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-300 group"
                  onClick={() => {
                    navigate("/admin/flights");
                    setShowQuickActions(false);
                  }}
                >
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-plane"></i>
                  </div>
                  <span className="font-semibold text-gray-900">
                    Add Flight
                  </span>
                </button>
                <button
                  className="flex flex-col items-center gap-3 p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-300 group"
                  onClick={() => {
                    navigate("/admin/settings");
                    setShowQuickActions(false);
                  }}
                >
                  <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-cog"></i>
                  </div>
                  <span className="font-semibold text-gray-900">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <div className="md:col-span-2">
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

              {/* Passenger Details */}
              {selectedBooking.passengerDetails &&
                selectedBooking.passengerDetails.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-users text-green-600 mr-2"></i>
                      Passenger Details (
                      {selectedBooking.passengerDetails.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedBooking.passengerDetails.map(
                        (passenger, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-green-200"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-lg">
                                  {passenger.name || "N/A"}
                                </p>
                                {selectedBooking.seatNumbers &&
                                  selectedBooking.seatNumbers[index] && (
                                    <p className="text-sm text-primary font-semibold">
                                      <i className="fas fa-chair mr-1"></i>
                                      Seat: {selectedBooking.seatNumbers[index]}
                                    </p>
                                  )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Age:</span>
                                <span className="ml-2 text-gray-900 font-medium">
                                  {passenger.age || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Gender:</span>
                                <span className="ml-2 text-gray-900 font-medium capitalize">
                                  {passenger.gender || "N/A"}
                                </span>
                              </div>
                              {passenger.email && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Email:</span>
                                  <span className="ml-2 text-gray-900 font-medium">
                                    {passenger.email}
                                  </span>
                                </div>
                              )}
                              {passenger.phone && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Phone:</span>
                                  <span className="ml-2 text-gray-900 font-medium">
                                    {passenger.phone}
                                  </span>
                                </div>
                              )}
                              {passenger.passportNumber && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">
                                    Passport:
                                  </span>
                                  <span className="ml-2 text-gray-900 font-mono font-medium">
                                    {passenger.passportNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

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

              {/* Flight Information */}
              {selectedBooking.flightId && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-plane text-purple-600 mr-2"></i>
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
                              selectedBooking.flightId.departureTime,
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
                              selectedBooking.flightId.arrivalTime,
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
                    <div className="space-y-3">
                      {selectedBooking.passengers.map((passenger, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="font-bold text-gray-900">
                              {passenger.name || "N/A"}
                            </span>
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
    </AdminLayout>
  );
};

export default AdminDashboard;
