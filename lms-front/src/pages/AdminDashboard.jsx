import { useState } from "react";
import AdminOverview from "../components/admin/AdminOverview";
import AdminSidebar from "../components/admin/AdminSidebar";
import CourseList from "../components/admin/CourseList";
import CourseForm from "../components/admin/CourseForm";
import UserList from "../components/admin/UserList";
import Header from "../components/dashboard/Header";
import DashboardLayout from "../layouts/DashboardLayout";
import { temporaryUserListDemoUsers } from "../data/userListDemoData";

function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <DashboardLayout
      sidebar={
        <AdminSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={onLogout}
          userCount={temporaryUserListDemoUsers.length}
        />
      }
      header={<Header user={user} />}
    >
      {activePage === "create-course" ? (
        <CourseForm onCancel={() => setActivePage("courses")} />
      ) : activePage === "users" ? (
        <UserList users={temporaryUserListDemoUsers} />
      ) : activePage === "courses" ? (
        <CourseList courses={[]} onCreateCourse={() => setActivePage("create-course")} />
      ) : (
        <AdminOverview user={user} />
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;