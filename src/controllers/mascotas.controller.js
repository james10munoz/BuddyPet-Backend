import { pool } from "../database/conexion.js";
import fs from "fs";
import path from "path";
import { generatePDF } from '../utils/pdfGenerator.js';

// Listar Mascotas con Imágenes, Detalles Asociados y FKs
export const listarMascotas = async (req, res) => {
	try {
		// Consulta SQL para obtener mascotas, sus imágenes y detalles asociados, incluyendo las FK
		const [result] = await pool.query(`
            SELECT 
                m.id_mascota,
                m.nombre_mascota,
                m.fecha_nacimiento,
                m.estado,
                m.descripcion,
                m.esterilizado,
                m.tamano,
                m.peso,
                m.fk_id_categoria,
                c.nombre_categoria AS categoria,
                m.fk_id_raza,
                r.nombre_raza AS raza,
                m.fk_id_departamento,
                d.nombre_departamento AS departamento,
                m.fk_id_municipio,
                mu.nombre_municipio AS municipio,
                m.sexo,
                GROUP_CONCAT(i.ruta_imagen) AS imagenes
            FROM mascotas m
            LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
            LEFT JOIN categorias c ON m.fk_id_categoria = c.id_categoria
            LEFT JOIN razas r ON m.fk_id_raza = r.id_raza
            LEFT JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
            LEFT JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
            GROUP BY m.id_mascota;
        `);
		if (result.length > 0) {
			res.status(200).json(result);
		} else {
			res.status(403).json({
				status: 403,
				message: "No hay mascotas para listar",
			});
		}
		// Enviar la respuesta
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};

// Registrar Mascota
export const registrarMascota = async (req, res) => {
	try {
		const {
			nombre_mascota,
			fecha_nacimiento,
			estado = "En Adopcion",
			descripcion,
			esterilizado,
			tamano,
			peso,
			id_categoria,
			id_raza,
			id_departamento,
			id_municipio,
			sexo,
		} = req.body;

		const files = req.files || [];

		// Convertir la fecha de nacimiento al formato YYYY-MM-DD
		const fechaNacimientoFormateada = new Date(fecha_nacimiento).toISOString().split('T')[0];

		// Insertar la nueva mascota
		const [result] = await pool.query(
			"INSERT INTO mascotas (nombre_mascota, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				nombre_mascota,
				fechaNacimientoFormateada,
				estado,
				descripcion,
				esterilizado,
				tamano,
				parseFloat(peso),
				id_categoria,
				id_raza,
				id_departamento,
				id_municipio,
				sexo,
			]
		);

		const idMascota = result.insertId;

		// Si se suben imágenes, insertarlas en la tabla imagenes
		if (Array.isArray(files) && files.length > 0) {
			const imageQueries = files.map((file) =>
				pool.query(
					"INSERT INTO imagenes (fk_id_mascota, ruta_imagen) VALUES (?, ?)",
					[idMascota, file.filename]
				)
			);
			await Promise.all(imageQueries);
		}

		// Verificar si la mascota fue registrada exitosamente
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Mascota registrada exitosamente",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se pudo registrar la mascota",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};


// Controlador para obtener conteo de mascotas por estado
export const obtenerConteoPorEstado = async (req, res) => {
	try {
		// Consulta para obtener el conteo de mascotas por estado
		const [result] = await pool.query(`
          SELECT estado, COUNT(*) as total
          FROM mascotas
          GROUP BY estado
      `);
		if (result.length > 0) {
			res.status(200).json(result);
		} else {
			res.status(403).json({
				status: 403,
				message: "No hay mascotas registrardas",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el sistema: " + error.message,
		});
	}
};

// Actualizar Mascota por ID
export const actualizarMascota = async (req, res) => {
    try {
        console.log(req.body);
        const { id_mascota } = req.params;
        const {
            nombre_mascota,
            fecha_nacimiento,
            estado,
            descripcion,
            esterilizado,
            tamano,
            peso,
            id_categoria,
            id_raza,
            id_departamento,
            id_municipio,
            sexo,
        } = req.body;

        const nuevasFotos = req.files || []; // Nuevas imágenes subidas

        // Actualizar la información de la mascota
        const [result] = await pool.query(
            `UPDATE mascotas 
             SET nombre_mascota=?, fecha_nacimiento=?, estado=?, descripcion=?, 
             esterilizado=?, tamano=?, peso=?, fk_id_categoria=?, fk_id_raza=?, 
             fk_id_departamento=?, fk_id_municipio=?, sexo=? 
             WHERE id_mascota=?`,
            [
                nombre_mascota,
                fecha_nacimiento,
                estado,
                descripcion,
                esterilizado,
                tamano,
                peso,
                id_categoria,
                id_raza,
                id_departamento,
                id_municipio,
                sexo,
                id_mascota,
            ]
        );
        const [updatedMascota] = await pool.query("SELECT * FROM mascotas WHERE id_mascota=?", [id_mascota]);
console.log("Datos de la mascota actualizados:", updatedMascota);


        if (result.affectedRows > 0) {
            // Obtener las fotos actuales de la base de datos
            const [currentImages] = await pool.query(
                "SELECT ruta_imagen FROM imagenes WHERE fk_id_mascota=?",
                [id_mascota]
            );

            // Eliminar las fotos seleccionadas para reemplazo
            if (Array.isArray(nuevasFotos) && nuevasFotos.length > 0) {
                // Eliminar las imágenes anteriores solo si se ha subido alguna nueva
                currentImages.forEach((img) => {
                    fs.unlink(path.join("uploads", img.ruta_imagen), (err) => {
                        if (err) {
                            console.error("No se pudo eliminar la imagen anterior:", err);
                        }
                    });
                });

                // Eliminar las fotos actuales de la base de datos
                await pool.query("DELETE FROM imagenes WHERE fk_id_mascota=?", [id_mascota]);

                // Insertar las nuevas fotos en la base de datos
                const imageQueries = nuevasFotos.map((file) =>
                    pool.query(
                        "INSERT INTO imagenes (fk_id_mascota, ruta_imagen) VALUES (?, ?)",
                        [id_mascota, file.filename]
                    )
                );
                await Promise.all(imageQueries);
            }

            res.status(200).json({
                status: 200,
                message: "Mascota actualizada exitosamente",
                data: {
                    id_mascota,
                    nombre_mascota,
                    fecha_nacimiento,
                    estado,
                    descripcion,
                    esterilizado,
                    tamano,
                    peso,
                    id_categoria,
                    id_raza,
                    id_departamento,
                    id_municipio,
                    sexo,
                },
            });
        } else {
            res.status(403).json({
                status: 403,
                message: "No se pudo actualizar la mascota",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Error en el servidor: " + error.message,
        });
    }
};


// Eliminar Mascota por ID
export const eliminarMascota = async (req, res) => {
	try {
		const { id_mascota } = req.params;
		const [result] = await pool.query(
			"DELETE FROM Mascotas WHERE id_mascota=?",
			[id_mascota]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Mascota eliminada",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se eliminó la mascota",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Buscar Mascota por ID
export const buscarMascota = async (req, res) => {
	try {
		const { id_mascota } = req.params;
		// Consulta SQL para obtener detalles de la mascota junto con sus imágenes
		const [result] = await pool.query(
			`
			SELECT 
				m.id_mascota,
				m.nombre_mascota,
				DATE_FORMAT(m.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
				m.estado,
				m.descripcion,
				m.esterilizado,
				m.tamano,
				m.peso,
				m.fk_id_categoria,
				c.nombre_categoria AS categoria,
				m.fk_id_raza,
				r.nombre_raza AS raza,
				m.fk_id_departamento,
				d.nombre_departamento AS departamento,
				m.fk_id_municipio,
				mu.nombre_municipio AS municipio,
				m.sexo,
				GROUP_CONCAT(i.ruta_imagen) AS imagenes
			FROM mascotas m
			LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
			LEFT JOIN categorias c ON m.fk_id_categoria = c.id_categoria
			LEFT JOIN razas r ON m.fk_id_raza = r.id_raza
			LEFT JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
			LEFT JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
			WHERE m.id_mascota = ?
			GROUP BY m.id_mascota;
			`,
			[id_mascota]
		);

		if (result.length > 0) {
			res.status(200).json({
				status: 200,
				message: "Mascota encontrada",
				data: result[0],
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "Mascota no encontrada",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};



//controlador para la generar la ficha tecnica de la mascota
export const generarFichaTecnica = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener información básica de la mascota
        const [mascotaResult] = await pool.query(`
            SELECT 
                m.*, 
                c.nombre_categoria, 
                r.nombre_raza, 
                d.nombre_departamento, 
                mu.nombre_municipio 
            FROM mascotas m
            LEFT JOIN categorias c ON m.fk_id_categoria = c.id_categoria
            LEFT JOIN razas r ON m.fk_id_raza = r.id_raza
            LEFT JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
            LEFT JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
            WHERE m.id_mascota = ?
        `, [id]);

        if (mascotaResult.length === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        const mascota = mascotaResult[0];

        // Obtener vacunas de la mascota
        const [vacunasResult] = await pool.query(`
            SELECT * 
            FROM vacunas 
            WHERE fk_id_mascota = ?
        `, [id]);

        mascota.vacunas = vacunasResult;

        // Obtener una imagen de la mascota
        const [imagenesResult] = await pool.query(`
            SELECT ruta_imagen 
            FROM imagenes 
            WHERE fk_id_mascota = ?
            LIMIT 1
        `, [id]);

        if (imagenesResult.length > 0) {
            mascota.imagen = imagenesResult[0].ruta_imagen;
        } else {
            mascota.imagen = null; // O una ruta de imagen predeterminada si es necesario
        }

        // Generar el PDF con la información de la mascota
        const pdfBuffer = await generatePDF(mascota);

        // Establecer el encabezado de la respuesta para un archivo PDF
        res.setHeader('Content-Disposition', `attachment; filename=ficha_tecnica_${mascota.nombre_mascota}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');

        // Enviar el PDF generado
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor: " + error.message });
    }
};