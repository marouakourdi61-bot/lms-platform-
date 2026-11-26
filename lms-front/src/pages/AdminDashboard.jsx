
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import Header from "../components/dashboard/Header";
import DashboardLayout from "../layouts/DashboardLayout";

import {
  getPublishedCourses,
  createCourse,
  updateCourse,
} from "../services/api";

import { temporaryUserListDemoUsers } from "../data/userListDemoData";

function AdminDashboard({ user, token, onLogout }) {
  const navigate = useNavigate();

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

  function handleCreateCourse() {
    setSelectedCourse(null);
    setCourseFormError("");
    setCourseNotice("");

    navigate("/admin/courses/new");
  }

  function handleEditCourse(course) {
    setSelectedCourse(course);
    setCourseFormError("");

    navigate(`/admin/courses/${course._id}/edit`);
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
      await loadCourses();
      navigate("/admin/courses");
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
    setCourseNotice("");

    navigate("/admin/courses");
  }

  return (
    <DashboardLayout
      sidebar={
        <AdminSidebar
          onLogout={onLogout}
          userCount={temporaryUserListDemoUsers.length}
        />
      }
      header={<Header user={user} />}
    >
      <Outlet
        context={{
          user,
          token,
          courses,
          courseCategories,
          isCoursesLoading,
          hasLoadedCourses,
          coursesError,
          selectedCourse,
          setSelectedCourse,
          isSavingCourse,
          courseFormError,
          courseNotice,
          setCourseNotice,
          loadCourses,
          handleCreateCourse,
          handleEditCourse,
          handleSaveCourse,
          handleCancelCourseForm,
          users: temporaryUserListDemoUsers,
        }}

      />
    </DashboardLayout>
  );
}

export default AdminDashboard;
