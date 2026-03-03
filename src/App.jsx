import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Home Pages
import Home from "./pages/home/Home";
import Flights from "./pages/home/Flights";
import Umrah from "./pages/home/Umrah";
import Offers from "./pages/home/Offers";
import AboutUs from "./pages/home/AboutUs";
import ContactUs from "./pages/home/ContactUs";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import Dashboard from "./pages/user/Dashboard";
import MyBookings from "./pages/user/MyBookings";
import PastBookings from "./pages/user/PastBookings";
import Profile from "./pages/user/Profile";
import PackageOffers from "./pages/user/PackageOffers";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageFlights from "./pages/admin/ManageFlights";
import AddFlight from "./pages/admin/AddFlight";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageOffers from "./pages/admin/ManageOffers";
import ManageUmrah from "./pages/admin/ManageUmrah";
import ManageArchive from "./pages/admin/ManageArchive";
import Settings from "./pages/admin/Settings";
import ManageLocations from "./pages/admin/ManageLocations";
import ManageSeating from "./pages/admin/ManageSeating";

// Other
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import MaintenanceGuard from "./components/MaintenanceGuard";
import MaintenanceBanner from "./components/MaintenanceBanner";

function App() {
  return (
    <Router>
      <MaintenanceGuard>
        <MaintenanceBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/umrah" element={<Umrah />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/maintenance" element={<Maintenance />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/past-bookings" element={<PastBookings />} />
          <Route path="/package-offers" element={<PackageOffers />} />
          <Route path="/profile" element={<Profile />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/flights" element={<ManageFlights />} />
          <Route path="/admin/add-flight" element={<AddFlight />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/bookings" element={<ManageBookings />} />
          <Route path="/admin/offers" element={<ManageOffers />} />
          <Route path="/admin/umrah" element={<ManageUmrah />} />
          <Route path="/admin/locations" element={<ManageLocations />} />
          <Route path="/admin/seating" element={<ManageSeating />} />
          <Route path="/admin/archive" element={<ManageArchive />} />
          <Route path="/admin/settings" element={<Settings />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MaintenanceGuard>
    </Router>
  );
}

export default App;
