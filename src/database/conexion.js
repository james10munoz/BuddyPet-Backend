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

	host: '192.168.0.50',
	user: 'cesar',
	password: 'cesar',
	port: 3306,
	database: 'buddypet',
});



