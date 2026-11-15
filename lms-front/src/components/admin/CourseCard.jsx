import Icon from "../dashboard/Icon";
import "./CourseCard.css";

function CourseCard({ course }) {
  return (
    <article className="admin-course-card">
      <div className="admin-course-card-top">
        <span className="admin-course-card-icon" aria-hidden="true">
          <Icon name="book" />
        </span>
        <span className="admin-course-card-category">
          {course.category || "—"}
        </span>
      </div>

      <div className="admin-course-card-content">
        <h2>{course.title || "—"}</h2>

        <div className="admin-course-card-details">
          <div>
            <span>Level</span>
            <strong>{course.level || "—"}</strong>
          </div>
          <div>
            <span>Estimated duration</span>
            <strong>{course.estimatedDuration ?? "—"}</strong>
          </div>
        </div>

        <span
          className="admin-course-card-status"
          data-status={course.status || "unknown"}
        >
          {course.status || "—"}
        </span>
      </div>
    </article>
  );
}

export default CourseCard;