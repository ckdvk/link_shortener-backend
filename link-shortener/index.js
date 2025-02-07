require('dotenv').config(); // Cargar variables de entorno

const express = require('express');

const app = express();
const cors = require('cors');

app.use(cors({
	origin: process.env.FRONTEND_URL,
	 // 	Permite solicitudes desde tu frontend, cuya direccion está en la variable de entorno FRONTEND_URL
	methods: ['GET', 'POST', 'DELETE', 'PUT'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));


const port = process.env.PORT || 3000;
const jwtMiddleware = require('./middleware/jwtMiddleware');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');
const jwt = require('jsonwebtoken');

let token_user = {};

app.use(express.json());

// GET
// Ruta principal
app.get('/', (req, res) => {
	res.send('¡Bienvenido al acortador de enlaces!');
});

// Resolvemos el problema de la petición de favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

// POST
app.post('/login', (req, res) => {
	const user = { id: 1, username: 'javi' }; //MOCK USER
	// only do the below part if the password sent by the user is password
	if (req.body.password !== 'password') {
		console.log('Password incorrecto');
		return res.status(401).send('Contraseña incorrecta');
	}
	else {
		console.log('Password correcto');
	}
	const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1m' });

	// Also save the token in the database, which, for mock purposes, we will save in a variable
	// db.run('INSERT INTO tokens (token) VALUES (?)', [token], function (err) {
	// 	if (err) return res.status(500).send('Error al guardar el token');
	// });

	token_user = { token: token, user: user };

	res.json({ token });
});



// Chequeo de validez del token
app.post('/api/verify-token', (req, res) => {

	const token = req.headers.authorization?.split(' ')[1]; // Obtener el token sin "Bearer "
	

	if (!token) return res.status(401).send('No token provided');
	console.log(`Checking token: ${token}`);
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			console.error('Error al verificar el token:', err);
			return res.status(401).send('Invalid token');
		}
		console.log('Token válido');
		res.json({ valid: true, user: decoded });
	});	
});



// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/links', jwtMiddleware, linkRoutes);

app.listen(port, () => {
	console.log(`Servidor corriendo en el puerto ${port}`);
});
