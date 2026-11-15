import Icon from "./Icon";
import "./Header.css";

function Header({ user }) {
  const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const initial = user.email.charAt(0).toUpperCase();

  return (
    <header className="top-header">
      <div className="dashboard-search" aria-label="Search">
        <Icon name="search" />
        <span>Search anything...</span>
        <kbd>⌘ K</kbd>
      </div>
      <div className="header-actions">
        <span className="notification-control" aria-label="Notifications">
          <Icon name="bell" />
          <span className="notification-dot" />
        </span>
        <div className="user-profile">
          <span className="user-avatar">{initial}</span>
          <span className="user-profile-copy">
            <strong>{user.email}</strong>
            <span>{role}</span>
          </span>
          <span className="profile-chevron"><Icon name="chevron" /></span>
        </div>
      </div>
    </header>
  );
}

export default Header;