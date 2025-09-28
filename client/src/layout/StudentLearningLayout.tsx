import React from "react";
import { Outlet } from "react-router-dom";

const StudentLearningLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* No header, footer, or other distracting elements */}
      {/* Just the main content for focused learning */}
      <Outlet />
    </div>
  );
};

export default StudentLearningLayout;
