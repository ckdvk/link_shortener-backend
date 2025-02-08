require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
	if (err) {
		console.error('Error al conectar con la base de datos', err.message);
	} else {
		console.log('Conexión a la base de datos establecida');
	}
});



// Creamos la tabla users y links. La tabla users almacenará los usuarios y la tabla links almacenará los enlaces acortados.
// Estructura de users:

// CREATE TABLE users (
// 	id INTEGER PRIMARY KEY AUTOINCREMENT,
// 	username TEXT NOT NULL,
// 	password TEXT NOT NULL,
// 	current_token TEXT
// );
// Estructura de links:

// CREATE TABLE links (
// 	id INTEGER PRIMARY KEY AUTOINCREMENT,
// 	original_url TEXT NOT NULL,
// 	short_url TEXT NOT NULL,
// 	user_id INTEGER NOT NULL,
// 	FOREIGN KEY(user_id) REFERENCES users(id)
// );
// Creamos las tablas users y links si no existen
async function createTables() {
	db.run(`CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL,
	password TEXT NOT NULL
)`);
	db.run(`CREATE TABLE IF NOT EXISTS links (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	original_url TEXT NOT NULL,
	short_url TEXT NOT NULL,
	user_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id) 
)`);
}

// Creamos el usuario por defecto si no existe
// El usuario por defecto se usará para la autenticación en la API
// El usuario por defecto se crea con el usuario y contraseña especificados en el archivo .env
// El usuario por defecto se crea al arrancar la aplicación
// El usuario por defecto se crea en la base de datos
// El usuario por defecto se crea con la contraseña encriptada con bcrypt

// Creamos el usuario por defecto SI NO EXISTE
async function checkDefaultUser() {
	db.get('SELECT * FROM users WHERE username = ?', [process.env.DEFAULT_DB_USER], (err, user) => {
		if (err) {
			console.error('Error al comprobar el usuario por defecto:', err);
			return;
		}
		if (user) {
			console.log('Usuario por defecto ya existe');
		} else {
			console.log('Creando usuario por defecto...');
			db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
				[process.env.DEFAULT_DB_USER, process.env.DEFAULT_DB_PASSWORD], 
				(err) => {
					if (err) {
						console.error('Error al crear el usuario por defecto:', err);
					} else {
						console.log('Usuario por defecto creado con éxito');
					}
				});
		}
	});
}

// ejecutamos, por orden, las funciones, de modo que primero se crean las tablas y luego se comprueba el usuario por defecto. Por tanto, la segunda espera a la primera.


async function init() {
	await createTables();
	await checkDefaultUser();
}

init();


// // now the checkings:
// db.get('SELECT * FROM users WHERE username = ?', [process.env.DEFAULT_DB_USER], (err, user) => {
// 	if (err) {
// 		console.error('Error al comprobar el usuario por defecto:', err);
// 	} else if (!user) {
// 		console.log('Creando usuario por defecto...');
// 		db.run('INSERT INTO users (username, password) VALUES (?, ?)', [process.env.DEFAULT_DB_USER, process.env.DEFAULT_DB_PASSWORD], function (err) {
// 			if (err) {
// 				console.error('Error al crear el usuario por defecto:', err);
// 			} else {
// 				console.log('Usuario por defecto creado con éxito');
// 			}
// 		});
// 	}
// });



module.exports = { db };