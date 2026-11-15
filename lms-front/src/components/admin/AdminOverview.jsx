import ActivityChart from "./ActivityChart";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import StatCard from "../dashboard/StatCard";
import "./AdminOverview.css";

const statistics = [
  { icon: "people", tone: "purple", label: "Total Users" },
  { icon: "book", tone: "teal", label: "Total Courses" },
  { icon: "check", tone: "amber", label: "Active Learners" },
];

function AdminOverview({ user }) {
  return (
    <div className="admin-overview">
      <section className="admin-welcome">
        <div>
          <p className="admin-eyebrow">Overview</p>
          <h1>Welcome back, <span>{user.name || "Admin"}</span>.</h1>
          <p className="admin-welcome-copy">Here’s an overview of your learning platform.</p>
        </div>
      </section>

      <section className="admin-stats-grid" aria-label="Platform statistics">
        {statistics.map((stat) => (
          <StatCard key={stat.label} {...stat} value="—" />
        ))}
      </section>

      <div className="admin-overview-grid">
        <ActivityChart />
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}

export default AdminOverview;