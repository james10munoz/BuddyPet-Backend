import { Router } from "express";
import { listarMunicipios, listarMunicipiosId, registrarMunicipio, actualizarMunicipio, eliminarMunicipio, buscarMunicipio } from "../controllers/municipios.controller.js";
import { validarToken } from "../controllers/validacion.controller.js";
import { validateActualizarMunicipio, validateCrearMunicipio } from "../validation/municipios.validation.js";

const MunicipioRoutes = Router();

MunicipioRoutes.get("/listar",  listarMunicipios);
MunicipioRoutes.get("/listar/:id_departamento",  listarMunicipiosId);
MunicipioRoutes.post("/registrar", validarToken, validateCrearMunicipio, registrarMunicipio);
MunicipioRoutes.put("/actualizar/:id_municipio", validateActualizarMunicipio, validarToken, actualizarMunicipio);
MunicipioRoutes.delete("/eliminar/:id_municipio", validarToken, eliminarMunicipio);
MunicipioRoutes.get("/buscar/:id_municipio", validarToken, buscarMunicipio);

export default MunicipioRoutes;