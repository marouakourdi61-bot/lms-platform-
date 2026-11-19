import Icon from "./Icon";
import "./CourseCard.css";

function CourseCard({ course, variant = "learning" }) {
  if (variant === "management") {
    return (
      <article className="course-card course-card--management">
        <div className="course-management-visual">
          <span className="course-management-mark" aria-hidden="true">
            <Icon name="book" />
          </span>
          <span className="course-category">{course.category || "—"}</span>
          <span
            className="course-management-status"
            data-status={course.status || "unknown"}
          >
            {course.status || "—"}
          </span>
        </div>
        <div className="course-card-content course-management-content">
          <h3>{course.title || "—"}</h3>
          <p className="course-management-description">
            {course.description || "No description provided."}
          </p>
          <div className="course-management-details">
            <div>
              <span>Level</span>
              <strong>{course.level || "—"}</strong>
            </div>
            <div>
              <span>Estimated duration</span>
              <strong>{course.estimatedDuration ?? "—"}</strong>
            </div>
          </div>
        </div>
        <div className="course-card-action course-management-actions">
          <button className="course-management-view" type="button">View details</button>
          <button className="course-management-edit" type="button" aria-label="Edit course">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 5 4 4M4 20l4-.8L19.2 8a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z" />
            </svg>
          </button>
          <button className="course-management-archive" type="button">Archive</button>
        </div>
      </article>
    );
  }

  return (
    <article className="course-card">
      <div className="course-image-wrap">
        {course.image && <img className="course-image" src={course.image} alt={course.title || ""} />}
        {course.category && <span className="course-category">{course.category}</span>}
      </div>
      <div className="course-card-content">
        {course.title && <h3>{course.title}</h3>}
        {course.instructor && (
          <div className="course-instructor">
            {course.initials && <span className="instructor-avatar">{course.initials}</span>}
            <span>{course.instructor}</span>
          </div>
        )}
        {(course.lessons != null || course.learners != null) && (
          <div className="course-meta">
            {course.lessons != null && <span><Icon name="book" />{course.lessons} lessons</span>}
            {course.learners != null && <span><Icon name="people" />{course.learners} learners</span>}
          </div>
        )}
        {typeof course.progress === "number" && <div className="course-progress">
          <div className="course-progress-label">
            <span>Course progress</span>
            <strong>{course.progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${course.progress}%` }} />
          </div>
        </div>}
      </div>
      <div className="course-card-action">
        <span className="course-action-label">
          Continue learning <Icon name="arrow" />
        </span>
      </div>
    </article>
  );
}

export default CourseCard;
