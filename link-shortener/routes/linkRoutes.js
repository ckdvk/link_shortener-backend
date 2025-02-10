const express = require('express');
const database = require('../db/config');
const db = database.db;
const router = express.Router();
const jwt = require('jsonwebtoken');

async function checkUniqueHash(hash) {
	let exists = true;
	while (exists) {
		console.log("");
		console.log(`\tComprobando si el hash existe ya en base de datos:`, hash);

		const row = await new Promise((resolve, reject) => {
			db.get('SELECT * FROM links WHERE short_url = ?', [hash], (err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			});
		});

		if (!row) {
			console.log(`\tEl hash no existe. Guardando hash`);
			exists = false;
		} else {
			console.log(`\tEl hash ya existe:`, hash);
			console.log(`\tGenerando nuevo hash...`);
			hash = Math.random().toString(36).substring(2, 7);
		}
		console.log("");
	}
}

// GET
router.get('/:shortUrl', (req, res) => {
	const { shortUrl } = req.params;
	console.log("");
	console.log(`Short URL solicitada:`, shortUrl);
	console.log("");

	db.get('SELECT * FROM links WHERE short_url = ?', [shortUrl], (err, row) => {
		if (err || !row) return res.status(404).send('Enlace no encontrado');
		console.log(`\tEnlace encontrado:`, row.original_url);
		console.log(`\tRedirigiendo...`);

		let url = row.original_url;
		const http = 'http://';
		const https = 'https://';
		if (!url.startsWith(http) && !url.startsWith(https)) {
			url = http + url;
		}
		res.redirect(url);
	});
});

// POST
router.post('/shortenUrl', async (req, res) => {
	const request = req.body;
	const headers = req.headers;
	const original_url = request.original_url;
	const token = headers.authorization?.split(' ')[1];

	let token_user = jwt.verify(token, process.env.JWT_SECRET);
	let user_id = token_user.id;
	console.log("");
	console.log(`Petición de acortar URL del usuario`, token_user.username);
	console.log("");
	console.log(`\tUrl a acortar:`, original_url);

	db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, row) => {
		if (err || !row) return res.status(401).send('Usuario no encontrado');
		token_user = row;
		user_id = row.id;
	});

	let hash = Math.random().toString(36).substring(2, 7);

	await checkUniqueHash(hash);

	const shortUrl = `${process.env.SHORT_URL_PREFIX}/${hash}`;
	console.log(`\tURL acortada:`, shortUrl);
	db.run('INSERT INTO links (original_url, short_url, user_id) VALUES (?, ?, ?)', [original_url, hash, user_id], function (err) {
		if (err) return res.status(500).send('Error al crear el enlace');
		res.json({ short_url: shortUrl });
	});
	console.log("");
});

module.exports = router;



