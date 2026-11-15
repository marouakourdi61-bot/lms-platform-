import "./CourseList.css";
import CourseCard from "./CourseCard";

function CourseList({ courses = [], onCreateCourse }) {
  const courseRows = Array.isArray(courses) ? courses : [];

  return (
    <section className="course-management" aria-labelledby="course-list-title">
      <div className="course-management-heading">
        <div>
          <span className="course-management-eyebrow">Learning</span>
          <h1 id="course-list-title">Course Management</h1>
          <p>Browse courses in your LMS Platform workspace.</p>
        </div>
        <button className="course-create-button" type="button" onClick={onCreateCourse}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Create course
        </button>
      </div>

      <section className="course-controls" aria-label="Course search and filters">
        <label className="course-search">
          <span className="visually-hidden">Search courses</span>
          <input type="search" placeholder="Search courses..." readOnly />
        </label>
        <div className="course-filter-labels" aria-hidden="true">
          <span>All categories</span>
          <span>All statuses</span>
        </div>
      </section>

      {courseRows.length === 0 ? (
        <div className="course-empty-state">No courses to display.</div>
      ) : (
        <section className="course-card-grid" aria-label="Courses">
          {courseRows.map((course) => (
            <CourseCard
              key={course._id || course.id}
              course={course}
            />
          ))}
        </section>
      )}

      <footer className="course-list-footer">
        <p>Showing <strong>{courseRows.length}</strong> courses</p>
        <button type="button" disabled>Load more</button>
      </footer>
    </section>
  );
}

export default CourseList;