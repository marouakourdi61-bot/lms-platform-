const API_URL = import.meta.env.VITE_API_URL || "";

async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Erreur lors de la connexion.");
  }

  return result.data;
}

async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de récupérer le profil.");
  }

  return result.data;
}

async function getPublishedCourses(filters = {}) {
  const query = new URLSearchParams();
  const keyword = filters.keyword?.trim();

  if (keyword) {
    query.set("keyword", keyword);
  }
  if (filters.category) {
    query.set("category", filters.category);
  }
  if (filters.level) {
    query.set("level", filters.level);
  }

  const queryString = query.toString();
  const url = queryString
    ? `${API_URL}/api/courses?${queryString}`
    : `${API_URL}/api/courses`;
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de charger les cours.");
  }

  if (!Array.isArray(result.data)) {
    throw new Error("Réponse invalide lors du chargement des cours.");
  }

  return result.data;
}

async function getMyEnrollments(token) {
  const response = await fetch(`${API_URL}/api/enrollments/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de charger vos inscriptions.");
  }
  if (!Array.isArray(result)) {
    throw new Error("Réponse invalide lors du chargement des inscriptions.");
  }
  return result;
}



async function createCourse(token, courseData) {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de créer le cours.");
  }

  return result.data;
}

async function updateCourse(token, courseId, courseData) {
  const response = await fetch(
    `${API_URL}/api/courses/${encodeURIComponent(courseId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de modifier le cours.");
  }

  return result.data;
}


export { API_URL, getCurrentUser, getPublishedCourses, getMyEnrollments, login, createCourse, updateCourse };
