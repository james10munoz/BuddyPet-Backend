import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

// Listar Municipios
export const listarMunicipios = async (req, res) => {
    try {
        const { id_departamento } = req.params; // Obtener id_departamento de los parámetros

        // Verificar si se proporciona el id_departamento
        if (!id_departamento) {
            return res.status(400).json({
                status: 400,
                message: "El id_departamento es requerido."
            });
        }

        // Consulta para filtrar municipios por el departamento proporcionado
        const [result] = await pool.query(`
            SELECT 
                m.id_municipio, 
                m.nombre_municipio, 
                m.codigo_dane, 
                m.fk_id_departamento, 
                d.nombre_departamento 
            FROM 
                municipios m
            INNER JOIN 
                departamentos d ON m.fk_id_departamento = d.id_departamento
            WHERE 
                m.fk_id_departamento = ?
        `, [id_departamento]);

        // Verificar si hay resultados
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: "No hay municipios para listar en este departamento."
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Error en el servidor " + error.message,
        });
    }
};



// Registrar Municipio
export const registrarMunicipio = async (req, res) => {
	try {
		// Validar los datos
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { nombre_municipio, codigo_dane, fk_id_departamento } = req.body;
		const [result] = await pool.query(
			"INSERT INTO municipios ( nombre_municipio, codigo_dane, fk_id_departamento) VALUES (?,?,?)",
			[nombre_municipio, codigo_dane, fk_id_departamento]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Municipio registrado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se registró el municipio",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Actualizar Municipio por ID
export const actualizarMunicipio = async (req, res) => {
	try {
		// Validar los datos
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { id_municipio } = req.params;
		const { nombre_municipio, codigo_dane, fk_id_departamento } = req.body;
		const [result] = await pool.query(
			"UPDATE municipios SET  nombre_municipio=?, codigo_dane=?, fk_id_departamento=? WHERE id_municipio=?",
			[nombre_municipio, codigo_dane, fk_id_departamento, id_municipio]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Municipio actualizado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se actualizó el municipio",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Eliminar Municipio por ID
export const eliminarMunicipio = async (req, res) => {
	try {
		const { id_municipio } = req.params;
		const [result] = await pool.query(
			"DELETE FROM municipios WHERE id_municipio=?",
			[id_municipio]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Municipio eliminado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se eliminó el municipio",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Buscar Municipio por ID
export const buscarMunicipio = async (req, res) => {
	try {
		const { id_municipio } = req.params;
		const [result] = await pool.query(
			"SELECT * FROM municipios WHERE id_municipio=?",
			[id_municipio]
		);
		if (result.length > 0) {
			res.status(200).json({
				status: 200,
				message: "Municipio encontrado",
				data: result[0],
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "Municipio no encontrado",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};
