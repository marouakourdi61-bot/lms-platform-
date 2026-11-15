import { useState } from "react";
import AdminOverview from "../components/admin/AdminOverview";
import AdminSidebar from "../components/admin/AdminSidebar";
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
      {activePage === "users" ? (
        <UserList users={temporaryUserListDemoUsers} />
      ) : (
        <AdminOverview user={user} />
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;