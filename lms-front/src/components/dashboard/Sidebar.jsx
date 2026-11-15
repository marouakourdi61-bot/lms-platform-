import Icon from "./Icon";
import Logo from "./Logo";
import "./Sidebar.css";

function Sidebar({ onLogout }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top">
        <Logo />
        <p className="sidebar-label">Learning Space</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="sidebar-nav-item is-active" aria-current="page">
            <Icon name="dashboard" />Dashboard
          </span>
          <span className="sidebar-nav-item">
            <Icon name="book" />My Courses
          </span>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-account">
          <span className="sidebar-account-link"><Icon name="user" />Profile</span>
          <button className="sidebar-account-link sidebar-logout" type="button" onClick={onLogout}>
            <Icon name="logout" />Log out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;