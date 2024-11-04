import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

/* dotenv.config({ path: "./src/env/.env" }); */
dotenv.config({ path: "./src/env/.env" });
export const pool = createPool({

	// host: 'b9iytc2y2enbn9s1mwkk-mysql.services.clever-cloud.com',
	// user: 'u7jddxmumycrirzd',
	// password: 'd5qgOmbto92MKjzI1LBp',
	// port: 3306,
	// database: 'b9iytc2y2enbn9s1mwkk',

	host: '192.168.0.203',
	user: 'james',
	password: 'Ubuntu123',
	port: 3306,
	database: 'buddypet',

	// host: 'localhost',
	// user: 'root',
	// password: '',
	// port: 3306,
	// database: 'buddypet',
});

// Verificar conexión a la base de datos
(async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Conexión a la base de datos exitosa");
        connection.release(); // Liberar la conexión después de la verificación
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error.message);
        console.error("Detalles del error:", error);
    }
})();

