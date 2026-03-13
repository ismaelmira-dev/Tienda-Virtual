const express = require('express');
const router = express.Router();
const db = require('./db');


// GET - Obtener productos
router.get('/productos', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '12345') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    const { nombre, precio, stock, categoriaId } = req.query;

    let query = 'SELECT Productos.*, Categorias.nombre AS categoriaNombre FROM Productos LEFT JOIN Categorias ON Productos.categoriaId = Categorias.id WHERE 1=1';
    const params = [];

    if (nombre)      { query += ' AND LOWER(Productos.nombre) LIKE ?'; params.push(`%${nombre.toLowerCase()}%`); }
    if (precio)      { query += ' AND precio = ?';                     params.push(parseFloat(precio)); }
    if (stock)       { query += ' AND stock = ?';                      params.push(parseInt(stock)); }
    if (categoriaId) { query += ' AND categoriaId = ?';                params.push(parseInt(categoriaId)); }

    db.all(query, params, (err, rows) => {
        res.json({ success: true, Headers: { apiKey }, data: rows });
    });
});


// GET - Obtener un producto por ID
router.get('/productos/:id', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '12345') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    const query = 'SELECT Productos.*, Categorias.nombre AS categoriaNombre FROM Productos LEFT JOIN Categorias ON Productos.categoriaId = Categorias.id WHERE Productos.id = ?';

    db.get(query, [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, Headers: { apiKey }, data: row });
    });
});


// POST - Crear nuevo producto
router.post('/productos', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD1) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, precio, stock, categoriaId } = req.body;

    // Validación de campos obligatorios
    if (!nombre || precio === undefined || !categoriaId) {
        return res.status(400).json({ success: false, message: 'Los campos nombre, precio y categoriaId son obligatorios' });
    }

    // Validación de tipos de dato
    if (typeof nombre !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo nombre debe ser texto' });
    }

    if (typeof precio !== 'number' || precio <= 0) {
        return res.status(400).json({ success: false, message: 'El campo precio debe ser un número mayor a 0' });
    }

    if (stock !== undefined && (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0)) {
        return res.status(400).json({ success: false, message: 'El campo stock debe ser un número entero mayor o igual a 0' });
    }

    if (typeof categoriaId !== 'number' || !Number.isInteger(categoriaId)) {
        return res.status(400).json({ success: false, message: 'El campo categoriaId debe ser un número entero' });
    }

    // Verificar que la categoria existe
    db.get('SELECT id FROM Categorias WHERE id = ?', [categoriaId], (err, categoria) => {
        if (!categoria) {
            return res.status(404).json({ success: false, message: 'La categoria indicada no existe' });
        }

        db.run(
            'INSERT INTO Productos (nombre, precio, stock, categoriaId) VALUES (?, ?, ?, ?)',
            [nombre, precio, stock || 0, categoriaId],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(201).json({ success: true, Headers: { apiKey, roleHeader }, data: { id: this.lastID, nombre, precio, stock: stock || 0, categoriaId } });
            }
        );
    });
});


// PUT: Actualizar producto por ID
router.put('/productos/:id', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD1) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, precio, stock, categoriaId } = req.body;

    // Validación de campos obligatorios
    if (!nombre || precio === undefined || !categoriaId) {
        return res.status(400).json({ success: false, message: 'Los campos nombre, precio y categoriaId son obligatorios' });
    }

    // Validación de tipos de dato
    if (typeof nombre !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo nombre debe ser texto' });
    }

    if (typeof precio !== 'number' || precio <= 0) {
        return res.status(400).json({ success: false, message: 'El campo precio debe ser un número mayor a 0' });
    }

    if (stock !== undefined && (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0)) {
        return res.status(400).json({ success: false, message: 'El campo stock debe ser un número entero mayor o igual a 0' });
    }

    if (typeof categoriaId !== 'number' || !Number.isInteger(categoriaId)) {
        return res.status(400).json({ success: false, message: 'El campo categoriaId debe ser un número entero' });
    }

    db.get('SELECT * FROM Productos WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Verificar que la categoria existe
        db.get('SELECT id FROM Categorias WHERE id = ?', [categoriaId], (err, categoria) => {
            if (!categoria) {
                return res.status(404).json({ success: false, message: 'La categoria indicada no existe' });
            }

            db.run(
                'UPDATE Productos SET nombre = ?, precio = ?, stock = ?, categoriaId = ? WHERE id = ?',
                [nombre, precio, stock, categoriaId, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, Headers: { apiKey, roleHeader }, data: { id: parseInt(req.params.id), nombre, precio, stock, categoriaId } });
                }
            );
        });
    });
});


// DELETE - Eliminar un producto por ID
router.delete('/productos/:id', (req, res) => {

    const apiKey = req.headers['password'];
    const roleHeader = req.headers['x-user-role'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== process.env.API_PASSWORD1) {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    if (roleHeader !== 'admin') {
        return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    }

    db.get('SELECT * FROM Productos WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        db.run('DELETE FROM Productos WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(200).json({ success: true, Headers: { apiKey, roleHeader }, data: "El Producto se ha eliminado" });
        });
    });
});

module.exports = router;