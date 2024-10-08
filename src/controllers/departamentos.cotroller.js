import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

// Listar Departamentos
export const listarDepartamentos = async (req, res) => {
	try {
		const [result] = await pool.query("SELECT * FROM departamentos");
		if (result.length > 0) {
			res.status(200).json(result);
		} else {
			res.status(403).json({
				status: 403,
				message: "No hay departamentos para listar"
			})
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Registrar Departamento
export const registrarDepartamento = async (req, res) => {
	try {
		// Validar los datos
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { nombre_departamento, codigo_dane } = req.body;
		const [result] = await pool.query(
			"INSERT INTO departamentos (nombre_departamento, codigo_dane) VALUES (?,?)",
			[nombre_departamento, codigo_dane]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Departamento registrado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se registró el departamento",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Actualizar Departamento por ID
export const actualizarDepartamento = async (req, res) => {
	try {
		// Validar los datos
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { id_departamento } = req.params;
		const { nombre_departamento, codigo_dane } = req.body;
		const [result] = await pool.query(
			"UPDATE departamentos SET nombre_departamento=?, codigo_dane=? WHERE id_departamento=?",
			[nombre_departamento, codigo_dane, id_departamento]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Departamento actualizado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se actualizó el departamento",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Eliminar Departamento por ID
export const eliminarDepartamento = async (req, res) => {
	try {
		const { id_departamento } = req.params;
		const [result] = await pool.query(
			"DELETE FROM departamentos WHERE id_departamento=?",
			[id_departamento]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Departamento eliminado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se eliminó el departamento",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Buscar Departamento por ID
export const buscarDepartamento = async (req, res) => {
	try {
		const { id_departamento } = req.params;
		const [result] = await pool.query(
			"SELECT * FROM Departamentos WHERE id_departamento=?",
			[id_departamento]
		);
		if (result.length > 0) {
			res.status(200).json({
				status: 200,
				message: "Departamento encontrado",
				data: result[0],
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "Departamento no encontrado",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};
