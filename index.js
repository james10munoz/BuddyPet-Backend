import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 9227;

// enpoint 
import vacunaRoutes from "./src/routes/vacunas.routes.js";
import usuarioRoutes from "./src/routes/usuarios.routes.js";
import AdopcionRoutes from "./src/routes/adopciones.routes.js";
import RazasRoutes from "./src/routes/razas.routes.js";
import MascotaRoutes from "./src/routes/mascotas.routes.js";
import CategoriaRoutes from "./src/routes/categorias.routes.js";
import DepartamentoRoutes from "./src/routes/departamentos.routes.js";
import MunicipioRoutes from "./src/routes/municipios.routes.js";
import rutaValidacion from "./src/routes/validacion.routes.js";
import Reporterouter from "./src/routes/reporte.routes.js";

const servidor = express();

servidor.use(cors());
servidor.use(bodyParser.json());
servidor.use(bodyParser.urlencoded({ extended: false }));

// rutas 
servidor.use(rutaValidacion);

servidor.use("/vacunas", vacunaRoutes);
servidor.use("/usuarios", usuarioRoutes);
servidor.use("/adopciones", AdopcionRoutes);
servidor.use("/razas", RazasRoutes);
servidor.use("/mascotas", MascotaRoutes);
servidor.use("/categorias", CategoriaRoutes);
servidor.use("/departamentos", DepartamentoRoutes);
servidor.use("/municipios", MunicipioRoutes);
servidor.use("/reportes", Reporterouter);


// / Middleware para servir archivos estáticos desde la carpeta 'uploads'
servidor.use('/uploads', express.static(path.join(__dirname, 'uploads')));

servidor.listen(PORT, () => {
	console.log("Funcionando en el puerto "+PORT);
});
