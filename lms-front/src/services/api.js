import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "";

const client = axios.create({
  baseURL: API_URL
})


// Login
async function login(email, password) {
  const response = await client.post("/api/auth/login", {
    email,
    password,
  });

  return response.data.data;
}

// Récupérer l'utilisateur connecté
async function getCurrentUser(token) {
  const response = await client.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

// Récupérer les cours publiés
async function getPublishedCourses(filters = {}) {
  const query = new URLSearchParams();

  const keyword = filters.keyword?.trim();

  if (keyword) query.set("keyword", keyword);
  if (filters.category) query.set("category", filters.category);
  if (filters.level) query.set("level", filters.level);
  if (filters.sortBy) query.set("sortBy", filters.sortBy);

  const response = await client.get("/api/courses", {
    params: query,
  });

  const courses = response.data.data;

  if (!Array.isArray(courses)) {
    throw new Error("Réponse invalide lors du chargement des cours.");
  }

  return courses;
}

// Récupérer les inscriptions de l'utilisateur
async function getMyEnrollments(token) {
  const response = await client.get("/api/enrollments/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const enrollments = response.data.data ?? response.data;

  if (!Array.isArray(enrollments)) {
    throw new Error("Réponse invalide lors du chargement des inscriptions.");
  }

  return enrollments;
}

//s'inscrire a un coure

async function enrollInCourse(token, courseId) {
  const response = await client.post(
    `/api/courses/${encodeURIComponent(courseId)}/enroll`,
    {},

    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }

  );

  return response.data.data;
}

// Créer un cours
async function createCourse(token, courseData) {
  const response = await client.post("/api/courses", courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

// Modifier un cours
async function updateCourse(token, courseId, courseData) {
  const response = await client.put(
    `/api/courses/${encodeURIComponent(courseId)}`,
    courseData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
}

export {
  login,
  getCurrentUser,
  getPublishedCourses,
  getMyEnrollments,
  enrollInCourse,
  createCourse,
  updateCourse,
};

export default client;
