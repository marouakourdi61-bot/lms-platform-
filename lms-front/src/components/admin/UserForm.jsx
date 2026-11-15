import { useState } from "react";
import "./UserForm.css";

function UserForm({ user = null, onCancel }) {
  const isEditMode = Boolean(user);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "learner");
  const [status, setStatus] = useState(user?.status || "active");

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="user-form-backdrop">
      <form
        className="user-form-dialog"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <header className="user-form-header">
          <div>
            <h2 id="user-form-title">{isEditMode ? "Edit user" : "Create a new user"}</h2>
            <p>
              {isEditMode
                ? "Update the user's profile details."
                : "Add someone to your LMS Platform workspace."}
            </p>
          </div>
          <button
            className="user-form-close"
            type="button"
            aria-label="Close form"
            onClick={onCancel}
          >
            ×
          </button>
        </header>

        <div className="user-form-fields">
          <label className="user-form-field" htmlFor="user-name">
            <span>Name</span>
            <input
              id="user-name"
              name="name"
              type="text"
              placeholder="e.g. Jamie Cooper"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="user-form-field" htmlFor="user-email">
            <span>Email</span>
            <input
              id="user-email"
              name="email"
              type="email"
              placeholder="jamie@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="user-form-field" htmlFor="user-password">
            <span>Password</span>
            <input
              id="user-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="user-form-field" htmlFor="user-role">
            <span>Role</span>
            <select
              id="user-role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="learner">Learner</option>
            </select>
          </label>

          <label className="user-form-field" htmlFor="user-status">
            <span>Status</span>
            <select
              id="user-status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
        </div>

        <footer className="user-form-actions">
          <button className="user-form-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="user-form-save" type="submit">Save</button>
        </footer>
      </form>
    </div>
  );
}

export default UserForm;