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
const bcrypt = require('bcrypt');
const database = require('./db/config');

const db = database.db;

// let token_user = {};

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
	// redefinition of the method, deifnitive version using the database
	const { username, password } = req.body;
	console.log('Username:', username);
	console.log('Password:', password);
	// We check that the introduced user exists in the database, if not, we return an error
	(async () => {
		try {
			const user = await new Promise((resolve, reject) => {
				db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
					if (err || !row) return reject('Usuario no encontrado');
					resolve(row);
				});
			});
			console.log('User:', user);

			// const isMatch = await bcrypt.compare(password, user.password);

			const isMatch =user.password == password
			if (!isMatch) return res.status(401).send('Contraseña incorrecta');
			console.log('Contraseña correcta');

			const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

			token_user = { token: token, user: user };

			res.json({ token });
		} catch (err) {
			console.error('Error al iniciar sesión:', err);
			return res.status(401).send('Usuario o contraseña incorrectos');
		}
	})();
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

// Logica de acortar links (sent in the form of a JSON response)
app.post('/shortenUrl', (req, res) => {
	console.log('Shortening URL');
	const request = req.body;
	const headers = req.headers;

	const original_url = request.original_url;
	console.log('Original URL:', original_url);
	const token = headers.authorization?.split(' ')[1];
	// verifies the token with jwt.verify
	let token_user = jwt.verify(token, process.env.JWT_SECRET);
	console.log('Token user:', token_user);
	let user_id = token_user.id;

	// checks if the user is in the database
	db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, row) => {
		if (err || !row) return res.status(401).send('Usuario no encontrado');
		token_user = row;
		user_id = row.id;
	});

	console.log('User:', token_user.username);
	// con una función hash, transforma el link en una secuencia de 5 caracteres alfanuméricos
	let hash = Math.random().toString(36).substring(2, 7);

	const shortUrl = `${process.env.SHORT_URL_PREFIX}/${hash}`;
	console.log('Short URL:', shortUrl);

	// Mira primero si el hash random ya existe en la base de datos. Si sí, genera otro número y lo vuelve a comprobar
	async function checkUniqueHash(hash) {
		let exists = true;
		while (exists) {
			console.log('Comprobando si el hash existe:', hash);

			const row = await new Promise((resolve, reject) => {
			db.get('SELECT * FROM links WHERE short_url = ?', [hash], (err, row) => {
				if (err) {
				reject(err);	// Manejo de errores
				} else {
				resolve(row); // Resolvemos la promesa con el resultado
				}
			});
			});
		
			console.log('Row:', row);
			if (!row) {
			exists = false; // No hay colisión, podemos salir del bucle
			} else {
			hash = Math.random().toString(36).substring(2, 7); // Generamos un nuevo hash
			}
		}
	}

	checkUniqueHash(hash);

	console.log('Short URL única:', hash);
	// Guarda el enlace en la base de datos
	db.run('INSERT INTO links (original_url, short_url, user_id) VALUES (?, ?, ?)', [original_url, hash, user_id], function (err) {
		if (err) return res.status(500).send('Error al crear el enlace');
		// res.status(201).send({ short_url: shortUrl });
		res.json({ short_url: shortUrl });
	});

});

// Rutas de la API
app.use('/api/users', jwtMiddleware, userRoutes);
app.use('/',linkRoutes);

app.listen(port, () => {
	console.log(`Servidor corriendo en el puerto ${port}`);
});
