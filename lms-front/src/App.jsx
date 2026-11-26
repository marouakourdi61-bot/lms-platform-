import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login/Login";

import DashboardContent from "./components/dashboard/DashboardContent";
import Courses from "./pages/Learner/Courses";
import MyCourses from "./pages/Learner/MyCourses";
import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import AdminOverview from "./components/admin/AdminOverview";
import CourseList from "./components/admin/CourseList";
import CourseForm from "./components/admin/CourseForm";
import UserList from "./components/admin/UserList";

import { AuthProvider, useAuth } from "./context/AuthContext";


function AdminOverviewPage() {
  const { user } = useOutletContext();
  return <AdminOverview user={user} />;
}

function AdminUsersPage() {
  const { users } = useOutletContext();
  return <UserList users={users} />;
}

function AdminCoursesPage() {
  const {
    courses,
    courseCategories,
    isCoursesLoading,
    hasLoadedCourses,
    coursesError,
    courseNotice,
    setCourseNotice,
    loadCourses,
    handleCreateCourse,
    handleEditCourse,
  } = useOutletContext();

  useEffect(() => {
    if (!hasLoadedCourses) {
      loadCourses();
    }
  }, [hasLoadedCourses]);

  return (
    <>
      {courseNotice && (
        <p className="course-load-success" role="status">
          {courseNotice}
        </p>
      )}

      <CourseList
        courses={courses}
        categories={courseCategories}
        isLoading={isCoursesLoading}
        hasLoaded={hasLoadedCourses}
        loadError={coursesError}
        onApplyFilters={loadCourses}
        onRefresh={loadCourses}
        onCreateCourse={() => {
          setCourseNotice("");
          handleCreateCourse();
        }}
        onEditCourse={handleEditCourse}
      />
    </>
  );
}

function AdminCourseFormPage() {
  const {
    courses,
    hasLoadedCourses,
    selectedCourse,
    setSelectedCourse,
    isSavingCourse,
    courseFormError,
    loadCourses,
    handleSaveCourse,
    handleCancelCourseForm,
  } = useOutletContext();

  const { courseId } = useParams();

  useEffect(() => {
    if (courseId && !hasLoadedCourses) {
      loadCourses();
    }
  }, [courseId, hasLoadedCourses]);

  const courseToEdit = courseId
    ? selectedCourse?._id === courseId
      ? selectedCourse
      : courses.find((course) => course._id === courseId)
    : null;

  useEffect(() => {
    if (courseId && courseToEdit && selectedCourse?._id !== courseId) {
      setSelectedCourse(courseToEdit);
    }
  }, [courseId, courseToEdit, selectedCourse, setSelectedCourse]);

  if (courseId && !hasLoadedCourses) {
    return <p>Loading course...</p>;
  }

  if (courseId && !courseToEdit) {
    return <p>Course not found.</p>;
  }

  return (
    <CourseForm
      key={courseId || "new-course"}
      initialCourse={courseToEdit}
      onCancel={handleCancelCourseForm}
      onSubmit={handleSaveCourse}
      isSaving={isSavingCourse}
      submitError={courseFormError}
    />
  );
}


function AppContent() {
  const { user, token, loading, handleLogin, logout } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  const isAdmin = user.role === "admin";

  const dashboardPath = isAdmin
    ? "/admin/dashboard"
    : "/learner/dashboard";

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={dashboardPath} replace />}
      />

      <Route
        path="/login"
        element={<Navigate to={dashboardPath} replace />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard
              user={user}
              token={token}
              onLogout={logout}
            />
          ) : (
            <Navigate to={dashboardPath} replace />
          )
        }
      >
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<AdminOverviewPage />}
        />

        <Route
          path="users"
          element={<AdminUsersPage />}
        />

        <Route
          path="courses"
          element={<AdminCoursesPage />}
        />

        <Route
          path="courses/new"
          element={<AdminCourseFormPage />}
        />

        <Route
          path="courses/:courseId/edit"
          element={<AdminCourseFormPage />}
        />
      </Route>

      {/* Learner Routes */}
      <Route
        path="/learner"
        element={
          !isAdmin ? (
            <Dashboard
              user={user}
              onLogout={logout}
            />
          ) : (
            <Navigate to={dashboardPath} replace />
          )
        }
      >
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={
            <DashboardContent user={user} token={token} />
          }
        />

        <Route
          path="courses"
          element={<Courses token={token} />}
        />

        <Route
          path="my-courses"
          element={<MyCourses token={token} />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={dashboardPath} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
