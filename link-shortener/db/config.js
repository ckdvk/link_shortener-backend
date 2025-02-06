require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
	if (err) {
		console.error('Error al conectar con la base de datos', err.message);
	} else {
		console.log('Conexión a la base de datos establecida');
	}
});
