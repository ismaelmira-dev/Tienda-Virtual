const express = require('express');
const router = express.Router();
const db = require('./db');


// GET - Obtener categorias
router.get('/categorias', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '12345') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    const { nombre, descripcion, activa } = req.query;

    let query = 'SELECT * FROM Categorias WHERE 1=1';
    const params = [];

    if (nombre)      { query += ' AND LOWER(nombre) LIKE ?';      params.push(`%${nombre.toLowerCase()}%`); }
    if (descripcion) { query += ' AND LOWER(descripcion) LIKE ?'; params.push(`%${descripcion.toLowerCase()}%`); }
    if (activa)      { query += ' AND activa = ?';                params.push(activa === 'true' ? 1 : 0); }

    db.all(query, params, (err, rows) => {
        res.json({ success: true, Headers: { apiKey }, data: rows });
    });
});


// GET - Obtener una categoria por ID
router.get('/categorias/:id', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '12345') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    db.get('SELECT * FROM Categorias WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
        }
        res.json({ success: true, Headers: { apiKey }, data: row });
    });
});


// POST - Crear una nueva categoria
router.post('/categorias', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '6789') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, descripcion, activa } = req.body;

    // Validación de campos obligatorios
    if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
    }

    // Validación de tipos de dato
    if (typeof nombre !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo nombre debe ser texto' });
    }

    if (descripcion !== undefined && typeof descripcion !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo descripcion debe ser texto' });
    }

    if (activa !== undefined && typeof activa !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activa debe ser true o false' });
    }

    // Verificación de unicidad de nombre
    db.get('SELECT id FROM Categorias WHERE LOWER(nombre) = ?', [nombre.toLowerCase()], (err, row) => {
        if (row) {
            return res.status(409).json({ success: false, message: 'Ya existe una categoria con ese nombre' });
        }

        db.run(
            'INSERT INTO Categorias (nombre, descripcion, activa) VALUES (?, ?, ?)',
            [nombre, descripcion, activa ? 1 : 0],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(201).json({ success: true, Headers: { apiKey, roleHeader }, data: { id: this.lastID, nombre, descripcion, activa } });
            }
        );
    });
});


// PUT - Actualizar una categoria por ID
router.put('/categorias/:id', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '6789') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, descripcion, activa } = req.body;

    // Validación de campos obligatorios
    if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
    }

    // Validación de tipos de dato
    if (typeof nombre !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo nombre debe ser texto' });
    }

    if (descripcion !== undefined && typeof descripcion !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo descripcion debe ser texto' });
    }

    if (activa !== undefined && typeof activa !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo activa debe ser true o false' });
    }

    db.get('SELECT * FROM Categorias WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
        }

        // Verificar unicidad de nombre (ignorando la categoria actual)
        db.get('SELECT id FROM Categorias WHERE LOWER(nombre) = ? AND id != ?', [nombre.toLowerCase(), req.params.id], (err, duplicate) => {
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Ya existe otra categoria con ese nombre' });
            }

            db.run(
                'UPDATE Categorias SET nombre = ?, descripcion = ?, activa = ? WHERE id = ?',
                [nombre, descripcion, activa ? 1 : 0, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, Headers: { apiKey, roleHeader }, data: { id: parseInt(req.params.id), nombre, descripcion, activa } });
                }
            );
        });
    });
});


// DELETE - Eliminar una categoria por ID
router.delete('/categorias/:id', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '6789') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    db.get('SELECT * FROM Categorias WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
        }

        db.run('DELETE FROM Categorias WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(200).json({ success: true, Headers: { apiKey, roleHeader }, data: "La Categoria se ha eliminado" });
        });
    });
});

module.exports = router;   