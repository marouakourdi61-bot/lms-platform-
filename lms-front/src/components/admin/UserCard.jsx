import "./UserCard.css";

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function formatJoinedDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function UserCard({ user }) {
  return (
    <tr className="user-card-row">
      <td className="user-card-user-cell">
        <span className="user-card-avatar">{getInitials(user.name)}</span>
        <span className="user-card-identity">
          <strong>{user.name || "—"}</strong>
          <span>{user.email || "—"}</span>
        </span>
      </td>
      <td>
        <span className="user-card-role">{user.role || "—"}</span>
      </td>
      <td>
        <span
          className="user-card-status"
          data-status={user.status || "unknown"}
        >
          <i aria-hidden="true" />
          {user.status || "—"}
        </span>
      </td>
      <td className="user-card-date">{formatJoinedDate(user.createdAt)}</td>
      <td>
        <div className="user-card-actions">
          <button type="button" aria-label={`Edit ${user.name || "user"}`} title="Edit">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 5 4 4M4 20l4-.8L19.2 8a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z" />
            </svg>
          </button>
          <button type="button" aria-label={`Delete ${user.name || "user"}`} title="Delete">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
          <button type="button" aria-label={`More actions for ${user.name || "user"}`} title="More actions">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default UserCard;