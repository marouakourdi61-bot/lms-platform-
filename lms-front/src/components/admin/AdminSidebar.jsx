import Icon from "../dashboard/Icon";
import Logo from "../dashboard/Logo";
import "./AdminSidebar.css";

function AdminSidebar({ activePage, onNavigate, onLogout, userCount }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <Logo />
        <p className="admin-sidebar-label">Administration</p>
        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <button
            className={`admin-nav-item admin-nav-button ${activePage === "dashboard" ? "is-active" : ""}`}
            type="button"
            aria-current={activePage === "dashboard" ? "page" : undefined}
            onClick={() => onNavigate("dashboard")}
          >
            <Icon name="dashboard" />Dashboard
          </button>
          <button
            className={`admin-nav-item admin-nav-button ${activePage === "users" ? "is-active" : ""}`}
            type="button"
            aria-current={activePage === "users" ? "page" : undefined}
            onClick={() => onNavigate("users")}
          >
            <Icon name="user" />
            <span>Users</span>
            <span className="admin-nav-count">{userCount}</span>
          </button>
          <span className="admin-nav-item">
            <Icon name="book" />Courses
          </span>
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <span className="admin-nav-item">
          <Icon name="user" />Profile
        </span>
        <button className="admin-nav-item admin-logout" type="button" onClick={onLogout}>
          <Icon name="logout" />Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;