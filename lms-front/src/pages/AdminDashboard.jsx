import { useState } from "react";
import AdminOverview from "../components/admin/AdminOverview";
import AdminSidebar from "../components/admin/AdminSidebar";
import CourseList from "../components/admin/CourseList";
import CourseForm from "../components/admin/CourseForm";
import UserList from "../components/admin/UserList";
import Header from "../components/dashboard/Header";
import DashboardLayout from "../layouts/DashboardLayout";
import { getPublishedCourses } from "../services/api";
import { temporaryUserListDemoUsers } from "../data/userListDemoData";

function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [hasLoadedCourses, setHasLoadedCourses] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  async function loadCourses(filters = {}) {
    if (isCoursesLoading) {
      return;
    }

    setIsCoursesLoading(true);
    setCoursesError("");

    try {
      const loadedCourses = await getPublishedCourses(filters);
      setCourses(loadedCourses);
      setHasLoadedCourses(true);

      if (!filters.keyword && !filters.category && !filters.level) {
        const categories = [];
        loadedCourses.forEach((course) => {
          if (course.category && !categories.includes(course.category)) {
            categories.push(course.category);
          }
        });
        setCourseCategories(categories);
      }
    } catch (error) {
      setCoursesError(error.message || "Impossible de charger les cours.");
    } finally {
      setIsCoursesLoading(false);
    }
  }

  function handleNavigation(page) {
    if (page === activePage) {
      return;
    }

    setActivePage(page);

    if (page === "courses") {
      loadCourses();
    }
  }

  return (
    <DashboardLayout
      sidebar={
        <AdminSidebar
          activePage={activePage}
          onNavigate={handleNavigation}
          onLogout={onLogout}
          userCount={temporaryUserListDemoUsers.length}
        />
      }
      header={<Header user={user} />}
    >
      {activePage === "create-course" ? (
        <CourseForm onCancel={() => handleNavigation("courses")} />
      ) : activePage === "users" ? (
        <UserList users={temporaryUserListDemoUsers} />
      ) : activePage === "courses" ? (
        <CourseList
          courses={courses}
          categories={courseCategories}
          isLoading={isCoursesLoading}
          hasLoaded={hasLoadedCourses}
          loadError={coursesError}
          onApplyFilters={loadCourses}
          onRefresh={loadCourses}
          onCreateCourse={() => setActivePage("create-course")}
        />
      ) : (
        <AdminOverview user={user} />
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;