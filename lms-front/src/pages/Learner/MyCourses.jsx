
import { useEffect, useState } from "react";
import { getMyEnrollments } from "../../services/api";
import LearnerCourseCard from "../../components/dashboard/LearnerCourseCard";
import "./MyCourses.css";

function MyCourses({ token }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyCourses() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyEnrollments(token);
        setEnrollments(data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Erreur lors du chargement de vos cours."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMyCourses();
  }, [token]);

  const courses = enrollments
    .filter(
      (enrollment) =>
        enrollment.course &&
        typeof enrollment.course === "object"
    )
    .map((enrollment) => ({
      ...enrollment.course,
      enrollmentId: enrollment._id,
    }));

  return (
    <section className="my-courses-page">
      <header className="my-courses-header">
        <h1>My Courses</h1>
        <p>Continue learning with the courses you enrolled in.</p>
      </header>

      {loading && (
        <p role="status">Loading your courses...</p>
      )}

      {error && (
        <p role="alert" className="my-courses-error">
          {error}
        </p>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="my-courses-empty">
          <h3>No courses yet</h3>
          <p>You have not enrolled in any courses yet.</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="my-courses-grid">
          {courses.map((course) => (
            <LearnerCourseCard
              key={course.enrollmentId}
              course={course}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyCourses;
