const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/config');
const router = express.Router();
const secretKey = 'tu_clave_secreta_aqui';

// Registro de usuario
router.post('/register', (req, res) => {
	const { username, password } = req.body;

	bcrypt.hash(password, 10, (err, hashedPassword) => {
		if (err) return res.status(500).send('Error al encriptar la contraseña');

		db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
			if (err) {
				return res.status(500).send('Error al registrar el usuario');
			}
			res.status(201).send({ message: 'Usuario registrado con éxito', userId: this.lastID });
		});
	});
});

// Login de usuario
router.post('/login', (req, res) => {
	const { username, password } = req.body;

	db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
		if (err || !user) return res.status(404).send('Usuario no encontrado');

		bcrypt.compare(password, user.password, (err, isMatch) => {
			if (err || !isMatch) return res.status(401).send('Contraseña incorrecta');

			const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
			res.json({ message: 'Login exitoso', token });
		});
	});
});

module.exports = router;
