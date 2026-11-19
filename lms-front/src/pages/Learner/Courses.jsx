import { useEffect, useState } from "react";
import { getPublishedCourses } from "../../services/api";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublishedCourses({}, controller.signal);

        setCourses(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="courses-page">
      <header className="courses-header">
        <h1>Explore our courses</h1>
        <p>Discover new skills and start your learning journey.</p>
      </header>

      {loading && (
        <p role="status">Loading courses...</p>
      )}

      {error && (
        <p role="alert" className="courses-error">
          {error}
        </p>
      )}

      {!loading && !error && courses.length === 0 && (
        <p>No courses available at the moment.</p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="courses-grid">
          {courses.map((course) => (
            <article className="catalog-course-card" key={course._id}>
              <div className="catalog-course-content">
                <span className="catalog-course-category">
                  {course.category || "General"}
                </span>

                <h2>{course.title}</h2>

                <p>
                  {course.description || "No description available."}
                </p>

                <div className="catalog-course-info">
                  <span>Level: {course.level || "Not specified"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Courses;