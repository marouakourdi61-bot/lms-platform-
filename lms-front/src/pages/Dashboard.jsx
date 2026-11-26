import { useState } from "react";
import DashboardContent from "../components/dashboard/DashboardContent";
import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardLayout from "../layouts/DashboardLayout";
import Courses from "./Learner/Courses";
import MyCourses from "./Learner/MyCourses";


function Dashboard({ user, token, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          onLogout={onLogout}
          activePage={activePage}
          onNavigate={setActivePage}
        />
      }
      header={<Header user={user} />}
    >
      {activePage === "dashboard" && (
        <DashboardContent user={user} token={token} />
      )}

      {activePage === "courses" && <Courses token={token} />}
      {activePage === "my-courses" && (
        <MyCourses token={token} />
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
