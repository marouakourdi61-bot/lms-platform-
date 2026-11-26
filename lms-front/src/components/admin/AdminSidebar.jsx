
import { NavLink } from "react-router-dom";
import Icon from "../dashboard/Icon";
import Logo from "../dashboard/Logo";
import "./AdminSidebar.css";

function AdminSidebar({ onLogout, userCount }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <Logo />
        <p className="admin-sidebar-label">Administration</p>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `admin-nav-item admin-nav-button ${isActive ? "is-active" : ""}`
            }
          >
            <Icon name="dashboard" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `admin-nav-item admin-nav-button ${isActive ? "is-active" : ""}`
            }
          >
            <Icon name="user" />
            <span>Users</span>
            <span className="admin-nav-count">{userCount}</span>
          </NavLink>

          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              `admin-nav-item admin-nav-button ${isActive ? "is-active" : ""}`
            }
          >
            <Icon name="book" />
            Courses
          </NavLink>
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <span className="admin-nav-item">
          <Icon name="user" />
          Profile
        </span>

        <button
          className="admin-nav-item admin-logout"
          type="button"
          onClick={onLogout}
        >
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
