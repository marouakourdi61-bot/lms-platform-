import DashboardContent from "../components/dashboard/DashboardContent";
import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard({ user, token, onLogout }) {
  return (
    <DashboardLayout
      sidebar={<Sidebar onLogout={onLogout} />}
      header={<Header user={user} />}
    >
      <DashboardContent user={user} token={token} />
    </DashboardLayout>
  );
}

export default Dashboard;
