import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "city",
    country: "",
    code: "",
    isActive: true,
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/locations", {
        withCredentials: true,
      });
      if (response.data.success) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      showNotification("error", "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      type: "city",
      country: "",
      code: "",
      isActive: true,
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const openEditModal = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      country: location.country || "",
      code: location.code || "",
      isActive: location.isActive,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedLocation(null);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/locations", formData, {
        withCredentials: true,
      });
      if (response.data.success) {
        showNotification("success", "Location added successfully!");
        fetchLocations();
        closeAddModal();
      }
    } catch (error) {
      console.error("Error adding location:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to add location"
      );
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/api/admin/locations/${selectedLocation._id}`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        showNotification("success", "Location updated successfully!");
        fetchLocations();
        closeEditModal();
      }
    } catch (error) {
      console.error("Error updating location:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to update location"
      );
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await axios.delete(`/api/admin/locations/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        showNotification("success", "Location deleted successfully!");
        fetchLocations();
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      showNotification("error", "Failed to delete location");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Toast Notification */}

        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div
              className={`rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px] ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <i
                className={`fas ${
                  notification.type === "success"
                    ? "fa-check-circle"
                    : "fa-exclamation-circle"
                } text-2xl`}
              ></i>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <i className="fas fa-map-marker-alt text-primary"></i>
              Manage Locations
            </h1>
            <p className="text-gray-600 mt-2">
              Manage cities and countries for flight search dropdowns
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Location
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
            <p className="mt-4 text-gray-600">Loading locations...</p>
          </div>
        )}

        {!loading && locations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fas fa-map-marked-alt text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Locations Found
            </h3>
            <p className="text-gray-500">
              Add your first location to enable search functionality
            </p>
          </div>
        )}

        {!loading && locations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <tr key={location._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                          <span className="font-semibold text-gray-900">
                            {location.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {location.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {location.country || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {location.code || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            location.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {location.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(location)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Location Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-bold">
                  <i className="fas fa-plus mr-3"></i>
                  Add New Location
                </h3>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  onClick={closeAddModal}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleAddLocation} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="e.g., Lahore"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200 cursor-pointer bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                      value={formData.type}
                      onChange={(e) => handleFormChange("type", e.target.value)}
                    >
                      <option value="city">City</option>
                      <option value="country">Country</option>
                      <option value="airport">Airport</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Code (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200 uppercase"
                      value={formData.code}
                      onChange={(e) =>
                        handleFormChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., LHE"
                      maxLength="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200"
                    value={formData.country}
                    onChange={(e) =>
                      handleFormChange("country", e.target.value)
                    }
                    placeholder="e.g., Pakistan"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleFormChange("isActive", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Active (visible in search)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={closeAddModal}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                  >
                    <i className="fas fa-save mr-2"></i>
                    Add Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Location Modal */}
        {showEditModal && selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-bold">
                  <i className="fas fa-edit mr-3"></i>
                  Edit Location
                </h3>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  onClick={closeEditModal}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleUpdateLocation} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="e.g., Lahore"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200 cursor-pointer bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                      value={formData.type}
                      onChange={(e) => handleFormChange("type", e.target.value)}
                    >
                      <option value="city">City</option>
                      <option value="country">Country</option>
                      <option value="airport">Airport</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Code (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200 uppercase"
                      value={formData.code}
                      onChange={(e) =>
                        handleFormChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., LHE"
                      maxLength="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400 transition-all duration-200"
                    value={formData.country}
                    onChange={(e) =>
                      handleFormChange("country", e.target.value)
                    }
                    placeholder="e.g., Pakistan"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleFormChange("isActive", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="isActiveEdit"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Active (visible in search)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={closeEditModal}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                  >
                    <i className="fas fa-save mr-2"></i>
                    Update Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageLocations;
