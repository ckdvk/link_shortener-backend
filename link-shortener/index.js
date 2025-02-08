require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

app.use(cors({
	origin: process.env.FRONTEND_URL,
	methods: ['GET', 'POST', 'DELETE', 'PUT'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// GET
app.get('/', (req, res) => {
	res.send('¡Bienvenido al acortador de enlaces!');
});

// GET	Para resolver el problema de la petición de favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Rutas de la API
app.use('/api/userRoutes', userRoutes);
app.use('/api/tokenRoutes', tokenRoutes);
app.use('/', linkRoutes);

app.listen(port, () => {
	console.log(`Servidor corriendo en el puerto ${port}`);
});