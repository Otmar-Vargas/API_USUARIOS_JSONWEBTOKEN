// controllers/UsersController.js
const db = require("../models/firebase.js");
const {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} = require("firebase/firestore");

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const docRef = await addDoc(collection(db, "users"), userData);
    res.status(201).send({ id: docRef.id, ...userData });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtener un usuario por su ID
const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      res.status(200).send({ id: userDoc.id, ...userDoc.data() });
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Actualizar un usuario por su ID
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    await updateDoc(doc(db, "users", userId), updateData);
    res.status(200).send({ id: userId, ...updateData });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Actualizar parcialmente un usuario por su ID
const patchUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Obtener el documento del usuario
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).send("Usuario no encontrado");
    }

    // Actualizar solo los campos proporcionados en el cuerpo de la solicitud
    await updateDoc(userDocRef, updateData);

    // Obtener el documento actualizado para devolverlo en la respuesta
    const updatedUserDoc = await getDoc(userDocRef);
    res.status(200).send({ id: updatedUserDoc.id, ...updatedUserDoc.data() });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Eliminar un usuario por su ID
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await deleteDoc(doc(db, "users", userId));
    res.status(200).send({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "Falta el id" });
    }

    // Retrieve the target user document using the userId
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const targetUser = userDoc.data();

    // Retrieve all user documents from the "users" collection
    const snapshot = await getDocs(collection(db, "users"));
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Filter recommendations:
    // They must be a different user, share the same country, and either live in the same city or share at least one interest.
    const recomendaciones = users
      .filter((user) => {
        if (user.id === userId) return false; // Exclude the target user
        if (!user.direccion || !targetUser.direccion) return false;
        if (user.direccion.pais !== targetUser.direccion.pais) return false;

        const mismaCiudad =
          user.direccion.ciudad === targetUser.direccion.ciudad;
        const compartenIntereses =
          user.intereses &&
          targetUser.intereses &&
          user.intereses.some((interest) =>
            targetUser.intereses.includes(interest)
          );

        return mismaCiudad || compartenIntereses;
      })
      .map((user) => ({
        id: user.id,
        nombre: user.nombre,
        intereses: user.intereses,
      }));

    res.json({ recomendaciones });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getUserReputation = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "Falta el id" });
    }

    // Obtener el documento del usuario según el id
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = userDoc.data();

    let puntaje = 0;
    if (user.actividad && user.actividad.length > 0) {
      // Define los puntos asignados para cada tipo de acción
      const definirValores = {
        "Inició sesión": 5,
        "Actualizó su perfil": 3,
        "Registró un nuevo comentario": 4,
        "Comentó en un post": 4,
        "Subió un video": 6,
        "Publicó una foto": 6,
      };

      // Sumar puntos por cada actividad sin diferenciar por recencia
      user.actividad.forEach((act) => {
        const puntos = definirValores[act.accion] || 2;
        puntaje += puntos;
      });
    }

    const hoy = new Date();
    const ultimaActividad = new Date(
      user.actividad[user.actividad.length - 1].fecha
    );
    const diasSinActividad = (hoy - ultimaActividad) / (1000 * 60 * 60 * 24);
    if (diasSinActividad > 365) {
      puntaje -= 5;
    }
    // Evita que el puntaje sea negativo
    const reputacion = Math.max(puntaje, 0);

    res.json({
      user: {
        nombre: user.nombre,
        actividad: user.actividad,
      },
      reputacion,
      diasSinActividad,
    });
  } catch (error) {
    console.error("Error calculando la reputación:", error);
    res.status(500).send("Error Interno del Servidor");
  }
};

const addUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;
    const { accion } = req.body;

    // Validar que la acción esté dentro de las permitidas
    const accionesPermitidas = [
      "Inició sesión",
      "Actualizó su perfil",
      "Registró un nuevo comentario",
      "Comentó en un post",
      "Subió un video",
      "Publicó una foto",
    ];

    if (!accionesPermitidas.includes(accion)) {
      return res.status(400).json({ error: "Acción no permitida" });
    }

    // Obtener el documento del usuario
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Crear la nueva actividad
    const nuevaActividad = {
      accion: accion,
      fecha: new Date().toISOString(),
    };

    // Actualizar el array de actividades del usuario
    await updateDoc(userDocRef, {
      actividad: [...userDoc.data().actividad, nuevaActividad],
    });

    res.status(200).json({ message: "Actividad agregada correctamente", actividad: nuevaActividad });
  } catch (error) {
    console.error("Error agregando actividad:", error);
    res.status(500).send("Error Interno del Servidor");
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserRecommendations,
  getUserReputation,
  addUserActivity,
  patchUser
};
