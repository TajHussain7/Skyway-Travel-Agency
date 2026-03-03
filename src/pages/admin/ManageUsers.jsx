import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import * as XLSX from "xlsx";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", role: "" });
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    activeUsers: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/users", {
        withCredentials: true,
      });
      const usersData = response.data.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        adminUsers: usersData.filter((u) => u.role === "admin").length,
        regularUsers: usersData.filter((u) => u.role === "user").length,
        activeUsers: usersData.length, // Placeholder
      });
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    setFilteredUsers(filtered);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditRole("");
    setShowEditModal(false);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !editRole) return;

    try {
      await axios.put(
        `/api/admin/users/${selectedUser._id}`,
        { role: editRole },
        { withCredentials: true },
      );

      // Reload users after update
      await loadUsers();
      closeEditModal();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(error.response?.data?.message || "Failed to update user role");
    }
  };

  const handleExportUsers = async () => {
    try {
      // Fetch users with their booking statistics
      const response = await axios.get("/api/admin/users/export", {
        withCredentials: true,
      });

      const usersWithStats = response.data.data || [];

      // Prepare data for Excel
      const excelData = usersWithStats.map((user, index) => ({
        "No.": index + 1,
        Company: "SKYWAY TRAVEL AGENCY",
        Name: user.name || "N/A",
        Email: user.email || "N/A",
        Role: user.role || "user",
        "Date Joined": user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A",
        "Number of Bookings": user.bookingCount || 0,
        "Total Expenses ($)": user.totalExpenses
          ? user.totalExpenses.toFixed(2)
          : "0.00",
      }));

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // No.
        { wch: 25 }, // Company
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 10 }, // Role
        { wch: 15 }, // Date Joined
        { wch: 18 }, // Number of Bookings
        { wch: 18 }, // Total Expenses
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate filename with current date
      const date = new Date().toISOString().split("T")[0];
      const filename = `SKYWAY_Users_Report_${date}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("Failed to export users. Please try again.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading users...</p>
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
                <i className="fas fa-users me-3"></i> User Management
              </h1>
              <p className="text-gray-100 text-lg">
                Manage all user accounts and permissions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={handleExportUsers}
              >
                <i className="fas fa-download"></i> Export Users
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
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4">
              <i className="fas fa-user-shield text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.adminUsers}
              </h3>
              <p className="text-gray-600">Admin Users</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-4">
              <i className="fas fa-user text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.regularUsers}
              </h3>
              <p className="text-gray-600">Regular Users</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-700 text-white p-4">
              <i className="fas fa-user-check text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.activeUsers}
              </h3>
              <p className="text-gray-600">Active Users</p>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
            <h2 className="text-2xl font-bold">User List</h2>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-search text-gray-400 me-2"></i>
                  Search Users
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label text-gray-700 font-medium mb-2">
                  <i className="fas fa-filter text-gray-400 me-2"></i>
                  Role
                </label>
                <select
                  className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[right_1rem_center] bg-no-repeat pr-10"
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <i className="fas fa-user-slash text-4xl mb-2"></i>
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">
                            {user.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                            onClick={() => openEditModal(user)}
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                            onClick={() => {}}
                            title="Delete User"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Role Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  <i className="fas fa-user-edit mr-2"></i>
                  Edit User Role
                </h3>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300"
                  onClick={closeEditModal}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* User Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {selectedUser.name
                        ? selectedUser.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedUser.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedUser.email || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Current Role:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-user-shield mr-2 text-primary"></i>
                    Select New Role
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Admins have full access to manage the system
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={closeEditModal}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  <button
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    onClick={handleUpdateRole}
                    disabled={editRole === selectedUser.role}
                  >
                    <i className="fas fa-save mr-2"></i>
                    Update Role
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

export default ManageUsers;
