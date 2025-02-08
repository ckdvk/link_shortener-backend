const express = require('express');
const database = require('../db/config');
const db = database.db;
const router = express.Router();


// Redirigir al enlace original
router.get('/:shortUrl', (req, res) => {
	const { shortUrl } = req.params;
	console.log('Short URL solicitada:', shortUrl);

	db.get('SELECT * FROM links WHERE short_url = ?', [shortUrl], (err, row) => {
		if (err || !row) return res.status(404).send('Enlace no encontrado');
		console.log('Enlace encontrado:', row.original_url);
		// after the reponse, the client goes directly to the original URL (row.original_url), without the direction of the server in front of it
		// añade http o https si no está presente
		let url = row.original_url;
		const http = 'http://';
		const https = 'https://';
		if (!url.startsWith(http) && !url.startsWith(https)) {
			url = http + url;
		}
		res.redirect(url);
	});
});

module.exports = router;
