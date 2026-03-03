import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const Umrah = () => {
  const [filter, setFilter] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/umrah/packages");

      if (response.data.success) {
        setPackages(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading packages:", error);
      // Fallback to empty array if API fails
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(filter.toLowerCase()) ||
      pkg.city.toLowerCase().includes(filter.toLowerCase()) ||
      pkg.plane.toLowerCase().includes(filter.toLowerCase()),
  );

  const openModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedPackage(null), 300);
  };

  if (loading) {
    return (
      <>
        <Header />
        <section className="section bg-gray-50">
          <div className="container">
            <div
              className="flex items-center justify-center"
              style={{ minHeight: "400px" }}
            >
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
                <p className="text-xl text-gray-600">Loading packages...</p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  // Calculate statistics
  const stats = {
    totalPackages: packages.length,
    avgPrice: Math.round(
      packages.reduce((sum, p) => sum + p.price, 0) / packages.length,
    ),
    totalAvailability: packages.reduce((sum, p) => sum + p.availability, 0),
    avgRating: (
      packages.reduce((sum, p) => sum + p.rating, 0) / packages.length
    ).toFixed(1),
  };

  // Professional color palette - consistent across all charts
  const chartColors = {
    primary: "rgba(102, 126, 234, 1)",
    primaryLight: "rgba(102, 126, 234, 0.15)",
    secondary: "rgba(118, 75, 162, 1)",
    success: "rgba(16, 185, 129, 1)",
    warning: "rgba(245, 158, 11, 1)",
    danger: "rgba(239, 68, 68, 1)",
    info: "rgba(59, 130, 246, 1)",
    purple: "rgba(139, 92, 246, 1)",
    teal: "rgba(20, 184, 166, 1)",
  };

  // Gradient backgrounds for bar chart
  const createGradient = (ctx, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  // Chart data
  const priceChartData = {
    labels: packages.map((p) =>
      p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
    ),
    datasets: [
      {
        label: "Package Price",
        data: packages.map((p) => p.price),
        backgroundColor: [
          "rgba(102, 126, 234, 0.85)",
          "rgba(139, 92, 246, 0.85)",
          "rgba(59, 130, 246, 0.85)",
          "rgba(20, 184, 166, 0.85)",
          "rgba(16, 185, 129, 0.85)",
          "rgba(245, 158, 11, 0.85)",
          "rgba(239, 68, 68, 0.85)",
        ],
        borderColor: [
          chartColors.primary,
          chartColors.purple,
          chartColors.info,
          chartColors.teal,
          chartColors.success,
          chartColors.warning,
          chartColors.danger,
        ],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        hoverBackgroundColor: [
          "rgba(102, 126, 234, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(20, 184, 166, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const classDistributionData = {
    labels: ["Economy", "Business", "First Class"],
    datasets: [
      {
        data: [
          packages.filter((p) => p.plane === "Economy").length,
          packages.filter((p) => p.plane === "Business").length,
          packages.filter((p) => p.plane === "First Class").length,
        ],
        backgroundColor: [
          "rgba(102, 126, 234, 0.9)",
          "rgba(245, 158, 11, 0.9)",
          "rgba(139, 92, 246, 0.9)",
        ],
        hoverBackgroundColor: [
          chartColors.primary,
          chartColors.warning,
          chartColors.purple,
        ],
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverBorderWidth: 5,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
      delay: (context) => context.dataIndex * 100,
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          font: {
            size: 12,
            weight: "600",
            family: "'Inter', 'Segoe UI', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "rectRounded",
          color: "#374151",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleFont: {
          size: 14,
          weight: "bold",
          family: "'Inter', 'Segoe UI', sans-serif",
        },
        titleColor: "#ffffff",
        bodyFont: {
          size: 13,
          family: "'Inter', 'Segoe UI', sans-serif",
        },
        bodyColor: "#e5e7eb",
        padding: 16,
        cornerRadius: 12,
        boxPadding: 8,
        displayColors: true,
        usePointStyle: true,
        borderColor: "rgba(102, 126, 234, 0.3)",
        borderWidth: 1,
        callbacks: {
          title: function (context) {
            return `📦 ${
              packages[context[0].dataIndex]?.name || context[0].label
            }`;
          },
          label: function (context) {
            return `  💰 Price: $${context.raw.toLocaleString()}`;
          },
          afterLabel: function (context) {
            const pkg = packages[context.dataIndex];
            if (pkg) {
              return `  ✈️ ${pkg.plane} Class`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
          font: {
            size: 11,
            weight: "500",
            family: "'Inter', 'Segoe UI', sans-serif",
          },
          color: "#6b7280",
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: "500",
            family: "'Inter', 'Segoe UI', sans-serif",
          },
          color: "#6b7280",
          padding: 8,
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          font: {
            size: 13,
            weight: "600",
            family: "'Inter', 'Segoe UI', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#374151",
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                  pointStyle: "circle",
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleFont: {
          size: 14,
          weight: "bold",
          family: "'Inter', 'Segoe UI', sans-serif",
        },
        titleColor: "#ffffff",
        bodyFont: {
          size: 13,
          family: "'Inter', 'Segoe UI', sans-serif",
        },
        bodyColor: "#e5e7eb",
        padding: 16,
        cornerRadius: 12,
        boxPadding: 8,
        displayColors: true,
        borderColor: "rgba(102, 126, 234, 0.3)",
        borderWidth: 1,
        callbacks: {
          title: function (context) {
            return `✈️ ${context[0].label}`;
          },
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((context.raw / total) * 100) : 0;
            return [
              `  📊 Count: ${context.raw} package${
                context.raw !== 1 ? "s" : ""
              }`,
              `  📈 Share: ${percentage}%`,
            ];
          },
        },
      },
    },
  };

  return (
    <>
      <Header />
      <section className="section bg-gray-50">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              <i className="fas fa-kaaba text-primary me-3"></i>Umrah Packages
            </h1>
            <p className="text-lg text-gray-600">
              Choose from our carefully curated Umrah packages designed to
              provide you with a seamless and spiritually fulfilling journey.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Packages */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Packages
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalPackages}
                  </p>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-full p-3">
                  <i className="fas fa-box text-2xl text-primary"></i>
                </div>
              </div>
            </div>

            {/* Average Price */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Average Price
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.avgPrice}
                  </p>
                </div>
                <div className="bg-success bg-opacity-10 rounded-full p-3">
                  <i className="fas fa-dollar-sign text-2xl text-success"></i>
                </div>
              </div>
            </div>

            {/* Available Seats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-info">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Available Seats
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalAvailability}
                  </p>
                </div>
                <div className="bg-info bg-opacity-10 rounded-full p-3">
                  <i className="fas fa-chair text-2xl text-info"></i>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Avg Rating
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.avgRating}
                    </p>
                    <div className="text-warning">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${
                              i < Math.floor(stats.avgRating)
                                ? "text-warning"
                                : "text-gray-300"
                            }`}
                          ></i>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-full p-3">
                  <i className="fas fa-star text-2xl text-warning"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Price Comparison Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="bg-primary bg-opacity-10 rounded-lg p-2">
                      <i className="fas fa-chart-bar text-primary"></i>
                    </div>
                    Price Comparison
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Compare prices across all packages
                  </p>
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-semibold text-gray-600">
                    {packages.length} Packages
                  </span>
                </div>
              </div>
              <div style={{ height: "320px" }}>
                <Bar data={priceChartData} options={chartOptions} />
              </div>
            </div>

            {/* Flight Class Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="bg-primary bg-opacity-10 rounded-lg p-2">
                    <i className="fas fa-plane-departure text-primary"></i>
                  </div>
                  Flight Classes
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Distribution by class type
                </p>
              </div>
              <div style={{ height: "280px" }} className="relative">
                <Doughnut
                  data={classDistributionData}
                  options={doughnutOptions}
                />
                {/* Center Label */}
                <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-3xl font-bold text-gray-900">
                    {packages.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-filter text-primary text-xl"></i>
              <h3 className="text-xl font-bold text-gray-900">
                Search & Filter
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-search text-gray-400 me-2"></i>Search
                  Package
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, city, or class..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              All Packages ({filteredPackages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Package Header with Gradient */}
                  <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
                    <h4 className="text-lg font-bold mb-2">{pkg.name}</h4>
                    <p className="text-sm text-gray-100">{pkg.description}</p>
                  </div>

                  {/* Package Body */}
                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-gray-500 text-sm mb-1">
                        Price per person
                      </p>
                      <p className="text-3xl font-bold text-success">
                        ${pkg.price}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fas fa-plane text-primary text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Flight Class</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.plane}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fas fa-hotel text-primary text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hotel</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.hotel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">City</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fas fa-calendar-days text-primary text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fas fa-star text-warning text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rating</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.rating} / 5.0
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fas fa-chairs text-primary text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Availability</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.availability} / {pkg.total_seats} seats
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <p className="text-xs text-gray-500 mb-3 font-semibold">
                        Amenities:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => openModal(pkg)}
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      <i className="fas fa-eye group-hover/btn:scale-110 transition-transform"></i>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPackages.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl text-gray-500">
                  No packages found matching your search.
                </p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-8 text-white text-center mb-8">
            <h3 className="text-2xl font-bold mb-3">Need More Information?</h3>
            <p className="mb-6 text-lg">
              Contact us for personalized package recommendations and special
              offers.
            </p>
            <a
              href="http://wa.me/+9234338002540"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i>Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Professional Modal Popup */}
      {showModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold">{selectedPackage.name}</h3>
                <p className="text-sm text-gray-100 mt-1">
                  Complete package details
                </p>
              </div>
              <button
                onClick={closeModal}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Price Section */}
              <div className="bg-success bg-opacity-10 border-l-4 border-success rounded-lg p-6 mb-8">
                <p className="text-gray-600 text-sm font-medium">
                  Package Price
                </p>
                <p className="text-4xl font-bold text-success mt-2">
                  ${selectedPackage.price}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Per person (all-inclusive)
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">
                    <i className="fas fa-plane text-primary me-2"></i>Flight
                    Class
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedPackage.plane}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">
                    <i className="fas fa-hotel text-primary me-2"></i>Hotel
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedPackage.hotel}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">
                    <i className="fas fa-map-marker-alt text-primary me-2"></i>
                    Destination
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedPackage.city}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">
                    <i className="fas fa-calendar-days text-primary me-2"></i>
                    Duration
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedPackage.duration}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">
                    <i className="fas fa-star text-warning me-2"></i>Rating
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedPackage.rating} / 5.0
                    <span className="text-warning text-lg ms-2">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${
                              i < Math.floor(selectedPackage.rating)
                                ? "text-warning"
                                : "text-gray-300"
                            }`}
                          ></i>
                        ))}
                    </span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">
                    <i className="fas fa-chairs text-primary me-2"></i>
                    Availability
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedPackage.availability} /{" "}
                    {selectedPackage.total_seats}
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                    <div
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full"
                      style={{
                        width: `${
                          (selectedPackage.availability /
                            selectedPackage.total_seats) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  <i className="fas fa-info-circle text-primary me-2"></i>About
                  This Package
                </h4>
                <p className="text-gray-700">{selectedPackage.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  <i className="fas fa-list-check text-primary me-2"></i>
                  Included Amenities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPackage.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <i className="fas fa-check-circle text-success text-lg"></i>
                      <span className="text-gray-900 font-medium">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  <i className="fas fa-times me-2"></i>Close
                </button>
                <a
                  href="http://wa.me/+9234338002540"
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp me-2"></i>Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default Umrah;
