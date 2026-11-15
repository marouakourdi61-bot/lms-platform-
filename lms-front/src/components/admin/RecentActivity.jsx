import Icon from "../dashboard/Icon";
import "./RecentActivity.css";

function RecentActivity() {
  return (
    <section className="admin-panel recent-activity" aria-labelledby="recent-activity-title">
      <h2 id="recent-activity-title">Recent Activity</h2>
      <div className="recent-activity-empty">
        <span><Icon name="dashboard" /></span>
        <p>No recent activity available yet.</p>
      </div>
    </section>
  );
}

export default RecentActivity;