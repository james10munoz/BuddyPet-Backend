import { Router } from "express";
import { generarReporte } from "../controllers/reporteController.js";
import { generarReporteAdopciones } from '../controllers/reporteController.js'; // Ajusta la ruta

const Reporterouter = Router();
Reporterouter.get("/reporte", generarReporte);
Reporterouter.get("/reportea", generarReporteAdopciones);

export default Reporterouter;
