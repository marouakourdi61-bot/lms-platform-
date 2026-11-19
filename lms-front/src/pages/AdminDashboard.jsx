
import { useState } from "react";
import AdminOverview from "../components/admin/AdminOverview";
import AdminSidebar from "../components/admin/AdminSidebar";
import CourseList from "../components/admin/CourseList";
import CourseForm from "../components/admin/CourseForm";
import UserList from "../components/admin/UserList";
import Header from "../components/dashboard/Header";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getPublishedCourses,
  createCourse,
  updateCourse,
} from "../services/api";
import { temporaryUserListDemoUsers } from "../data/userListDemoData";

function AdminDashboard({ user, token, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [hasLoadedCourses, setHasLoadedCourses] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseFormError, setCourseFormError] = useState("");
  const [courseNotice, setCourseNotice] = useState("");

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
      setCourseNotice("");
      loadCourses();
    }
  }

  function handleCreateCourse() {
    setSelectedCourse(null);
    setCourseFormError("");
    setActivePage("create-course");
  }

  function handleEditCourse(course) {
    setSelectedCourse(course);
    setCourseFormError("");
    setActivePage("edit-course");
  }

  async function handleSaveCourse(courseData) {
    setIsSavingCourse(true);
    setCourseFormError("");
    setCourseNotice("");

    try {
      if (selectedCourse) {
        await updateCourse(token, selectedCourse._id, courseData);
        setCourseNotice("Course updated successfully.");
      } else {
        await createCourse(token, courseData);
        setCourseNotice(
          "Course created successfully as a draft. Draft courses are not displayed in the published courses list."
        );
      }

      setSelectedCourse(null);
      setActivePage("courses");
      await loadCourses();
    } catch (error) {
      setCourseFormError(
        error.message || "Impossible d'enregistrer le cours."
      );
    } finally {
      setIsSavingCourse(false);
    }
  }

  function handleCancelCourseForm() {
    setSelectedCourse(null);
    setCourseFormError("");
    setActivePage("courses");
    setCourseNotice("");
    loadCourses();
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
      {activePage === "create-course" || activePage === "edit-course" ? (
        <CourseForm
          key={selectedCourse?._id || "new-course"}
          initialCourse={selectedCourse}
          onCancel={handleCancelCourseForm}
          onSubmit={handleSaveCourse}
          isSaving={isSavingCourse}
          submitError={courseFormError}
        />
      ) : activePage === "users" ? (
        <UserList users={temporaryUserListDemoUsers} />
      ) : activePage === "courses" ? (
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
            onCreateCourse={handleCreateCourse}
            onEditCourse={handleEditCourse}
          />
        </>
      ) : (
        <AdminOverview user={user} />
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
