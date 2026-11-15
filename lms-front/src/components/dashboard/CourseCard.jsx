import Icon from "./Icon";
import "./CourseCard.css";

function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div className="course-image-wrap">
        <img className="course-image" src={course.image} alt={course.title} />
        <span className="course-category">{course.category}</span>
      </div>
      <div className="course-card-content">
        <h3>{course.title}</h3>
        <div className="course-instructor">
          <span className="instructor-avatar">{course.initials}</span>
          <span>{course.instructor}</span>
        </div>
        <div className="course-meta">
          <span><Icon name="book" />{course.lessons} lessons</span>
          <span><Icon name="people" />{course.learners} learners</span>
        </div>
        <div className="course-progress">
          <div className="course-progress-label">
            <span>Course progress</span>
            <strong>{course.progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${course.progress}%` }} />
          </div>
        </div>
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