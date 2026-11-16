import { useState } from "react";
import "./CourseList.css";
import CourseCard from "./CourseCard";

function CourseList({
  courses = [],
  isLoading = false,
  hasLoaded = false,
  loadError = "",
  categories = [],
  onApplyFilters,
  onRefresh,
  onCreateCourse,
}) {
  const courseRows = Array.isArray(courses) ? courses : [];
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const hasActiveFilters = Boolean(keyword.trim() || selectedCategory || selectedLevel);

  function getCurrentFilters() {
    return {
      keyword: keyword.trim(),
      category: selectedCategory,
      level: selectedLevel,
    };
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    onApplyFilters(getCurrentFilters());
  }

  function handleResetFilters() {
    setKeyword("");
    setSelectedCategory("");
    setSelectedLevel("");
    onApplyFilters({});
  }

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

      <form className="course-controls" onSubmit={handleApplyFilters} aria-label="Course search and filters">
        <label className="course-search">
          <span className="visually-hidden">Search courses</span>
          <input
            type="search"
            placeholder="Search courses..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>
        <div className="course-filter-labels">
          <label>
            <span className="visually-hidden">Filter by category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="visually-hidden">Filter by level</span>
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <button type="submit" disabled={isLoading}>Apply filters</button>
          <button type="button" onClick={handleResetFilters} disabled={isLoading}>
            Reset filters
          </button>
        </div>
      </form>

      {loadError ? (
        <div className="course-empty-state course-load-error" role="alert">
          {loadError}
        </div>
      ) : isLoading ? (
        <div className="course-empty-state" role="status">Loading courses...</div>
      ) : !hasLoaded ? (
        <div className="course-empty-state">Select “Load courses” to view published courses.</div>
      ) : courseRows.length === 0 ? (
        <div className="course-empty-state">
          {hasActiveFilters ? "No courses match your filters." : "No published courses found."}
        </div>
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
        <button type="button" onClick={() => onRefresh(getCurrentFilters())} disabled={isLoading}>
          {isLoading ? "Loading..." : hasLoaded ? "Refresh courses" : "Load courses"}
        </button>
      </footer>
    </section>
  );
}

export default CourseList;