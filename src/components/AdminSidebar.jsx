import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const AdminSidebar = ({ isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data?.user || data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "A";
  };

  const menuItems = [
    { path: "/admin", icon: "fa-tachometer-alt", label: "Dashboard" },
    { path: "/admin/users", icon: "fa-users", label: "Manage Users" },
    { path: "/admin/bookings", icon: "fa-ticket-alt", label: "All Bookings" },
    { path: "/admin/flights", icon: "fa-plane", label: "Manage Flights" },
    { path: "/admin/offers", icon: "fa-tags", label: "Manage Offers" },
    { path: "/admin/umrah", icon: "fa-kaaba", label: "Hajj & Umrah" },
    { path: "/admin/seating", icon: "fa-chair", label: "Seating" },
    { path: "/admin/archive", icon: "fa-archive", label: "Archive" },
    { path: "/admin/locations", icon: "fa-map-marker-alt", label: "Locations" },
    { path: "/admin/settings", icon: "fa-cog", label: "Settings" },
  ];

  return (
    <div
      className={`${
        isExpanded ? "w-64" : "w-20"
      } h-screen bg-gradient-to-b from-primary to-primary-dark text-white p-0 fixed overflow-y-auto z-40 shadow-lg transition-all duration-300`}
    >
      {/* Logo Section */}
      <div className="p-5 border-b border-white border-opacity-20 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-2xl hover:text-accent transition-colors"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <i className={`fas ${isExpanded ? "fa-bars" : "fa-bars"}`}></i>
          </button>
          {isExpanded && <h2 className="text-xl font-bold">SkyWay Admin</h2>}
        </div>
      </div>

      {/* Admin Profile Section */}
      {user && (
        <div
          className={`p-4 border-b border-white border-opacity-20 ${
            isExpanded ? "" : "flex justify-center"
          }`}
        >
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className={`rounded-full object-cover border-2 border-white ${
                  isExpanded ? "w-12 h-12" : "w-10 h-10"
                }`}
              />
            ) : (
              <div
                className={`bg-white text-primary rounded-full flex items-center justify-center font-bold ${
                  isExpanded ? "w-12 h-12 text-lg" : "w-10 h-10 text-sm"
                }`}
              >
                {getInitials()}
              </div>
            )}
            {isExpanded && (
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">
                  {user.name || "Admin"}
                </p>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-white bg-opacity-20 rounded-full">
                  Administrator
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="py-5 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${
              isExpanded ? "gap-3 px-6" : "justify-center px-4"
            } py-3 font-medium transition-all duration-300 border-l-4 ${
              isActive(item.path)
                ? "bg-white bg-opacity-20 border-l-accent text-white"
                : "border-l-transparent hover:bg-white hover:bg-opacity-10"
            }`}
            title={!isExpanded ? item.label : ""}
          >
            <i
              className={`fas ${item.icon} ${isExpanded ? "w-5" : "text-xl"}`}
            ></i>
            {isExpanded && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Divider */}
        <div
          className={`my-4 ${
            isExpanded ? "mx-4" : "mx-2"
          } border-t border-white border-opacity-20`}
        ></div>

        {/* Back and Logout */}
        <Link
          to="/"
          className={`flex items-center ${
            isExpanded ? "gap-3 px-6" : "justify-center px-4"
          } py-3 font-medium transition-all duration-300 border-l-4 border-l-transparent hover:bg-white hover:bg-opacity-10`}
          title={!isExpanded ? "Back to Website" : ""}
        >
          <i className={`fas fa-home ${isExpanded ? "w-5" : "text-xl"}`}></i>
          {isExpanded && <span>Back to Website</span>}
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className={`w-full flex items-center ${
            isExpanded ? "gap-3 px-6" : "justify-center px-4"
          } py-3 font-medium transition-all duration-300 border-l-4 border-l-transparent hover:bg-white hover:bg-opacity-10 text-left`}
          title={!isExpanded ? "Logout" : ""}
        >
          <i
            className={`fas fa-sign-out-alt ${isExpanded ? "w-5" : "text-xl"}`}
          ></i>
          {isExpanded && <span>Logout</span>}
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
