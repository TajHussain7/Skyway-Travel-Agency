import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";
import NotificationModal from "../../components/NotificationModal";
import axios from "axios";

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "World Tour",
    description: "",
    price: "",
    priceUnit: "per person",
    badge: "",
    badgeColor: "blue",
    image: "",
    features: [],
    fullDetails: "",
    inclusions: [],
    isVisible: true,
    isBookable: true,
    maxBookings: "",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
  });
  const [featureInput, setFeatureInput] = useState({
    icon: "fas fa-check",
    text: "",
  });
  const [inclusionInput, setInclusionInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadOffers();
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

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/package-offers/admin/all",
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error("Error loading offers:", error);
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message: "Failed to load offers. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "World Tour",
      description: "",
      price: "",
      priceUnit: "per person",
      badge: "",
      badgeColor: "blue",
      image: "",
      features: [],
      fullDetails: "",
      inclusions: [],
      isVisible: true,
      isBookable: true,
      maxBookings: "",
      validFrom: new Date().toISOString().split("T")[0],
      validTo: "",
    });
    setFeatureInput({ icon: "fas fa-check", text: "" });
    setInclusionInput("");
    setImageFile(null);
    setImagePreview("");
    setEditingOffer(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      category: offer.category,
      description: offer.description,
      price: offer.price,
      priceUnit: offer.priceUnit,
      badge: offer.badge || "",
      badgeColor: offer.badgeColor || "blue",
      image: offer.image,
      features: offer.features || [],
      fullDetails: offer.fullDetails || "",
      inclusions: offer.inclusions || [],
      isVisible: offer.isVisible,
      isBookable: offer.isBookable,
      maxBookings: offer.maxBookings || "",
      validFrom: offer.validFrom
        ? new Date(offer.validFrom).toISOString().split("T")[0]
        : "",
      validTo: offer.validTo
        ? new Date(offer.validTo).toISOString().split("T")[0]
        : "",
    });
    setImagePreview(offer.image);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;

      // If a new image file is selected, convert to base64
      if (imageFile) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const submitData = {
        ...formData,
        image: imageUrl,
        price: parseFloat(formData.price),
        maxBookings: formData.maxBookings
          ? parseInt(formData.maxBookings)
          : null,
      };

      if (editingOffer) {
        await axios.put(
          `http://localhost:8080/api/package-offers/${editingOffer._id}`,
          submitData,
          { withCredentials: true }
        );
        setNotificationModal({
          isOpen: true,
          title: "Success",
          message: "Offer updated successfully!",
          type: "success",
        });
      } else {
        await axios.post(
          "http://localhost:8080/api/package-offers",
          submitData,
          { withCredentials: true }
        );
        setNotificationModal({
          isOpen: true,
          title: "Success",
          message: "Offer created successfully!",
          type: "success",
        });
      }

      setShowModal(false);
      resetForm();
      loadOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to save offer. Please try again.",
        type: "error",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotificationModal({
          isOpen: true,
          title: "Invalid File",
          message: "Please select an image file (JPG, PNG, GIF, etc.)",
          type: "error",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotificationModal({
          isOpen: true,
          title: "File Too Large",
          message: "Image size must be less than 5MB",
          type: "error",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const toggleVisibility = async (offerId, currentVisibility) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/package-offers/${offerId}/toggle-visibility`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotificationModal({
          isOpen: true,
          title: "Success",
          message: `Offer ${
            !currentVisibility ? "shown" : "hidden"
          } successfully!`,
          type: "success",
        });
        loadOffers();
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to toggle visibility. Please try again.",
        type: "error",
      });
    }
  };

  const deleteOffer = async (offerId, offerName) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Offer",
      message: `Are you sure you want to delete "${offerName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(
            `http://localhost:8080/api/package-offers/${offerId}`,
            { withCredentials: true }
          );
          setNotificationModal({
            isOpen: true,
            title: "Success",
            message: "Offer deleted successfully!",
            type: "success",
          });
          loadOffers();
        } catch (error) {
          console.error("Error deleting offer:", error);
          setNotificationModal({
            isOpen: true,
            title: "Error",
            message: "Failed to delete offer. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  const addFeature = () => {
    if (featureInput.text.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, { ...featureInput }],
      });
      setFeatureInput({ icon: "fas fa-check", text: "" });
    }
  };

  const handleFeatureKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addInclusion = () => {
    if (inclusionInput.trim()) {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, inclusionInput],
      });
      setInclusionInput("");
    }
  };

  const handleInclusionKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInclusion();
    }
  };

  const removeInclusion = (index) => {
    setFormData({
      ...formData,
      inclusions: formData.inclusions.filter((_, i) => i !== index),
    });
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionsMenu && !event.target.closest(".actions-menu-container")) {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActionsMenu]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading offers...</p>
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
                <i className="fas fa-tags me-3"></i> Package Offer Management
              </h1>
              <p className="text-gray-100 text-lg">
                Manage special package offers and promotions
              </p>
            </div>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
              onClick={openCreateModal}
            >
              <i className="fas fa-plus"></i> Add New Offer
            </button>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-6">
            <h2 className="text-2xl font-bold">
              All Package Offers ({offers.length})
            </h2>
          </div>

          {offers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tags text-4xl text-orange-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No offers found
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating special package offers for your customers
              </p>
              <button
                className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                onClick={openCreateModal}
              >
                <i className="fas fa-plus"></i> Create First Offer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Image
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Name
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Category
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Price
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Badge
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                      Visible
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                      Bookable
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {offers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-gray-50">
                      <td className="px-2 py-4">
                        <img
                          src={offer.image}
                          alt={offer.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-semibold text-gray-900">
                          {offer.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {offer.description}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full whitespace-nowrap">
                          {offer.category}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-semibold text-gray-900">
                          {offer.priceUnit === "percentage"
                            ? `${offer.price}% OFF`
                            : `$${offer.price.toLocaleString()}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {offer.priceUnit}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {offer.badge && (
                          <span
                            className={`px-3 py-1 bg-gradient-to-r from-${offer.badgeColor}-400 to-${offer.badgeColor}-600 text-white text-xs font-semibold rounded-full whitespace-nowrap`}
                          >
                            {offer.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {offer.isVisible ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap">
                            <i className="fas fa-eye mr-1"></i> Visible
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full whitespace-nowrap">
                            <i className="fas fa-eye-slash mr-1"></i> Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {offer.isBookable ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative actions-menu-container">
                          <button
                            onClick={() =>
                              setShowActionsMenu(
                                showActionsMenu === offer._id ? null : offer._id
                              )
                            }
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 mx-auto"
                            title="Actions"
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </button>

                          {showActionsMenu === offer._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  openEditModal(offer);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
                              >
                                <i className="fas fa-edit text-blue-500 w-4"></i>
                                <span className="font-medium">Edit Offer</span>
                              </button>

                              <button
                                onClick={() => {
                                  toggleVisibility(offer._id, offer.isVisible);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-yellow-50 text-gray-700 flex items-center gap-3 transition-colors border-t border-gray-100"
                              >
                                <i
                                  className={`fas fa-eye${
                                    offer.isVisible ? "-slash" : ""
                                  } ${
                                    offer.isVisible
                                      ? "text-yellow-500"
                                      : "text-green-500"
                                  } w-4`}
                                ></i>
                                <span className="font-medium">
                                  {offer.isVisible
                                    ? "Hide Offer"
                                    : "Show Offer"}
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  deleteOffer(offer._id, offer.name);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-red-50 text-gray-700 flex items-center gap-3 transition-colors border-t border-gray-100"
                              >
                                <i className="fas fa-trash text-red-500 w-4"></i>
                                <span className="font-medium">
                                  Delete Offer
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 sticky top-0 z-10">
                <h2 className="text-2xl font-bold">
                  {editingOffer
                    ? "Edit Package Offer"
                    : "Create New Package Offer"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="e.g., World Tour Gold Package"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="World Tour">World Tour</option>
                      <option value="Umrah">Umrah</option>
                      <option value="Hajj">Hajj</option>
                      <option value="Umrah & Hajj">Umrah & Hajj</option>
                      <option value="Adventure Tour">Adventure Tour</option>
                      <option value="Membership & Student Discounts">
                        Membership & Student Discounts
                      </option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 2500"
                    />
                  </div>

                  {/* Price Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price Unit *
                    </label>
                    <select
                      required
                      value={formData.priceUnit}
                      onChange={(e) =>
                        setFormData({ ...formData, priceUnit: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="per person">per person</option>
                      <option value="per group">per group</option>
                      <option value="annual fee">annual fee</option>
                      <option value="percentage">percentage</option>
                    </select>
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) =>
                        setFormData({ ...formData, badge: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Premium, Popular"
                    />
                  </div>

                  {/* Badge Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Badge Color
                    </label>
                    <select
                      value={formData.badgeColor}
                      onChange={(e) =>
                        setFormData({ ...formData, badgeColor: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="yellow">Yellow</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="cyan">Cyan</option>
                      <option value="red">Red</option>
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Offer Image *
                    </label>

                    {/* Image Preview */}
                    {(imagePreview || formData.image) && (
                      <div className="mb-4 relative inline-block">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}

                    {/* File Input and URL Input */}
                    <div className="space-y-3">
                      <div>
                        <label className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                          <i className="fas fa-upload"></i>
                          <span className="font-medium">
                            Choose Image from Computer
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          <i className="fas fa-info-circle"></i> Max size: 5MB |
                          Formats: JPG, PNG, GIF, WebP
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">
                            OR
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Enter Image URL:
                        </label>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({ ...formData, image: e.target.value });
                            setImagePreview(e.target.value);
                            setImageFile(null);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                          placeholder="https://example.com/image.jpg or /assets/images/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      rows="2"
                      placeholder="Brief description shown on card"
                    />
                  </div>

                  {/* Full Details */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Details
                    </label>
                    <textarea
                      value={formData.fullDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullDetails: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      rows="3"
                      placeholder="Detailed description shown in modal"
                    />
                  </div>

                  {/* Features */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Features
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={featureInput.icon}
                        onChange={(e) =>
                          setFeatureInput({
                            ...featureInput,
                            icon: e.target.value,
                          })
                        }
                        onKeyPress={handleFeatureKeyPress}
                        className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Icon class"
                      />
                      <input
                        type="text"
                        value={featureInput.text}
                        onChange={(e) =>
                          setFeatureInput({
                            ...featureInput,
                            text: e.target.value,
                          })
                        }
                        onKeyPress={handleFeatureKeyPress}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Feature text (Press Enter to add)"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200"
                        title="Add Feature"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gray-100 p-2 rounded"
                        >
                          <i className={`${feature.icon} text-primary`}></i>
                          <span className="flex-1">{feature.text}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What's Included
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={inclusionInput}
                        onChange={(e) => setInclusionInput(e.target.value)}
                        onKeyPress={handleInclusionKeyPress}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Inclusion text (Press Enter to add)"
                      />
                      <button
                        type="button"
                        onClick={addInclusion}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200"
                        title="Add Inclusion"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.inclusions.map((inclusion, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gray-100 p-2 rounded"
                        >
                          <i className="fas fa-check-circle text-success"></i>
                          <span className="flex-1">{inclusion}</span>
                          <button
                            type="button"
                            onClick={() => removeInclusion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Max Bookings */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Bookings (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxBookings}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxBookings: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  {/* Valid From */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200 cursor-pointer bg-white"
                    />
                  </div>

                  {/* Valid To */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid To (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) =>
                        setFormData({ ...formData, validTo: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200 cursor-pointer bg-white"
                      placeholder="Leave empty for no expiry"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="md:col-span-2 flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isVisible: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Visible on website
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isBookable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isBookable: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Bookable
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    {editingOffer ? "Update Offer" : "Create Offer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modals */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type="danger"
        />

        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={() =>
            setNotificationModal({ ...notificationModal, isOpen: false })
          }
          title={notificationModal.title}
          message={notificationModal.message}
          type={notificationModal.type}
          autoClose={true}
          duration={3000}
        />
      </div>
    </AdminLayout>
  );
};

export default ManageOffers;
