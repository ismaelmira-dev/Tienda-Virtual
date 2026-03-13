const express = require('express');
const router = express.Router();
const db = require('./db');


// GET: todos los usuarios
router.get('/usuarios', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    const { nombre, email, rol, activo } = req.query;

    let query = 'SELECT * FROM Usuarios WHERE 1=1';
    const params = [];

    if (nombre) { query += ' AND LOWER(nombre) LIKE ?'; params.push(`%${nombre.toLowerCase()}%`); }
    if (email)  { query += ' AND LOWER(email) LIKE ?';  params.push(`%${email.toLowerCase()}%`); }
    if (rol)    { query += ' AND LOWER(rol) LIKE ?';    params.push(`%${rol.toLowerCase()}%`); }
    if (activo) { query += ' AND activo = ?';           params.push(activo === 'true' ? 1 : 0); }

    db.all(query, params, (err, rows) => {
        res.json({ success: true, Headers: { apiKey }, data: rows });
    });
});


// GET - Obtener un usuario por ID
router.get('/usuarios/:id', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    db.get('SELECT * FROM Usuarios WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, Headers: { apiKey }, data: row });
    });
});


// POST - Registrar un nuevo usuario
router.post('/usuarios', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, email, rol, activo } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !email || !rol) {
        return res.status(400).json({ success: false, message: 'Los campos nombre, email y rol son obligatorios' });
    }

    // Validación de tipos de dato
    if (typeof nombre !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo nombre debe ser texto' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'El campo email no es válido' });
    }

    if (typeof rol !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo rol debe ser texto' });
    }

    if (activo !== undefined && typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false' });
    }

    // Verificación de unicidad de email
    db.get('SELECT id FROM Usuarios WHERE email = ?', [email], (err, row) => {
        if (row) {
            return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email' });
        }

        db.run(
            'INSERT INTO Usuarios (nombre, email, rol, activo) VALUES (?, ?, ?, ?)',
            [nombre, email, rol, activo ? 1 : 0],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(201).json({ success: true, Headers: { apiKey, roleHeader }, data: { id: this.lastID, nombre, email, rol, activo } });
            }
        );
    });
});


// PUT: Actualizar usuario por ID
router.put('/usuarios/:id', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, email, rol, activo } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !email || !rol) {
        return res.status(400).json({ success: false, message: 'Los campos nombre, email y rol son obligatorios' });
    }

    // Validación de tipos de dato
    if (typeof nombre !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo nombre debe ser texto' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'El campo email no es válido' });
    }

    if (typeof rol !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo rol debe ser texto' });
    }

    if (activo !== undefined && typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activo debe ser true o false' });
    }

    db.get('SELECT * FROM Usuarios WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar unicidad de email (ignorando el usuario actual)
        db.get('SELECT id FROM Usuarios WHERE email = ? AND id != ?', [email, req.params.id], (err, duplicate) => {
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Ya existe otro usuario con ese email' });
            }

            db.run(
                'UPDATE Usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
                [nombre, email, rol, activo ? 1 : 0, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, Headers: { apiKey, roleHeader }, data: { id: parseInt(req.params.id), nombre, email, rol, activo } });
                }
            );
        });
    });
});


// DELETE - Elimina un usuario por ID
router.delete('/usuarios/:id', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    db.get('SELECT * FROM Usuarios WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        db.run('DELETE FROM Usuarios WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(200).json({ success: true, Headers: { apiKey, roleHeader }, data: "El usuario se ha eliminado" });
        });
    });
});

module.exports = router;