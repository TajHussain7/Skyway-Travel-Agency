import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div
        className={`flex-1 ${
          isExpanded ? "ml-64" : "ml-20"
        } transition-all duration-300 overflow-x-hidden`}
        style={{ width: `calc(100% - ${isExpanded ? "256px" : "80px"})` }}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
