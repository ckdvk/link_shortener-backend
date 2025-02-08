const express = require('express');

const jwt = require('jsonwebtoken');
const database = require('../db/config');
const db = database.db;
const router = express.Router();

// POST
router.post('/login', (req, res) => {
	const { username, password } = req.body;
	console.log("");
	console.log('Username:', username);

	(async () => {
		try {
			const user = await new Promise((resolve, reject) => {
				db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
					if (err || !row) return reject('Usuario no encontrado');
					resolve(row);
				});
			});
			const isMatch = user.password == password
			if (!isMatch) return res.status(401).send('Contraseña incorrecta');
			console.log('Contraseña correcta');

			const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
			token_user = { token: token, user: user };
			res.json({ token });
		} catch (err) {
			console.error('Error al iniciar sesión:', err);
			return res.status(401).send('Usuario o contraseña incorrectos');
		}
		console.log("");
	})();
});

module.exports = router;
