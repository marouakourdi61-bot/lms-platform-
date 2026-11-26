
import Icon from "./Icon";
import "./LearnerCourseCard.css";

function LearnerCourseCard({ course }) {
  return (
    <article className="learner-course-card">
      <div className="learner-course-card-top">
        <div className="learner-course-card-icon">
          <Icon name="book-open" />
        </div>

        <span className="learner-course-card-category">
          {course.category || "General"}
        </span>
      </div>

      <div className="learner-course-card-content">
        <h3>{course.title}</h3>

        <p className="learner-course-card-description">
          {course.description || "No description available."}
        </p>

        <div className="learner-course-card-details">
          <div>
            <span>Level</span>
            <strong>{course.level || "Not specified"}</strong>
          </div>

          <div>
            <span>Duration</span>
            <strong>
              {course.estimatedDuration
                ? `${course.estimatedDuration}`
                : "Not specified"}
            </strong>
          </div>
        </div>

        <div className="learner-course-card-footer">
          <span className="learner-course-card-status">
            <Icon name="check-circle" />
            Enrolled
          </span>
        </div>
      </div>
    </article>
  );
}

export default LearnerCourseCard;
