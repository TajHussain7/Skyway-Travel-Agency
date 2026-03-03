import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const ManageFlights = () => {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    airline: "",
    route: "",
  });
  const [stats, setStats] = useState({
    totalFlights: 0,
    activeFlights: 0,
    totalRoutes: 0,
    delayedFlights: 0,
  });
  const [priceData, setPriceData] = useState({
    byAirline: {},
    byRoute: {},
    priceRange: { min: 0, max: 0, avg: 0 },
  });
  const [deleteFlightId, setDeleteFlightId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadFlights();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, flights]);

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
      const response = await axios.get("/api/admin/flights?limit=100", {
        withCredentials: true,
      });
      const flightsData =
        response.data.data?.flights ||
        response.data.flights ||
        response.data.data ||
        [];
      setFlights(flightsData);
      setFilteredFlights(flightsData);
      updateFlightStats(flightsData);
    } catch (error) {
      console.error("Error loading flights:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFlightStats = (flightsData) => {
    const total = flightsData.length;
    const today = new Date().toDateString();
    const activeToday = flightsData.filter(
      (flight) => new Date(flight.departureTime).toDateString() === today,
    ).length;
    const routes = new Set(
      flightsData.map((flight) => `${flight.origin}-${flight.destination}`),
    ).size;
    const delayed = flightsData.filter(
      (flight) => flight.status === "delayed",
    ).length;

    setStats({
      totalFlights: total,
      activeFlights: activeToday,
      totalRoutes: routes,
      delayedFlights: delayed,
    });

    // Calculate price analytics
    if (flightsData.length > 0) {
      // Price by Airline
      const airlinePrices = {};
      flightsData.forEach((flight) => {
        if (!airlinePrices[flight.airline]) {
          airlinePrices[flight.airline] = [];
        }
        airlinePrices[flight.airline].push(flight.price);
      });

      const byAirline = {};
      Object.keys(airlinePrices).forEach((airline) => {
        const prices = airlinePrices[airline];
        byAirline[airline] = {
          avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          min: Math.min(...prices),
          max: Math.max(...prices),
          count: prices.length,
        };
      });

      // Price by Route
      const routePrices = {};
      flightsData.forEach((flight) => {
        const route = `${flight.origin} → ${flight.destination}`;
        if (!routePrices[route]) {
          routePrices[route] = [];
        }
        routePrices[route].push(flight.price);
      });

      const byRoute = {};
      Object.keys(routePrices)
        .slice(0, 6)
        .forEach((route) => {
          const prices = routePrices[route];
          byRoute[route] = {
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            min: Math.min(...prices),
            max: Math.max(...prices),
            count: prices.length,
          };
        });

      // Overall price range
      const allPrices = flightsData.map((f) => f.price);
      const priceRange = {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices),
        avg: Math.round(
          allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
        ),
      };

      setPriceData({ byAirline, byRoute, priceRange });
    }
  };

  const applyFilters = () => {
    let filtered = [...flights];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (flight) =>
          flight.number?.toLowerCase().includes(searchTerm) ||
          flight.origin?.toLowerCase().includes(searchTerm) ||
          flight.destination?.toLowerCase().includes(searchTerm) ||
          flight.airline?.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.status) {
      filtered = filtered.filter((flight) => flight.status === filters.status);
    }

    if (filters.airline) {
      filtered = filtered.filter(
        (flight) => flight.airline === filters.airline,
      );
    }

    if (filters.route) {
      filtered = filtered.filter(
        (flight) =>
          `${flight.origin} → ${flight.destination}` === filters.route,
      );
    }

    setFilteredFlights(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "", airline: "", route: "" });
  };

  const showDeleteFlightModal = (flightId) => {
    setDeleteFlightId(flightId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteFlightId(null);
    setShowDeleteModal(false);
  };

  const openViewDetailsModal = (flight) => {
    setSelectedFlight(flight);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedFlight(null);
    setShowDetailsModal(false);
  };

  const openEditModal = (flight) => {
    setSelectedFlight(flight);
    setEditFormData({
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
      class: flight.class || "economy",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedFlight(null);
    setEditFormData({});
    setShowEditModal(false);
  };

  const handleEditFormChange = (field, value) => {
    // If totalSeats is being changed, adjust availableSeats proportionally
    if (field === "totalSeats") {
      const oldTotalSeats = selectedFlight.totalSeats;
      const oldAvailableSeats = selectedFlight.availableSeats || oldTotalSeats;
      const bookedSeats = oldTotalSeats - oldAvailableSeats;
      const newTotalSeats = parseInt(value) || 0;
      const newAvailableSeats = Math.max(0, newTotalSeats - bookedSeats);

      setEditFormData({
        ...editFormData,
        [field]: value,
        availableSeats: newAvailableSeats,
      });
    } else {
      setEditFormData({ ...editFormData, [field]: value });
    }
  };

  const handleUpdateFlight = async () => {
    if (!selectedFlight) return;

    try {
      await axios.put(
        `/api/admin/flights/${selectedFlight._id}`,
        editFormData,
        { withCredentials: true },
      );

      // Reload flights after update
      await loadFlights();
      closeEditModal();
    } catch (error) {
      console.error("Error updating flight:", error);
      alert(error.response?.data?.message || "Failed to update flight");
    }
  };

  const confirmDeleteFlight = async () => {
    if (!deleteFlightId) return;

    try {
      const response = await axios.delete(
        `/api/admin/flights/${deleteFlightId}`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        alert("Flight deleted successfully!");
        closeDeleteModal();
        loadFlights();
      }
    } catch (error) {
      console.error("Error deleting flight:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete flight. Please try again.";
      alert(errorMessage);
      closeDeleteModal();
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr };
  };

  const uniqueRoutes = [
    ...new Set(flights.map((f) => `${f.origin} → ${f.destination}`)),
  ];

  // Chart configurations
  const airlinePriceChartData = {
    labels: Object.keys(priceData.byAirline),
    datasets: [
      {
        label: "Average Price ($)",
        data: Object.values(priceData.byAirline).map((d) => d.avg),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)",
          "rgba(79, 172, 254, 0.8)",
          "rgba(0, 242, 254, 0.8)",
        ],
        borderColor: [
          "rgba(102, 126, 234, 1)",
          "rgba(118, 75, 162, 1)",
          "rgba(79, 172, 254, 1)",
          "rgba(0, 242, 254, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const routePriceChartData = {
    labels: Object.keys(priceData.byRoute),
    datasets: [
      {
        label: "Min Price",
        data: Object.values(priceData.byRoute).map((d) => d.min),
        backgroundColor: "rgba(40, 167, 69, 0.7)",
        borderColor: "rgba(40, 167, 69, 1)",
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: "Avg Price",
        data: Object.values(priceData.byRoute).map((d) => d.avg),
        backgroundColor: "rgba(102, 126, 234, 0.7)",
        borderColor: "rgba(102, 126, 234, 1)",
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: "Max Price",
        data: Object.values(priceData.byRoute).map((d) => d.max),
        backgroundColor: "rgba(220, 53, 69, 0.7)",
        borderColor: "rgba(220, 53, 69, 1)",
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const flightDistributionData = {
    labels: Object.keys(priceData.byAirline),
    datasets: [
      {
        label: "Flights per Airline",
        data: Object.values(priceData.byAirline).map((d) => d.count),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)",
          "rgba(79, 172, 254, 0.8)",
          "rgba(0, 242, 254, 0.8)",
          "rgba(40, 167, 69, 0.8)",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12, weight: "500" },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(33, 37, 41, 0.95)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return ` ${context.dataset.label}: $${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          callback: function (value) {
            return "$" + value;
          },
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { size: 12, weight: "500" },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(33, 37, 41, 0.95)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-600">Loading flights...</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <i className="fas fa-plane"></i>
                Flight Management
              </h1>
              <p className="text-purple-100 mt-1">
                Manage all flight schedules and routes
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/add-flight"
                className="bg-white text-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-md"
              >
                <i className="fas fa-plus"></i>
                Add New Flight
              </Link>
              <button
                className="bg-white text-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-md"
                onClick={loadFlights}
              >
                <i className="fas fa-sync"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Flights
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalFlights}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="fas fa-plane text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Active Today
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.activeFlights}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Routes
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalRoutes}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="fas fa-route text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Delayed Flights
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.delayedFlights}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="fas fa-exclamation-triangle text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Analytics Section */}
        {flights.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Price Summary Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <i className="fas fa-dollar-sign"></i> Price Overview
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      <i className="fas fa-arrow-down text-green-500 me-2"></i>
                      Lowest Price
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ${priceData.priceRange.min}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      <i className="fas fa-chart-line text-blue-500 me-2"></i>
                      Average Price
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${priceData.priceRange.avg}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      <i className="fas fa-arrow-up text-red-500 me-2"></i>
                      Highest Price
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ${priceData.priceRange.max}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Airline Price Comparison Chart */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <i className="fas fa-chart-bar text-primary"></i>
                  Average Price by Airline
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64">
                  {Object.keys(priceData.byAirline).length > 0 ? (
                    <Bar data={airlinePriceChartData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Flight Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <i className="fas fa-pie-chart text-primary"></i>
                  Flights Distribution
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64">
                  {Object.keys(priceData.byAirline).length > 0 ? (
                    <Doughnut
                      data={flightDistributionData}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Price Comparison Chart - Full Width */}
        {flights.length > 0 && Object.keys(priceData.byRoute).length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-route text-primary"></i>
                Price Comparison by Route (Min / Avg / Max)
              </h3>
            </div>
            <div className="p-6">
              <div className="h-80">
                <Bar data={routePriceChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <i className="fas fa-filter"></i> Flight List & Filters
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="searchFlights"
                >
                  <i className="fas fa-search me-2 text-primary"></i>Search
                  Flights
                </label>
                <input
                  type="text"
                  id="searchFlights"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Search by flight number, route, or airline..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="statusFilter"
                >
                  <i className="fas fa-toggle-on me-2 text-primary"></i>Status
                </label>
                <select
                  id="statusFilter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="delayed">Delayed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="airlineFilter"
                >
                  <i className="fas fa-plane me-2 text-primary"></i>Airline
                </label>
                <select
                  id="airlineFilter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={filters.airline}
                  onChange={(e) =>
                    handleFilterChange("airline", e.target.value)
                  }
                >
                  <option value="">All Airlines</option>
                  <option value="SkyWay Airways">SkyWay Airways</option>
                  <option value="Emirates">Emirates</option>
                  <option value="Qatar Airways">Qatar Airways</option>
                  <option value="Turkish Airlines">Turkish Airlines</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="routeFilter"
                >
                  <i className="fas fa-route me-2 text-primary"></i>Route
                </label>
                <select
                  id="routeFilter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={filters.route}
                  onChange={(e) => handleFilterChange("route", e.target.value)}
                >
                  <option value="">All Routes</option>
                  {uniqueRoutes.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                onClick={clearFilters}
              >
                <i className="fas fa-times"></i> Clear Filters
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                onClick={loadFlights}
              >
                <i className="fas fa-sync"></i> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Flights Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <i className="fas fa-list text-primary"></i> Flights Overview
            </h3>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Showing {filteredFlights.length} flight
              {filteredFlights.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Flight Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlights.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-plane text-gray-400 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          No flights found
                        </h3>
                        <p className="text-gray-600">
                          Try adjusting your filters or add a new flight
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFlights.map((flight) => {
                    const departure = formatDateTime(flight.departureTime);
                    const arrival = formatDateTime(flight.arrivalTime);

                    return (
                      <tr
                        key={flight._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {flight.number}
                            </div>
                            <div className="text-sm text-gray-600">
                              {flight.airline}
                            </div>
                            {flight.aircraft && (
                              <div className="text-xs text-gray-500 mt-1">
                                {flight.aircraft}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {flight.origin}
                            </span>
                            <i className="fas fa-arrow-right text-primary text-sm"></i>
                            <span className="font-medium text-gray-800">
                              {flight.destination}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <i className="fas fa-plane-departure text-green-500"></i>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {departure.dateStr}
                                </div>
                                <div className="text-gray-600 text-xs">
                                  {departure.timeStr}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <i className="fas fa-plane-arrival text-blue-500"></i>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {arrival.dateStr}
                                </div>
                                <div className="text-gray-600 text-xs">
                                  {arrival.timeStr}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {flight.availableSeats || flight.totalSeats}/
                              {flight.totalSeats} seats
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                (flight.availableSeats || flight.totalSeats) > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {(flight.availableSeats || flight.totalSeats) > 0
                                ? "Available"
                                : "Full"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-primary">
                            ${flight.price}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              flight.status === "active"
                                ? "bg-green-100 text-green-700"
                                : flight.status === "delayed"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : flight.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {flight.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              onClick={() => openEditModal(flight)}
                              title="Edit Flight"
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              onClick={() => showDeleteFlightModal(flight._id)}
                              title="Delete Flight"
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              onClick={() => openViewDetailsModal(flight)}
                              title="View Details"
                            >
                              <i className="fas fa-info-circle text-sm"></i>
                            </button>
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  Confirm Delete
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <i className="fas fa-trash text-red-500 text-xl"></i>
                  </div>
                  <p className="text-gray-600">
                    Are you sure you want to delete this flight? This action
                    cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                    onClick={closeDeleteModal}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
                    onClick={confirmDeleteFlight}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Flight
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailsModal && selectedFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-bold">
                  <i className="fas fa-plane mr-3"></i>
                  Flight Details
                </h3>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  onClick={closeDetailsModal}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Flight Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase ${
                      selectedFlight.status === "active"
                        ? "bg-green-100 text-green-700"
                        : selectedFlight.status === "delayed"
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedFlight.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedFlight.status}
                  </span>
                </div>

                {/* Flight Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="text-sm text-gray-600 font-semibold">
                      Flight Number
                    </label>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedFlight.number}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <label className="text-sm text-gray-600 font-semibold">
                      Airline
                    </label>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedFlight.airline}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <label className="text-sm text-gray-600 font-semibold">
                      Origin
                    </label>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedFlight.origin}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <label className="text-sm text-gray-600 font-semibold">
                      Destination
                    </label>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedFlight.destination}
                    </p>
                  </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-plane-departure text-green-600 text-xl"></i>
                      <label className="text-sm text-gray-600 font-semibold">
                        Departure
                      </label>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedFlight.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-plane-arrival text-blue-600 text-xl"></i>
                      <label className="text-sm text-gray-600 font-semibold">
                        Arrival
                      </label>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedFlight.arrivalTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-600 font-semibold block mb-1">
                      Price
                    </label>
                    <p className="text-2xl font-bold text-primary">
                      ${selectedFlight.price}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-600 font-semibold block mb-1">
                      Total Seats
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedFlight.totalSeats}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-600 font-semibold block mb-1">
                      Available
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedFlight.availableSeats ||
                        selectedFlight.totalSeats}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-600 font-semibold block mb-1">
                      Class
                    </label>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {selectedFlight.class || "Economy"}
                    </p>
                  </div>
                </div>

                {selectedFlight.aircraft && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <label className="text-sm text-gray-600 font-semibold">
                      Aircraft
                    </label>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedFlight.aircraft}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={closeDetailsModal}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Close
                  </button>
                  <button
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={() => {
                      closeDetailsModal();
                      openEditModal(selectedFlight);
                    }}
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Flight
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Flight Modal */}
        {showEditModal && selectedFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-bold">
                  <i className="fas fa-edit mr-3"></i>
                  Edit Flight
                </h3>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  onClick={closeEditModal}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Flight Number *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={editFormData.number || ""}
                      onChange={(e) =>
                        handleEditFormChange("number", e.target.value)
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
                      value={editFormData.airline || ""}
                      onChange={(e) =>
                        handleEditFormChange("airline", e.target.value)
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
                      value={editFormData.origin || ""}
                      onChange={(e) =>
                        handleEditFormChange("origin", e.target.value)
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
                      value={editFormData.destination || ""}
                      onChange={(e) =>
                        handleEditFormChange("destination", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={editFormData.departureTime || ""}
                      onChange={(e) =>
                        handleEditFormChange("departureTime", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Arrival Time *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={editFormData.arrivalTime || ""}
                      onChange={(e) =>
                        handleEditFormChange("arrivalTime", e.target.value)
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
                      value={editFormData.price || ""}
                      onChange={(e) =>
                        handleEditFormChange(
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
                      value={editFormData.totalSeats || ""}
                      onChange={(e) =>
                        handleEditFormChange(
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
                      value={editFormData.availableSeats || ""}
                      onChange={(e) =>
                        handleEditFormChange(
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
                      value={editFormData.status || ""}
                      onChange={(e) =>
                        handleEditFormChange("status", e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={editFormData.class || ""}
                      onChange={(e) =>
                        handleEditFormChange("class", e.target.value)
                      }
                    >
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Aircraft
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={editFormData.aircraft || ""}
                      onChange={(e) =>
                        handleEditFormChange("aircraft", e.target.value)
                      }
                      placeholder="e.g., Boeing 777"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={closeEditModal}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  <button
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={handleUpdateFlight}
                  >
                    <i className="fas fa-save mr-2"></i>
                    Update Flight
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageFlights;
