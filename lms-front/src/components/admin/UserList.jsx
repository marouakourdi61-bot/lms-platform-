import { useState } from "react";
import Icon from "../dashboard/Icon";
import UserCard from "./UserCard";
import "./UserList.css";

function UserList({ users = [] }) {
  const userRows = Array.isArray(users) ? users : [];
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const availableStatuses = [];
  userRows.forEach((user) => {
    if (user.status && !availableStatuses.includes(user.status)) {
      availableStatuses.push(user.status);
    }
  });

  const filteredUsers = userRows.filter((user) => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    return matchesRole && matchesStatus;
  });
  const filteredCount = filteredUsers.length;

  function resetFilters() {
    setSelectedRole("all");
    setSelectedStatus("all");
  }

  return (
    <section className="user-management" aria-labelledby="user-list-title">
      <div className="user-management-heading">
        <div>
          <span className="user-management-eyebrow">People</span>
          <h1 id="user-list-title">User management</h1>
          <p>Manage access, roles, and learner accounts.</p>
        </div>
        <button className="add-user-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add user
        </button>
      </div>

      <div className="user-preview-notice" role="note">
        <strong>Preview data</strong>
        <span>Temporary sample users for visual testing only.</span>
      </div>

      <div className="user-list-controls" aria-label="User list controls">
        <label className="user-search-preview">
          <Icon name="search" />
          <input
            aria-label="Search users by name or email"
            placeholder="Search users by name or email..."
            readOnly
          />
        </label>
        <div className="user-filter-previews">
          <label className="user-filter-wrap">
            <span className="visually-hidden">Filter by role</span>
            <select
              className="user-filter-preview"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="learner">Learner</option>
            </select>
            <Icon name="chevron" />
          </label>
          <label className="user-filter-wrap">
            <span className="visually-hidden">Filter by status</span>
            <select
              className="user-filter-preview"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <Icon name="chevron" />
          </label>
          <button className="reset-filters-button" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </div>

      <div className="user-list-table-container">
        <div className="user-list-table-wrap">
          <table className="user-list-table">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Joined</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredCount === 0 ? (
                <tr>
                  <td className="user-list-empty" colSpan="5">
                    {userRows.length === 0
                      ? "No users to display."
                      : "No users match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserCard key={user._id || user.id || user.email} user={user} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="user-list-pagination">
          <p>
            Showing <strong>{filteredCount === 0 ? "0" : `1–${filteredCount}`}</strong> of{" "}
            <strong>{userRows.length}</strong> users
          </p>
          <div className="pagination-controls" aria-label="Pagination preview">
            <button type="button" disabled>Previous</button>
            <span className="current-page">1</span>
            <button type="button" disabled>Next</button>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default UserList;