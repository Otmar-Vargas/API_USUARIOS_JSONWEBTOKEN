// app.js
const express = require("express");
const UsersRoutes = require("./routes/UsersRoutes.js");
const authRoutes = require('./routes/authRoutes');
const path = require("path");

const app = express();
console.log(__dirname);

app.use(express.json()); // Permitir JSON en las peticiones
app.use("/apiV1/users", UsersRoutes);
app.use('/apiV1/auth',authRoutes);
// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Pagina principal:  http://localhost:${PORT}`);
});