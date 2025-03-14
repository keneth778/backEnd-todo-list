const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1212',
    database: 'tables_in_todo_list'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola desde mi backend en Express!');
});

// Ruta para servir la página de tareas
app.get('/tareas', (req, res) => {
    res.sendFile(path.join(__dirname, 'tareas.html'));
});

// Ruta para el login
app.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const query = 'SELECT * FROM usuario WHERE correo = ?';
    db.query(query, [correo], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = results[0];

        if (contraseña !== usuario.contraseña) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({ usuario_id: usuario.id });
    });
});

// Ruta para registrar un nuevo usuario
app.post('/registro', (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    // Validar que los campos estén presentes
    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const queryVerificar = 'SELECT * FROM usuario WHERE correo = ?';
    db.query(queryVerificar, [correo], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Insertar el nuevo usuario en la base de datos
        const queryInsertar = 'INSERT INTO usuario (nombre, correo, contraseña) VALUES (?, ?, ?)';
        db.query(queryInsertar, [nombre, correo, contraseña], (err, result) => {
            if (err) {
                console.error('Error al insertar el usuario: ', err);
                return res.status(500).json({ error: 'Error en el servidor', details: err.message });
            }

            // Devolver el ID del usuario registrado
            res.status(201).json({ usuario_id: result.insertId });
        });
    });
});

// Ruta para obtener las tareas de un usuario
app.get('/tareas/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;

    // Consultar las tareas del usuario desde la base de datos
    const query = 'SELECT * FROM tarea WHERE usuario_id = ?';
    db.query(query, [usuario_id], (err, results) => {
        if (err) {
            console.error('Error al consultar las tareas: ', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        // Devolver las tareas en formato JSON
        res.json(results);
    });
});

// Ruta para agregar una tarea para un usuario específico
app.post('/tareas/:usuario_id/agregar', (req, res) => {
    const { usuario_id } = req.params;
    const { nombre, estado } = req.body;

    // Validar que los campos estén presentes
    if (!nombre || estado === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Insertar la tarea en la base de datos
    const query = 'INSERT INTO tarea (nombre, estado, usuario_id) VALUES (?, ?, ?)';
    db.query(query, [nombre, estado, usuario_id], (err, result) => {
        if (err) {
            console.error('Error al insertar la tarea: ', err);
            return res.status(500).json({ error: 'Error en el servidor', details: err.message });
        }

        res.status(201).json({ id: result.insertId, nombre, estado, usuario_id });
    });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});