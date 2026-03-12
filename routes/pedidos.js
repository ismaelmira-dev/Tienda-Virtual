const express = require('express');
const router = express.Router();
const db = require('./db');


// GET: todos los pedidos
router.get('/pedidos', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '12345') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    const { usuarioId, estado, fecha } = req.query;

    let query = 'SELECT * FROM Pedidos WHERE 1=1';
    const params = [];

    if (usuarioId) { query += ' AND usuarioId = ?';        params.push(parseInt(usuarioId)); }
    if (estado)    { query += ' AND LOWER(estado) LIKE ?'; params.push(`%${estado.toLowerCase()}%`); }
    if (fecha)     { query += ' AND fecha = ?';            params.push(fecha); }

    db.all(query, params, (err, rows) => {
        res.json({ success: true, Headers: { apiKey }, data: rows });
    });
});


// GET - Obtener pedido por ID (incluye su detalle)
router.get('/pedidos/:id', (req, res) => {

    const apiKey = req.headers['password'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key es requerida' });
    }

    if (apiKey !== '12345') {
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    }

    db.get('SELECT * FROM Pedidos WHERE id = ?', [req.params.id], (err, pedido) => {
        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        db.all(
            'SELECT DetallePedido.*, Productos.nombre AS productoNombre FROM DetallePedido LEFT JOIN Productos ON DetallePedido.productoId = Productos.id WHERE pedidoId = ?',
            [req.params.id],
            (err, detalle) => {
                res.json({ success: true, Headers: { apiKey }, data: { ...pedido, detalle } });
            }
        );
    });
});


// POST - Crear nuevo pedido (con detalle)
router.post('/pedidos', (req, res) => {

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

    const { usuarioId, total, estado, fecha, detalle } = req.body;

    // Validación de campos obligatorios
    if (!usuarioId || total === undefined || !estado || !fecha) {
        return res.status(400).json({ success: false, message: 'Los campos usuarioId, total, estado y fecha son obligatorios' });
    }

    // Validación de tipos de dato
    if (typeof usuarioId !== 'number' || !Number.isInteger(usuarioId)) {
        return res.status(400).json({ success: false, message: 'El campo usuarioId debe ser un número entero' });
    }

    if (typeof total !== 'number' || total <= 0) {
        return res.status(400).json({ success: false, message: 'El campo total debe ser un número mayor a 0' });
    }

    if (typeof estado !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo estado debe ser texto' });
    }

    if (typeof fecha !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo fecha debe ser texto (ej: 2025-03-10)' });
    }

    // Validación del detalle si viene
    if (detalle !== undefined) {
        if (!Array.isArray(detalle)) {
            return res.status(400).json({ success: false, message: 'El campo detalle debe ser un array' });
        }

        for (const item of detalle) {
            if (!item.productoId || !item.cantidad || item.precio === undefined) {
                return res.status(400).json({ success: false, message: 'Cada item del detalle debe tener productoId, cantidad y precio' });
            }
            if (typeof item.productoId !== 'number' || !Number.isInteger(item.productoId)) {
                return res.status(400).json({ success: false, message: 'El productoId de cada item debe ser un número entero' });
            }
            if (typeof item.cantidad !== 'number' || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
                return res.status(400).json({ success: false, message: 'La cantidad de cada item debe ser un número entero mayor a 0' });
            }
            if (typeof item.precio !== 'number' || item.precio <= 0) {
                return res.status(400).json({ success: false, message: 'El precio de cada item debe ser un número mayor a 0' });
            }
        }
    }

    // Verificar que el usuario existe
    db.get('SELECT id FROM Usuarios WHERE id = ?', [usuarioId], (err, usuario) => {
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'El usuario indicado no existe' });
        }

        db.run(
            'INSERT INTO Pedidos (usuarioId, total, estado, fecha) VALUES (?, ?, ?, ?)',
            [usuarioId, total, estado, fecha],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });

                const pedidoId = this.lastID;

                if (detalle && detalle.length > 0) {
                    const stmt = db.prepare('INSERT INTO DetallePedido (pedidoId, productoId, cantidad, precio) VALUES (?, ?, ?, ?)');
                    detalle.forEach(item => {
                        stmt.run(pedidoId, item.productoId, item.cantidad, item.precio);
                    });
                    stmt.finalize();
                }

                res.status(201).json({ success: true, Headers: { apiKey, roleHeader }, data: { id: pedidoId, usuarioId, total, estado, fecha, detalle } });
            }
        );
    });
});


// PUT - Actualizar pedido por ID
router.put('/pedidos/:id', (req, res) => {

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

    const { usuarioId, total, estado, fecha } = req.body;

    // Validación de campos obligatorios
    if (!usuarioId || total === undefined || !estado || !fecha) {
        return res.status(400).json({ success: false, message: 'Los campos usuarioId, total, estado y fecha son obligatorios' });
    }

    // Validación de tipos de dato
    if (typeof usuarioId !== 'number' || !Number.isInteger(usuarioId)) {
        return res.status(400).json({ success: false, message: 'El campo usuarioId debe ser un número entero' });
    }

    if (typeof total !== 'number' || total <= 0) {
        return res.status(400).json({ success: false, message: 'El campo total debe ser un número mayor a 0' });
    }

    if (typeof estado !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo estado debe ser texto' });
    }

    if (typeof fecha !== 'string') {
        return res.status(400).json({ success: false, message: 'El campo fecha debe ser texto (ej: 2025-03-10)' });
    }

    db.get('SELECT * FROM Pedidos WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        // Verificar que el usuario existe
        db.get('SELECT id FROM Usuarios WHERE id = ?', [usuarioId], (err, usuario) => {
            if (!usuario) {
                return res.status(404).json({ success: false, message: 'El usuario indicado no existe' });
            }

            db.run(
                'UPDATE Pedidos SET usuarioId = ?, total = ?, estado = ?, fecha = ? WHERE id = ?',
                [usuarioId, total, estado, fecha, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, Headers: { apiKey, roleHeader }, data: { id: parseInt(req.params.id), usuarioId, total, estado, fecha } });
                }
            );
        });
    });
});


// DELETE - Eliminar pedido por ID (también elimina su detalle)
router.delete('/pedidos/:id', (req, res) => {

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

    db.get('SELECT * FROM Pedidos WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        db.run('DELETE FROM DetallePedido WHERE pedidoId = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });

            db.run('DELETE FROM Pedidos WHERE id = ?', [req.params.id], function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(200).json({ success: true, Headers: { apiKey, roleHeader }, data: "El pedido se ha eliminado" });
            });
        });
    });
});

module.exports = router;