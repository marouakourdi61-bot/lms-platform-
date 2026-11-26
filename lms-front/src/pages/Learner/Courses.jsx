import { useEffect, useState } from "react";
import {
  getPublishedCourses, enrollInCourse, getMyEnrollments,
} from "../../services/api";
import "./Courses.css";

function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [success, setSuccess] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");

 useEffect(() => {
  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const [coursesData, enrollmentsData] = await Promise.all([
        getPublishedCourses(),
        getMyEnrollments(token),
      ]);

      setCourses(coursesData);

      const ids = enrollmentsData.map(
        (enrollment) => enrollment.course._id
      );

      setEnrolledIds(ids);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Erreur lors du chargement des données."
      );
    } finally {
      setLoading(false);
    }
  }

  loadCourses();
}, [token]);

  async function handleEnroll(courseId) {
    try {
      setEnrollingId(courseId);
      setEnrollmentError("");
      setSuccess("");

      await enrollInCourse(token, courseId);

      setEnrolledIds((previousIds) => [...previousIds, courseId]);
      setSuccess("Inscription réussie !");
    } catch (error) {
      setEnrollmentError(
        error.response?.data?.message || "Erreur lors de l'inscription."
      );
    } finally {
      setEnrollingId(null);
    }
  }
  return (
    <section className="courses-page">
      <header className="courses-header">
        <h1>Explore our courses</h1>
        <p>Discover new skills and start your learning journey.</p>
      </header>

      {success && <p role="status">{success}</p>}

      {enrollmentError && (
        <p role="alert" className="courses-error">
          {enrollmentError}
        </p>
      )}

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
          {courses.map((course) => {
            const isEnrolled = enrolledIds.includes(course._id);
            const isEnrolling = enrollingId === course._id;

            return (
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
                  <button
                    type="button"
                    disabled={isEnrolled || isEnrolling}
                    onClick={() => handleEnroll(course._id)}
                  >
                    {isEnrolled
                      ? "Already enrolled"
                      : isEnrolling
                        ? "Inscription..."
                        : "S'inscrire"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Courses;