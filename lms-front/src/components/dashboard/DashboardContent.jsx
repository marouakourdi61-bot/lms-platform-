import { useCallback, useState } from "react";
import { getMyEnrollments } from "../../services/api";
import CourseCard from "./CourseCard";
import Icon from "./Icon";
import StatCard from "./StatCard";
import "./DashboardContent.css";

function DashboardContent({ user, token }) {
  const [enrollmentState, setEnrollmentState] = useState({
    status: "loading",
    enrollments: [],
    error: "",
  });
  const [loadGuard] = useState(() => ({ started: false }));

  const loadEnrollments = useCallback(async () => {
    setEnrollmentState({ status: "loading", enrollments: [], error: "" });
    try {
      const enrollments = await getMyEnrollments(token);
      setEnrollmentState({ status: "success", enrollments, error: "" });
    } catch (error) {
      setEnrollmentState({ status: "error", enrollments: [], error: error.message });
    }
  }, [token]);

  // Start the initial request from a callback ref to honor the no-useEffect constraint.
  const startInitialLoad = useCallback((element) => {
    if (element && !loadGuard.started) {
      loadGuard.started = true;
      loadEnrollments();
    }
  }, [loadEnrollments, loadGuard]);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const enrollments = enrollmentState.enrollments;
  const courses = enrollments
    .filter((enrollment) => enrollment.course && typeof enrollment.course === "object")
    .map((enrollment) => ({
      ...enrollment.course,
      progress: enrollment.progress,
      enrollmentId: enrollment._id,
    }));
  const inProgressCount = enrollments.filter((enrollment) => enrollment.status === "active").length;
  const completedCount = enrollments.filter((enrollment) => enrollment.status === "completed").length;

  return (
    <>
      <section className="welcome-banner">
        <div className="banner-orbits" aria-hidden="true">
          <span /><span /><span />
          <i className="orbit-dot orbit-dot-cyan" />
          <i className="orbit-dot orbit-dot-amber" />
        </div>
        <div className="welcome-copy">
          <span className="welcome-date">{today}</span>
          <h1>Welcome back, <span className="welcome-name">{user?.name || "Learner"}</span>.</h1>
          <p>Small steps add up. Keep building your skills and moving toward your goals.</p>
          <span className="welcome-action">Continue learning <Icon name="arrow" /></span>
        </div>
      </section>

      {enrollmentState.status === "success" && (
        <section className="metrics-grid" aria-label="Learning metrics">
          <StatCard icon="book" tone="purple" value={inProgressCount} label="Courses in progress" />
          <StatCard icon="check" tone="teal" value={completedCount} label="Courses completed" />
        </section>
      )}

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <h2>Continue learning</h2>
            <p>Jump back into your enrolled courses.</p>
          </div>
          <span className="section-link">View all courses <Icon name="chevron" /></span>
        </div>
        <div className="course-grid" ref={startInitialLoad}>
          {enrollmentState.status === "loading" && (
            <p className="dashboard-feedback" role="status">Loading your courses...</p>
          )}
          {enrollmentState.status === "error" && (
            <p className="dashboard-feedback dashboard-feedback--error" role="alert">
              {enrollmentState.error}
              <button type="button" onClick={loadEnrollments}>Retry</button>
            </p>
          )}
          {enrollmentState.status === "success" && courses.length === 0 && (
            <p className="dashboard-feedback" role="status">You have no enrolled courses yet.</p>
          )}
          {enrollmentState.status === "success" && courses.map((course) => (
            <CourseCard key={course.enrollmentId} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}

export default DashboardContent;
