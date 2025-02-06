require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const token = req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return res.status(403).send('Token de autenticación no proporcionado');
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).send('Token no válido');
		}
		req.user = decoded;
		console.log('Usuario autenticado:', req.user);
		next();
	});
};
