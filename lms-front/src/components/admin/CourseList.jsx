import "./CourseList.css";
import CourseCard from "./CourseCard";

function CourseList({
  courses = [],
  isLoading = false,
  hasLoaded = false,
  loadError = "",
  onRefresh,
  onCreateCourse,
}) {
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

      {loadError ? (
        <div className="course-empty-state course-load-error" role="alert">
          {loadError}
        </div>
      ) : isLoading ? (
        <div className="course-empty-state" role="status">Loading courses...</div>
      ) : !hasLoaded ? (
        <div className="course-empty-state">Select “Load courses” to view published courses.</div>
      ) : courseRows.length === 0 ? (
        <div className="course-empty-state">No published courses found.</div>
      ) : (
        <>
          <p className="course-load-success" role="status">
            Loaded {courseRows.length} published {courseRows.length === 1 ? "course" : "courses"}.
          </p>
        <section className="course-card-grid" aria-label="Courses">
          {courseRows.map((course) => (
            <CourseCard
              key={course._id || course.id}
              course={course}
            />
          ))}
        </section>
        </>
      )}

      <footer className="course-list-footer">
        <p>
          {hasLoaded && !loadError
            ? <>Showing <strong>{courseRows.length}</strong> published courses</>
            : "Published courses"}
        </p>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "Loading..." : hasLoaded ? "Refresh courses" : "Load courses"}
        </button>
      </footer>
    </section>
  );
}

export default CourseList;