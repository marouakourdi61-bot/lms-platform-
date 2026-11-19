import { useState } from "react";
import "./UserForm.css";

function UserForm({ user = null, onCancel }) {
  const isEditMode = Boolean(user);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "learner");
  const [status, setStatus] = useState(user?.status || "active");
  const [errors, setErrors] = useState({});

  function validateField(field, value) {
    if (field === "name") {
      if (value.trim().length === 0) {
        return "Name is required.";
      }
      if (value.trim().length < 2) {
        return "Name must contain at least 2 characters.";
      }
    }

    if (field === "email") {
      if (value.trim().length === 0) {
        return "Email is required.";
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value.trim())) {
        return "Enter a valid email address.";
      }
    }

    if (field === "password") {
      if (!isEditMode && value.length === 0) {
        return "Password is required.";
      }
      if (value.length > 0 && value.length < 8) {
        return "Password must contain at least 8 characters.";
      }
    }

    if ((field === "role" || field === "status") && value.length === 0) {
      return `${field === "role" ? "Role" : "Status"} is required.`;
    }

    return "";
  }

  function updateField(field, value, setValue) {
    setValue(value);
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validateField(field, value),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      name: validateField("name", name),
      email: validateField("email", email),
      password: validateField("password", password),
      role: validateField("role", role),
      status: validateField("status", status),
    };

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some((error) => error !== "");
    if (hasErrors) {
      return;
    }
  }

  return (
    <div className="user-form-backdrop">
      <form
        className="user-form-dialog"
        onSubmit={handleSubmit}
        noValidate
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
              onChange={(event) => updateField("name", event.target.value, setName)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "user-name-error" : undefined}
            />
            {errors.name && <span className="user-form-error" id="user-name-error">{errors.name}</span>}
          </label>

          <label className="user-form-field" htmlFor="user-email">
            <span>Email</span>
            <input
              id="user-email"
              name="email"
              type="email"
              placeholder="jamie@example.com"
              value={email}
              onChange={(event) => updateField("email", event.target.value, setEmail)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "user-email-error" : undefined}
            />
            {errors.email && <span className="user-form-error" id="user-email-error">{errors.email}</span>}
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
              onChange={(event) => updateField("password", event.target.value, setPassword)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "user-password-error" : undefined}
            />
            {errors.password && <span className="user-form-error" id="user-password-error">{errors.password}</span>}
          </label>

          <label className="user-form-field" htmlFor="user-role">
            <span>Role</span>
            <select
              id="user-role"
              name="role"
              value={role}
              onChange={(event) => updateField("role", event.target.value, setRole)}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? "user-role-error" : undefined}
            >
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="learner">Learner</option>
            </select>
            {errors.role && <span className="user-form-error" id="user-role-error">{errors.role}</span>}
          </label>

          <label className="user-form-field" htmlFor="user-status">
            <span>Status</span>
            <select
              id="user-status"
              name="status"
              value={status}
              onChange={(event) => updateField("status", event.target.value, setStatus)}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? "user-status-error" : undefined}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            {errors.status && <span className="user-form-error" id="user-status-error">{errors.status}</span>}
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