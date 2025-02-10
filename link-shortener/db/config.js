require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
	if (err) {
		console.error('Error al conectar con la base de datos', err.message);
	} else {
		console.log('Conexión a la base de datos establecida');
		init();
	}
});

function createTables() {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(`CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT NOT NULL,
				password TEXT NOT NULL
			)`, (err) => {
				if (err) reject(err);
			});
			
			db.run(`CREATE TABLE IF NOT EXISTS links (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				original_url TEXT NOT NULL,
				short_url TEXT NOT NULL,
				user_id INTEGER NOT NULL,
				FOREIGN KEY(user_id) REFERENCES users(id) 
			)`, (err) => {
				if (err) reject(err);
				else resolve(); // Resolver cuando se cree la última tabla
			});
		});
	});
}

function checkDefaultUser() {
	return new Promise((resolve, reject) => {
		db.get('SELECT * FROM users WHERE username = ?', [process.env.DEFAULT_DB_USER], (err, user) => {
			if (err) {
				console.error('Error al comprobar el usuario por defecto:', err);
				reject(err);
				return;
			}
			if (user) {
				console.log('Usuario por defecto ya existe');
				resolve();
			} else {
				console.log('Creando usuario por defecto...');
				db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
					[process.env.DEFAULT_DB_USER, process.env.DEFAULT_DB_PASSWORD], 
					(err) => {
						if (err) {
							console.error('Error al crear el usuario por defecto:', err);
							reject(err);
						} else {
							console.log('Usuario por defecto creado con éxito');
							resolve();
						}
					});
			}
		});
	});
}

async function init() {
	try {
		await createTables();
		await checkDefaultUser();
	} catch (error) {
		console.error('Error durante la inicialización:', error);
	}
}

module.exports = { db };
