const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST	Se comprueba si el token es válido
router.post('/verify-token', (req, res) => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) return res.status(401).send('No token provided');
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			console.error('Error al verificar el token:', err);
			return res.status(401).send('Invalid token');
		}
		res.json({ valid: true, user: decoded });
	});	
});

module.exports = router;