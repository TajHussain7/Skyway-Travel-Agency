import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const ManageUmrah = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "umrah",
    description: "",
    price: "",
    duration: "",
    departureDate: "",
    plane: "",
    hotel: "",
    city: "",
    rating: "",
    totalSeats: "",
    availability: "",
    amenities: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const flightClassOptions = [
    { label: "Economy", value: "Economy" },
    { label: "Business", value: "Business" },
    { label: "First Class", value: "First Class" },
  ];

  const cityOptions = [
    { label: "Makkah", value: "Makkah" },
    { label: "Madinah", value: "Madinah" },
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const typeOptions = [
    { label: "Umrah", value: "umrah" },
    { label: "Hajj", value: "hajj" },
  ];

  useEffect(() => {
    checkAdminAuth();
    loadPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchFilter, packages]);

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

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/umrah", {
        withCredentials: true,
      });

      if (response.data.success) {
        setPackages(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!searchFilter) {
      setFilteredPackages(packages);
      return;
    }

    const filtered = packages.filter(
      (pkg) =>
        pkg.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pkg.city?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pkg.hotel?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pkg.plane?.toLowerCase().includes(searchFilter.toLowerCase())
    );
    setFilteredPackages(filtered);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      type: "umrah",
      description: "",
      price: "",
      duration: "",
      departureDate: "",
      plane: "",
      hotel: "",
      city: "",
      rating: "",
      totalSeats: "",
      availability: "",
      amenities: "",
      status: "active",
    });
    setFormErrors({});
    setFormMessage({ type: "", text: "" });
    setShowModal(true);
  };

  const openEditModal = (pkg) => {
    setIsEditMode(true);
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name || "",
      type: pkg.type || "umrah",
      description: pkg.description || "",
      price: pkg.price || "",
      duration: pkg.duration || "",
      departureDate: pkg.departure_date
        ? new Date(pkg.departure_date).toISOString().split("T")[0]
        : "",
      plane: pkg.plane || "",
      hotel: pkg.hotel || "",
      city: pkg.city || "",
      rating: pkg.rating || "",
      totalSeats: pkg.total_seats || "",
      availability: pkg.availability !== undefined ? pkg.availability : "",
      amenities: Array.isArray(pkg.amenities) ? pkg.amenities.join("\n") : "",
      status: pkg.status || "active",
    });
    setFormErrors({});
    setFormMessage({ type: "", text: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedPackage(null);
    setFormData({
      name: "",
      type: "umrah",
      description: "",
      price: "",
      duration: "",
      departureDate: "",
      plane: "",
      hotel: "",
      city: "",
      rating: "",
      totalSeats: "",
      availability: "",
      amenities: "",
      status: "active",
    });
    setFormErrors({});
    setFormMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Package name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      errors.price = "Valid price is required";
    if (!formData.duration.trim()) errors.duration = "Duration is required";
    if (!formData.departureDate)
      errors.departureDate = "Departure date is required";
    if (!formData.plane) errors.plane = "Flight class is required";
    if (!formData.hotel.trim()) errors.hotel = "Hotel is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.totalSeats || formData.totalSeats <= 0)
      errors.totalSeats = "Valid total seats is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormMessage({
        type: "error",
        text: "Please fill in all required fields correctly.",
      });
      return;
    }

    setFormMessage({ type: "", text: "" });

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        totalSeats: parseInt(formData.totalSeats),
        availability:
          formData.availability !== ""
            ? parseInt(formData.availability)
            : parseInt(formData.totalSeats),
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        amenities: formData.amenities.split("\n").filter((item) => item.trim()),
      };

      if (isEditMode && selectedPackage) {
        const response = await axios.put(
          `/api/admin/umrah/${selectedPackage._id}`,
          submitData,
          { withCredentials: true }
        );

        if (response.data.success) {
          setFormMessage({
            type: "success",
            text: "Package updated successfully!",
          });
          setTimeout(() => {
            loadPackages();
            closeModal();
          }, 1500);
        }
      } else {
        const response = await axios.post("/api/admin/umrah", submitData, {
          withCredentials: true,
        });

        if (response.data.success) {
          setFormMessage({
            type: "success",
            text: "Package created successfully!",
          });
          setTimeout(() => {
            loadPackages();
            closeModal();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error saving package:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save package. Please check all fields.";
      setFormMessage({ type: "error", text: errorMessage });
    }
  };

  const handleDelete = async (packageId) => {
    if (!confirm("Are you sure you want to delete this package?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/umrah/${packageId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        loadPackages();
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete package";
      // You can add a toast notification here if needed
      alert(errorMessage);
    }
  };

  const handleViewPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setSelectedPackage(null);
    setShowViewModal(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading packages...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
          padding: 0.4rem 1rem !important;
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

      <AdminLayout>
        <div className="p-8">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg px-8 py-6 shadow-lg mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <i className="fas fa-kaaba"></i>
                  Umrah & Hajj Management
                </h1>
                <p className="text-purple-100 mt-1">
                  Manage Umrah and Hajj packages
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="bg-white text-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-md"
              >
                <i className="fas fa-plus"></i>
                Add New Package
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-search text-primary text-xl"></i>
              <h3 className="text-xl font-bold text-gray-900">
                Search Packages
              </h3>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, city, hotel, or flight class..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {filteredPackages.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  All Packages ({filteredPackages.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white rounded-t-lg">
                      <h4 className="text-lg font-bold">{pkg.name}</h4>
                      <p className="text-sm">{pkg.type}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-3xl font-bold text-success mb-4">
                        ${pkg.price}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div>
                          <i className="fas fa-plane text-primary me-2"></i>
                          {pkg.plane}
                        </div>
                        <div>
                          <i className="fas fa-hotel text-primary me-2"></i>
                          {pkg.hotel}
                        </div>
                        <div>
                          <i className="fas fa-map-marker-alt text-primary me-2"></i>
                          {pkg.city}
                        </div>
                        <div>
                          <i className="fas fa-calendar text-primary me-2"></i>
                          {pkg.duration}
                        </div>
                        <div>
                          <i className="fas fa-chair text-primary me-2"></i>
                          {pkg.availability} / {pkg.total_seats} seats
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPackage(pkg)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg"
                        >
                          <i className="fas fa-eye me-2"></i>View
                        </button>
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg"
                        >
                          <i className="fas fa-edit me-2"></i>Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="flex-1 bg-danger hover:bg-red-700 text-white py-2 rounded-lg"
                        >
                          <i className="fas fa-trash me-2"></i>Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <i className="fas fa-kaaba text-6xl text-purple-600 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">No Packages Found</h3>
              <p className="text-gray-600 mb-6">
                {searchFilter
                  ? "No packages match your search."
                  : "Create your first Umrah package."}
              </p>
              {!searchFilter && (
                <button
                  onClick={openAddModal}
                  className="bg-primary text-white px-6 py-3 rounded-lg"
                >
                  <i className="fas fa-plus me-2"></i>Create Package
                </button>
              )}
            </div>
          )}
        </div>
      </AdminLayout>

      {/* Add/Edit Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-lg sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  <i className="fas fa-kaaba me-2"></i>
                  {isEditMode ? "Edit Package" : "Add New Package"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Form Message */}
              {formMessage.text && (
                <div
                  className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                    formMessage.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <i
                    className={`fas ${
                      formMessage.type === "success"
                        ? "fa-check-circle text-green-600"
                        : "fa-exclamation-circle text-red-600"
                    } text-xl`}
                  ></i>
                  <p className="font-medium">{formMessage.text}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Package Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Premium Umrah Package"
                  />
                  {formErrors.name && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type *
                  </label>
                  <Dropdown
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.value })
                    }
                    options={typeOptions}
                    placeholder="Select type"
                    className="w-full"
                  />
                  {formErrors.type && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.type}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="e.g., 2500"
                    min="0"
                  />
                  {formErrors.price && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 15 Days"
                  />
                  {formErrors.duration && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.duration}
                    </p>
                  )}
                </div>

                {/* Departure Date */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Departure Date *
                  </label>
                  <Calendar
                    value={
                      formData.departureDate
                        ? new Date(formData.departureDate)
                        : null
                    }
                    onChange={(e) => {
                      const formattedDate = e.value
                        ? e.value.toISOString().split("T")[0]
                        : "";
                      setFormData({
                        ...formData,
                        departureDate: formattedDate,
                      });
                    }}
                    showIcon
                    dateFormat="yy-mm-dd"
                    placeholder="Select departure date"
                    minDate={new Date()}
                    className="w-full"
                  />
                  {formErrors.departureDate && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.departureDate}
                    </p>
                  )}
                </div>

                {/* Flight Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Class *
                  </label>
                  <Dropdown
                    value={formData.plane}
                    onChange={(e) =>
                      setFormData({ ...formData, plane: e.value })
                    }
                    options={flightClassOptions}
                    placeholder="Select flight class"
                    className="w-full"
                  />
                  {formErrors.plane && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.plane}
                    </p>
                  )}
                </div>

                {/* Hotel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.hotel}
                    onChange={(e) =>
                      setFormData({ ...formData, hotel: e.target.value })
                    }
                    placeholder="e.g., Hilton Makkah"
                  />
                  {formErrors.hotel && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.hotel}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Dropdown
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.value })
                    }
                    options={cityOptions}
                    placeholder="Select city"
                    className="w-full"
                  />
                  {formErrors.city && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="e.g., 4.5"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                  {formErrors.rating && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.rating}
                    </p>
                  )}
                </div>

                {/* Total Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.totalSeats}
                    onChange={(e) =>
                      setFormData({ ...formData, totalSeats: e.target.value })
                    }
                    placeholder="e.g., 50"
                    min="1"
                  />
                  {formErrors.totalSeats && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.totalSeats}
                    </p>
                  )}
                </div>

                {/* Available Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.value })
                    }
                    placeholder="Leave empty to match total seats"
                    min="0"
                  />
                  {formErrors.availability && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.availability}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <Dropdown
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.value })
                    }
                    options={statusOptions}
                    placeholder="Select status"
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter package description..."
                    rows="3"
                  ></textarea>
                  {formErrors.description && (
                    <p className="text-danger text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Amenities */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities (one per line)
                  </label>
                  <textarea
                    className="form-control"
                    value={formData.amenities}
                    onChange={(e) =>
                      setFormData({ ...formData, amenities: e.target.value })
                    }
                    placeholder="5-star hotel&#10;Daily meals&#10;Guided tours&#10;Airport transfers"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  {isEditMode ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Package Modal */}
      {showViewModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-lg sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  <i className="fas fa-kaaba me-2"></i>
                  {selectedPackage.name}
                </h2>
                <button
                  onClick={closeViewModal}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-semibold capitalize">
                    {selectedPackage.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="font-semibold text-success text-2xl">
                    ${selectedPackage.price}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold">{selectedPackage.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Departure Date</p>
                  <p className="font-semibold">
                    {new Date(
                      selectedPackage.departure_date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Flight Class</p>
                  <p className="font-semibold">{selectedPackage.plane}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hotel</p>
                  <p className="font-semibold">{selectedPackage.hotel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">City</p>
                  <p className="font-semibold">{selectedPackage.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <p className="font-semibold">
                    {selectedPackage.rating}{" "}
                    <i className="fas fa-star text-yellow-500"></i>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Available / Total Seats
                  </p>
                  <p className="font-semibold">
                    {selectedPackage.availability} /{" "}
                    {selectedPackage.total_seats}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-semibold capitalize">
                    {selectedPackage.status}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-800">{selectedPackage.description}</p>
              </div>

              {selectedPackage.amenities &&
                selectedPackage.amenities.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Amenities</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedPackage.amenities.map((amenity, index) => (
                        <li key={index} className="text-gray-800">
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeViewModal}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    openEditModal(selectedPackage);
                  }}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-edit"></i>
                  Edit Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageUmrah;
