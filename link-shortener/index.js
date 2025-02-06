require('dotenv').config(); // Cargar variables de entorno

const express = require('express');

const app = express();
const cors = require('cors');

app.use(cors({
	origin: process.env.FRONTEND_URL,
	 // 	Permite solicitudes desde tu frontend, cuya direccion está en la variable de entorno FRONTEND_URL
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type']
}));


const port = process.env.PORT || 3000;
const jwtMiddleware = require('./middleware/jwtMiddleware');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');
const jwt = require('jsonwebtoken');

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
	const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

	res.json({ token });
});

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/links', jwtMiddleware, linkRoutes);

app.listen(port, () => {
	console.log(`Servidor corriendo en el puerto ${port}`);
});
