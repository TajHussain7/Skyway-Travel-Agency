import { useState, useEffect } from "react";
import { format } from "date-fns";
import UserLayout from "../../components/UserLayout";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const PastBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchPastBookings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/booking/user/past-bookings?page=${page}&limit=${pagination.limit}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch past bookings");
      }

      const data = await response.json();
      setBookings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastBookings();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchPastBookings(newPage);
    }
  };

  const getReasonBadge = (reason) => {
    const badges = {
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      expired: { color: "bg-yellow-100 text-yellow-800", label: "Expired" },
      manual: { color: "bg-gray-100 text-gray-800", label: "Archived" },
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return "N/A";
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading past bookings</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <i className="fas fa-archive text-3xl text-primary"></i>
          <h1 className="text-2xl font-bold text-gray-900">Past Bookings</h1>
        </div>
        <p className="text-gray-600">
          View your archived and completed travel history
        </p>
      </div>

      {/* Empty State */}
      {bookings.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-archive text-6xl text-gray-300 block mx-auto mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Past Bookings
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Your completed and archived bookings will appear here. Once your
            trips are complete, they&apos;ll be moved to this archive for your
            records.
          </p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {booking.bookingType === "flight" ? (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-plane text-blue-600"></i>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-box text-purple-600"></i>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.bookingType === "flight"
                          ? `Flight ${booking.flightId?.number || "N/A"}`
                          : booking.packageOfferId?.name || "Package Booking"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booking ID: {booking._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {getReasonBadge(booking.archivedReason)}
                </div>

                {/* Flight Details */}
                {booking.bookingType === "flight" && booking.flightId && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="fas fa-map-marker-alt w-4"></i>
                      <span className="text-sm">
                        {booking.flightId.origin?.name ||
                          booking.flightId.origin}{" "}
                        →{" "}
                        {booking.flightId.destination?.name ||
                          booking.flightId.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="fas fa-calendar-alt w-4"></i>
                      <span className="text-sm">
                        {formatDateTime(booking.flightId.departureTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Package Details */}
                {booking.bookingType === "package" &&
                  booking.packageOfferId && (
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-box w-4"></i>
                        <span className="text-sm">
                          {booking.packageOfferId.category || "Package"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-calendar-alt w-4"></i>
                        <span className="text-sm">
                          Booked on {formatDate(booking.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <i className="fas fa-clock w-4"></i>
                    <span className="text-sm">
                      Archived on {formatDate(booking.archivedAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total Paid</span>
                    <p className="font-bold text-gray-900">
                      ${booking.totalPrice?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {bookings.length} of {pagination.total} past bookings
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with UserLayout
const PastBookingsPage = () => (
  <UserLayout>
    <PastBookings />
  </UserLayout>
);

export default PastBookingsPage;
