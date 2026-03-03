import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const AddFlight = () => {
  const [formData, setFormData] = useState({
    number: "",
    airline: "",
    aircraft: "",
    totalSeats: "",
    origin: "",
    destination: "",
    duration: "",
    distance: "",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    price: "",
    businessPrice: "",
    firstClassPrice: "",
    currency: "USD",
    status: "scheduled",
    gate: "",
    amenities: [],
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    setMinDates();
  }, []);

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

  const setMinDates = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      departureDate: prev.departureDate || today,
      arrivalDate: prev.arrivalDate || today,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "amenities") {
        setFormData((prev) => ({
          ...prev,
          amenities: checked
            ? [...prev.amenities, value]
            : prev.amenities.filter((a) => a !== value),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-calculate arrival time
    if (
      name === "departureTime" ||
      name === "departureDate" ||
      name === "duration"
    ) {
      calculateArrivalTime();
    }
  };

  const calculateArrivalTime = () => {
    if (formData.departureDate && formData.departureTime && formData.duration) {
      const departure = new Date(
        `${formData.departureDate}T${formData.departureTime}`
      );
      const durationHours = parseFloat(formData.duration);
      if (!isNaN(durationHours)) {
        const arrival = new Date(
          departure.getTime() + durationHours * 60 * 60 * 1000
        );
        setFormData((prev) => ({
          ...prev,
          arrivalDate: arrival.toISOString().split("T")[0],
          arrivalTime: arrival.toTimeString().slice(0, 5),
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number) newErrors.number = "Flight number is required";
    if (!formData.airline) newErrors.airline = "Airline is required";
    if (!formData.totalSeats) newErrors.totalSeats = "Capacity is required";
    if (!formData.origin) newErrors.origin = "Departure city is required";
    if (!formData.destination)
      newErrors.destination = "Destination city is required";
    if (formData.origin === formData.destination) {
      newErrors.destination =
        "Destination must be different from departure city";
    }
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.departureDate)
      newErrors.departureDate = "Departure date is required";
    if (!formData.departureTime)
      newErrors.departureTime = "Departure time is required";
    if (!formData.arrivalDate)
      newErrors.arrivalDate = "Arrival date is required";
    if (!formData.arrivalTime)
      newErrors.arrivalTime = "Arrival time is required";
    if (!formData.price) newErrors.price = "Price is required";

    // Validate dates
    if (
      formData.departureDate &&
      formData.departureTime &&
      formData.arrivalDate &&
      formData.arrivalTime
    ) {
      const departure = new Date(
        `${formData.departureDate}T${formData.departureTime}`
      );
      const arrival = new Date(
        `${formData.arrivalDate}T${formData.arrivalTime}`
      );
      if (arrival <= departure) {
        newErrors.arrivalTime = "Arrival time must be after departure time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare flight data
      const flightData = {
        number: formData.number,
        airline: formData.airline,
        aircraft: formData.aircraft || undefined,
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: parseInt(formData.totalSeats),
        origin: formData.origin,
        destination: formData.destination,
        duration: formData.duration ? parseFloat(formData.duration) : undefined,
        distance: formData.distance ? parseInt(formData.distance) : undefined,
        departureTime: new Date(
          `${formData.departureDate}T${formData.departureTime}`
        ).toISOString(),
        arrivalTime: new Date(
          `${formData.arrivalDate}T${formData.arrivalTime}`
        ).toISOString(),
        price: parseFloat(formData.price),
        businessPrice: formData.businessPrice
          ? parseFloat(formData.businessPrice)
          : undefined,
        firstClassPrice: formData.firstClassPrice
          ? parseFloat(formData.firstClassPrice)
          : undefined,
        currency: formData.currency,
        status: formData.status,
        gate: formData.gate || undefined,
        amenities:
          formData.amenities.length > 0 ? formData.amenities : undefined,
        description: formData.description || undefined,
      };

      const response = await axios.post("/api/admin/flights", flightData, {
        withCredentials: true,
      });

      if (response.data.success) {
        navigate("/admin/flights");
      }
    } catch (error) {
      console.error("Error adding flight:", error);
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to add flight. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the form? All entered data will be lost."
      )
    ) {
      setFormData({
        number: "",
        airline: "",
        aircraft: "",
        totalSeats: "",
        origin: "",
        destination: "",
        duration: "",
        distance: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        price: "",
        businessPrice: "",
        firstClassPrice: "",
        currency: "USD",
        status: "scheduled",
        gate: "",
        amenities: [],
        description: "",
      });
      setErrors({});
      setMinDates();
    }
  };

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Peshawar",
    "Quetta",
    "Faisalabad",
    "Multan",
    "Dubai",
    "Riyadh",
    "Jeddah",
    "Istanbul",
    "London",
    "New York",
    "Toronto",
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <i className="fas fa-plus-circle me-3"></i>Add New Flight
              </h1>
              <p className="text-gray-100 text-lg">
                Create a new flight in the system and make it available for
                booking
              </p>
            </div>
            <Link
              to="/admin/flights"
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Flights
            </Link>
          </div>
        </div>

        {/* Alert */}
        {errors.general && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-xl me-3"></i>
              <p className="font-medium">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
            <h2 className="text-2xl font-bold">
              <i className="fas fa-plane me-2"></i>Flight Information
            </h2>
          </div>
          <form id="addFlightForm" onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-primary flex items-center">
                <i className="fas fa-info-circle text-primary me-2"></i>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label
                    htmlFor="flightNumber"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-hashtag text-gray-400 me-2"></i>
                    Flight Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="flightNumber"
                    name="number"
                    className="form-control"
                    placeholder="e.g., SK101"
                    value={formData.number}
                    onChange={handleChange}
                    required
                  />
                  {errors.number && (
                    <p className="text-red-500 text-sm mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.number}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label
                    htmlFor="airline"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-plane-departure text-gray-400 me-2"></i>
                    Airline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="airline"
                    name="airline"
                    className="form-control"
                    placeholder="e.g., SkyWay Airways"
                    value={formData.airline}
                    onChange={handleChange}
                    required
                  />
                  {errors.airline && (
                    <p className="text-red-500 text-sm mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.airline}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="form-group">
                  <label
                    htmlFor="aircraft"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-plane text-gray-400 me-2"></i>
                    Aircraft Type
                  </label>
                  <select
                    id="aircraft"
                    name="aircraft"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                    value={formData.aircraft}
                    onChange={handleChange}
                  >
                    <option value="">Select Aircraft</option>
                    <option value="Boeing 737">Boeing 737</option>
                    <option value="Boeing 777">Boeing 777</option>
                    <option value="Boeing 787">Boeing 787 Dreamliner</option>
                    <option value="Airbus A320">Airbus A320</option>
                    <option value="Airbus A330">Airbus A330</option>
                    <option value="Airbus A350">Airbus A350</option>
                    <option value="Embraer E190">Embraer E190</option>
                  </select>
                </div>
                <div className="form-group">
                  <label
                    htmlFor="capacity"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-chair text-gray-400 me-2"></i>
                    Total Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="totalSeats"
                    className="form-control"
                    placeholder="e.g., 180"
                    min="1"
                    value={formData.totalSeats}
                    onChange={handleChange}
                    required
                  />
                  {errors.totalSeats && (
                    <p className="text-red-500 text-sm mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.totalSeats}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Route Information Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-primary flex items-center">
                <i className="fas fa-route text-primary me-2"></i>
                Route Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label
                    htmlFor="from"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-plane-departure text-gray-400 me-2"></i>
                    Departure City <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="from"
                    name="origin"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                    value={formData.origin}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Departure City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.origin && (
                    <small className="error-message">{errors.origin}</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="to">
                    Destination City <span className="required">*</span>
                  </label>
                  <select
                    id="to"
                    name="destination"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Destination City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.destination && (
                    <small className="error-message">
                      {errors.destination}
                    </small>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">
                    Flight Duration (hours) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    className="form-control"
                    placeholder="e.g., 2.5"
                    step="0.5"
                    min="0.5"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                  {errors.duration && (
                    <small className="error-message">{errors.duration}</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="distance">Distance (km)</label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    className="form-control"
                    placeholder="e.g., 1200"
                    min="1"
                    value={formData.distance}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Schedule Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departureDate">
                    Departure Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="departureDate"
                    name="departureDate"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white"
                    value={formData.departureDate}
                    onChange={handleChange}
                    required
                  />
                  {errors.departureDate && (
                    <small className="error-message">
                      {errors.departureDate}
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="departureTime">
                    Departure Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="departureTime"
                    name="departureTime"
                    className="form-control"
                    value={formData.departureTime}
                    onChange={handleChange}
                    required
                  />
                  {errors.departureTime && (
                    <small className="error-message">
                      {errors.departureTime}
                    </small>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="form-group">
                  <label
                    htmlFor="arrivalDate"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-calendar-check text-gray-400 me-2"></i>
                    Arrival Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="arrivalDate"
                    name="arrivalDate"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                    required
                  />
                  {errors.arrivalDate && (
                    <p className="text-red-500 text-sm mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.arrivalDate}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label
                    htmlFor="arrivalTime"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-clock text-gray-400 me-2"></i>
                    Arrival Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="arrivalTime"
                    name="arrivalTime"
                    className="form-control"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    required
                  />
                  {errors.arrivalTime && (
                    <p className="text-red-500 text-sm mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.arrivalTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Information Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-primary flex items-center">
                <i className="fas fa-dollar-sign text-primary me-2"></i>
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label
                    htmlFor="economyPrice"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-money-bill-wave text-gray-400 me-2"></i>
                    Economy Class Price ($){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="economyPrice"
                    name="price"
                    className="form-control"
                    placeholder="e.g., 299"
                    min="1"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.price}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label
                    htmlFor="businessPrice"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-money-bill-wave text-gray-400 me-2"></i>
                    Business Class Price ($)
                  </label>
                  <input
                    type="number"
                    id="businessPrice"
                    name="businessPrice"
                    className="form-control"
                    placeholder="e.g., 899"
                    min="1"
                    step="0.01"
                    value={formData.businessPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="form-group">
                  <label
                    htmlFor="firstClassPrice"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-money-bill-wave text-gray-400 me-2"></i>
                    First Class Price ($)
                  </label>
                  <input
                    type="number"
                    id="firstClassPrice"
                    name="firstClassPrice"
                    className="form-control"
                    placeholder="e.g., 1499"
                    min="1"
                    step="0.01"
                    value={formData.firstClassPrice}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor="currency"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-coins text-gray-400 me-2"></i>
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-primary flex items-center">
                <i className="fas fa-info text-primary me-2"></i>
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label
                    htmlFor="status"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-check-circle text-gray-400 me-2"></i>
                    Flight Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label
                    htmlFor="gate"
                    className="form-label text-gray-700 font-medium mb-2"
                  >
                    <i className="fas fa-door-open text-gray-400 me-2"></i>
                    Gate Number
                  </label>
                  <input
                    type="text"
                    id="gate"
                    name="gate"
                    className="form-control"
                    placeholder="e.g., A12"
                    value={formData.gate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="form-label text-gray-700 font-medium mb-3 block">
                  <i className="fas fa-star text-gray-400 me-2"></i>
                  Amenities (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { value: "wifi", label: "WiFi", icon: "wifi" },
                    { value: "meals", label: "Meals", icon: "utensils" },
                    {
                      value: "entertainment",
                      label: "Entertainment",
                      icon: "tv",
                    },
                    { value: "power", label: "Power", icon: "plug" },
                    { value: "baggage", label: "Baggage", icon: "suitcase" },
                    {
                      value: "priority-boarding",
                      label: "Priority Boarding",
                      icon: "user-check",
                    },
                  ].map((amenity) => (
                    <label
                      key={amenity.value}
                      className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity.value}
                        checked={formData.amenities.includes(amenity.value)}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <i className={`fas fa-${amenity.icon} text-gray-400`}></i>
                      <span className="text-sm text-gray-700">
                        {amenity.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <label
                  htmlFor="description"
                  className="form-label text-gray-700 font-medium mb-2 block"
                >
                  <i className="fas fa-align-left text-gray-400 me-2"></i>
                  Flight Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Additional information about the flight..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                onClick={resetForm}
              >
                <i className="fas fa-undo"></i>
                Reset Form
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <i
                  className={`fas fa-${loading ? "spinner fa-spin" : "save"}`}
                ></i>
                {loading ? "Adding Flight..." : "Add Flight"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddFlight;
