const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const dotenv = require("dotenv");

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Obtener la instancia de Firestore
const db = getFirestore(app);

// Exportar la instancia de Firestore
module.exports = db;