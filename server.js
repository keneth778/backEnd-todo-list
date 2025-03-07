// Requiriendo las dependencias necesarias
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// Crear una instancia de la aplicación Express
const app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500' // Ajusta esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',      // Dirección del servidor de la base de datos
    user: 'root',           // Usuario de la base de datos
    password: '1212',       // Contraseña del usuario
    database: 'tables_in_todo_list'   // Nombre de la base de datos (ajusta esto)
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Ruta para consultar las tareas desde la base de datos
app.get('/usuarios', (req, res) => {
    // Realiza una consulta SELECT a la base de datos
    db.query('SELECT * FROM tareas', (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta: ', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        // Enviar los resultados de la consulta como respuesta en formato JSON
        res.json(results);
    });
});

// Ruta para agregar una tarea
app.post('/agregar', (req, res) => {
    const { nombre_tarea, estado } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!nombre_tarea || estado === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Insertar la tarea en la base de datos
    const query = 'INSERT INTO tareas (nombre, estado) VALUES (?, ?)'; // Usar "nombre" en lugar de "nombre_tarea"
    db.query(query, [nombre_tarea, estado], (err, result) => {
        if (err) {
            console.error('Error al insertar la tarea: ', err);
            return res.status(500).json({ error: 'Error al guardar la tarea', details: err.message });
        }
        // Devolver la tarea agregada con su ID
        res.status(201).json({ id: result.insertId, nombre: nombre_tarea, estado }); // Usar "nombre" en la respuesta
    });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola desde mi backend en Express!');
});

// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;