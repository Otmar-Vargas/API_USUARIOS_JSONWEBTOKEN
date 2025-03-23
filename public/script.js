document.addEventListener("DOMContentLoaded", () => {
  const userList = document.getElementById("user-list");
  const createUserForm = document.getElementById("create-user-form");
  const recommendationsList = document.getElementById("recommendations-list");
  const reputationResult = document.getElementById("reputation-result");
  const activityResult = document.getElementById("activity-result");
  const activitiesList = document.getElementById("activities-list");
  // Función para cargar y mostrar los usuarios
  const loadUsers = async () => {
    try {
      const response = await fetch("/apiV1/users");
      const users = await response.json();
      userList.innerHTML = ""; // Limpiar la lista
      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.nombre || "Sin nombre"} | ${user.correo || "Sin correo"} | ID: ${user.id}`;
        userList.appendChild(li);
      });
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    }
  };

  const createUser = async (name, email, age, street, city, country) => {
    try {
      // Estructura completa del usuario con valores predeterminados
      const userData = {
        nombre: name,
        correo: email,
        edad: age || null, // Si no se proporciona una edad, se establece como null
        esAdministrador: false, // Valor predeterminado
        intereses: [], // Array vacío por defecto
        fechaRegistro: new Date().toISOString(), // Fecha y hora actual en formato ISO
        direccion: {
          calle: street || "", // Si no se proporciona una calle, se establece como cadena vacía
          ciudad: city || "", // Si no se proporciona una ciudad, se establece como cadena vacía
          pais: country || "", // Si no se proporciona un país, se establece como cadena vacía
        },
        actividad: [], // Array vacío por defecto
      };

      const response = await fetch("/apiV1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        loadUsers(); // Recargar la lista de usuarios
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  };

  createUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("user-name").value;
    const email = document.getElementById("user-email").value;
    const age = document.getElementById("user-age").value;
    const street = document.getElementById("user-street").value;
    const city = document.getElementById("user-city").value;
    const country = document.getElementById("user-country").value;
    if (name && email) {
      createUser(name, email, age, street, city, country);
      createUserForm.reset(); // Limpiar los campos de texto
    }
  });

  // Función para obtener recomendaciones de usuarios
  const getRecommendations = async (userId) => {
    try {
      const response = await fetch(`/apiV1/users/recommend/${userId}`);
      const data = await response.json();
      console.log(data);
      recommendationsList.innerHTML = ""; // Limpiar la lista
      if (data.recomendaciones && data.recomendaciones.length > 0) {
        data.recomendaciones.forEach((user) => {
          const li = document.createElement("li");
          li.textContent = `${user.nombre} - Intereses: ${user.intereses.join(
            ", "
          )}`;
          recommendationsList.appendChild(li);
        });
      } else {
        recommendationsList.innerHTML =
          "<li>No hay recomendaciones para este usuario.</li>";
      }
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
    }
  };

  // Función para obtener la reputación de un usuario
  const getReputation = async (userId) => {
    try {
      const response = await fetch(`/apiV1/users/reputation/${userId}`);
      const data = await response.json();
      console.log(data);
      reputationResult.innerHTML = `
                <p><strong>Usuario:</strong> ${data.user.nombre}</p>
                <p><strong>Reputación:</strong> ${data.reputacion}</p>
                <p><strong>Días sin actividad:</strong> ${data.diasSinActividad}</p>
            `;
    } catch (error) {
      console.error("Error al obtener la reputación:", error);
      reputationResult.innerHTML = "<li>Usuario sin reputación</li>";
    }
  };

  // Manejar el envío del formulario de creación de usuario

  // Manejar el envío del formulario de recomendaciones
  const getRecommendationsForm = document.getElementById(
    "get-recommendations-form"
  );
  getRecommendationsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = document.getElementById("user-id-recommendations").value.trim();
    if (userId) {
      getRecommendations(userId);
    }
  });

  // Manejar el envío del formulario de reputación
  const getReputationForm = document.getElementById("get-reputation-form");
  getReputationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = document.getElementById("user-id-reputation").value.trim();
    if (userId) {
      getReputation(userId);
    }
  });

  const addActivity = async (userId, accion) => {
    try {
      const response = await fetch(`/apiV1/users/${userId}/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accion }),
      });
      const data = await response.json();
      if (response.ok) {
        activityResult.innerHTML = `<li>${data.message}</li>`;
      } else {
        activityResult.innerHTML = `<li>Error: ${data.error || "Error al agregar la actividad"}</li>`;
      }
    } catch (error) {
      console.error("Error al agregar la actividad:", error);
    }
  };

  // Función para visualizar las actividades de un usuario
  const viewActivities = async (userId) => {
    try {
      const response = await fetch(`/apiV1/users/${userId}`);
      const user = await response.json();
      activitiesList.innerHTML = ""; // Limpiar la lista
      if (user.actividad && user.actividad.length > 0) {
        user.actividad.forEach((act) => {
          const li = document.createElement("li");
          li.textContent = `${act.fecha}: ${act.accion}`;
          activitiesList.appendChild(li);
        });
      } else {
        activitiesList.innerHTML =
          "<li>No hay actividades para este usuario.</li>";
      }
    } catch (error) {
      console.error("Error al obtener las actividades:", error);
    }
  };

  // Manejar el envío del formulario de creación de usuario

  // Manejar el envío del formulario de agregar actividad
  const addActivityForm = document.getElementById("add-activity-form");
  addActivityForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = document.getElementById("user-id-activity").value.trim();
    const accion = document.getElementById("activity-action").value;
    if (userId && accion) {
      addActivity(userId, accion);
    }
  });

  // Manejar el envío del formulario de visualizar actividades
  const viewActivitiesForm = document.getElementById("view-activities-form");
  viewActivitiesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = document.getElementById("user-id-view-activities").value.trim();
    if (userId) {
      viewActivities(userId);
    }
  });
  // Cargar los usuarios al iniciar la página
  loadUsers();
});
