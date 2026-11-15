import Icon from "../dashboard/Icon";
import "./QuickActions.css";

const actions = [
  { icon: "user", label: "Manage users" },
  { icon: "book", label: "Manage courses" },
  { icon: "dashboard", label: "View reports" },
];

function QuickActions() {
  return (
    <section className="admin-panel quick-actions" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title">Quick Actions</h2>
      <div className="quick-action-list">
        {actions.map((action) => (
          <div className="quick-action-item" key={action.label}>
            <span className="quick-action-icon"><Icon name={action.icon} /></span>
            <span>{action.label}</span>
            <Icon className="quick-action-arrow" name="chevron" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;