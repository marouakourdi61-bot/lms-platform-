
import Icon from "./Icon";
import Logo from "./Logo";
import "./Sidebar.css";

function Sidebar({ onLogout, activePage, onNavigate }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top">
        <Logo />
        <p className="sidebar-label">Learning Space</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <button
            className={`sidebar-nav-item ${activePage === "dashboard" ? "is-active" : ""}`}
            aria-current={activePage === "dashboard" ? "page" : undefined}
            onClick={() => onNavigate("dashboard")}
            type="button"
          >
            <Icon name="dashboard" />Dashboard
          </button>

          <button
            className={`sidebar-nav-item ${activePage === "courses" ? "is-active" : ""}`}
            aria-current={activePage === "courses" ? "page" : undefined}
            onClick={() => onNavigate("courses")}
            type="button"
          >
            <Icon name="book" />My Courses
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-account">
          <span className="sidebar-account-link">
            <Icon name="user" />Profile
          </span>

          <button
            className="sidebar-account-link sidebar-logout"
            type="button"
            onClick={onLogout}
          >
            <Icon name="logout" />Log out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
