const express = require('express');
const db = require('../db/config');
const router = express.Router();

// Crear un enlace corto
router.post('/', (req, res) => {
	const { original_url } = req.body;
	const user_id = req.user.id;	// Extraído del middleware JWT

	const shortUrl = Math.random().toString(36).substring(2, 8);	// Generar un código corto aleatorio

	db.run('INSERT INTO links (original_url, short_url, user_id) VALUES (?, ?, ?)', [original_url, shortUrl, user_id], function (err) {
		if (err) return res.status(500).send('Error al crear el enlace');
		res.status(201).send({ short_url: shortUrl });
	});
});

// Redirigir al enlace original
router.get('/:shortUrl', (req, res) => {
	const { shortUrl } = req.params;

	db.get('SELECT * FROM links WHERE short_url = ?', [shortUrl], (err, row) => {
		if (err || !row) return res.status(404).send('Enlace no encontrado');
		res.redirect(row.original_url);
	});
});

module.exports = router;
