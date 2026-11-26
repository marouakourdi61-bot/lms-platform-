import { NavLink } from "react-router-dom";
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
          <NavLink
            to="/learner/dashboard"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <Icon name="dashboard" />
            Dashboard
          </NavLink>

          <NavLink
            to="/learner/courses"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <Icon name="book" />
            Explore Courses
          </NavLink>

          <NavLink
            to="/learner/my-courses"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <Icon name="book" />
            My Courses
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-account">
          <span className="sidebar-account-link">
            <Icon name="user" />
            Profile
          </span>

          <button
            className="sidebar-account-link sidebar-logout"
            type="button"
            onClick={onLogout}
          >
            <Icon name="logout" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
