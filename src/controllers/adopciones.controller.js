import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

// Listar Adopciones
// Controlador para listar mascotas con usuarios asociados en proceso de adopción
export const listarAdopciones = async (req, res) => {
  try {
    // Ejecutar la consulta SQL
    const [result] = await pool.query(`
      SELECT 
        m.id_mascota, 
        m.nombre_mascota, 
        m.fecha_nacimiento, 
        m.descripcion, 
        m.esterilizado, 
        m.tamano, 
        m.peso, 
        m.fk_id_categoria, 
        r.nombre_raza AS raza,
        m.fk_id_departamento, 
        m.fk_id_municipio, 
        m.sexo,
        u.id_usuario, 
        u.nombre AS usuario_nombre, 
        u.apellido AS usuario_apellido, 
        u.correo AS usuario_correo,
        u.telefono AS usuario_telefono,
        a.id_adopcion, 
        a.estado AS estado_adopcion,
        GROUP_CONCAT(i.ruta_imagen) AS imagenes
      FROM mascotas m
      JOIN adopciones a ON m.id_mascota = a.fk_id_mascota
      JOIN usuarios u ON a.fk_id_usuario_adoptante = u.id_usuario
      JOIN razas r ON m.fk_id_raza = r.id_raza
      LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
      WHERE m.estado = 'Reservado' AND a.estado = 'proceso de adopcion'
      GROUP BY m.id_mascota, u.id_usuario, a.id_adopcion;
    `);
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        status: 404,
        message: "No se encontraron listas de mascotas con usuarios asociados",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error.message
    });
  }
};


// Listar mascotas aceptadas por parte del usuario
export const listarMascotasAceptadas = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const query = `
      SELECT 
        m.id_mascota, 
        m.nombre_mascota, 
        m.fecha_nacimiento, 
        m.descripcion, 
        m.esterilizado, 
        m.tamano, 
        m.peso, 
        m.sexo,
        m.estado,
        r.nombre_raza AS raza,
        d.nombre_departamento AS departamento,
        mu.nombre_municipio AS municipio,
        a.fecha_adopcion,
        GROUP_CONCAT(i.ruta_imagen) AS imagenes
      FROM adopciones a
      INNER JOIN mascotas m ON a.fk_id_mascota = m.id_mascota
      LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
      JOIN razas r ON m.fk_id_raza = r.id_raza
      JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
      JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
      WHERE a.fk_id_usuario_adoptante = ? AND a.estado = 'aceptada'
      GROUP BY m.id_mascota, a.fecha_adopcion;
    `;

    const [results] = await pool.query(query, [id_usuario]);

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({
        status: 404,
        message: "No se encontraron mascotas aceptadas para este usuario",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor: " + error.message,
    });
  }
};



// Listar Mascotas en Proceso de Adopción por Usuario
export const listarMascotasEnProcesoAdopcion = async (req, res) => {
  try {
    const { fk_id_usuario_adoptante } = req.params;

    const query = `
      SELECT 
        a.id_adopcion, 
        m.id_mascota, 
        m.nombre_mascota, 
        m.sexo, 
        r.nombre_raza AS raza,
        d.nombre_departamento AS departamento,
        mu.nombre_municipio AS municipio,
        GROUP_CONCAT(i.ruta_imagen) AS imagenes,
        MAX(a.fecha_adopcion) AS fecha_adopcion, 
        a.estado AS estado_adopcion
      FROM adopciones a 
      JOIN mascotas m ON a.fk_id_mascota = m.id_mascota 
      LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
      JOIN razas r ON m.fk_id_raza = r.id_raza
      JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
      JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
            WHERE a.fk_id_usuario_adoptante = ? AND a.estado = 'proceso de adopcion'
      GROUP BY a.id_adopcion, m.id_mascota, m.nombre_mascota, m.sexo, r.nombre_raza, d.nombre_departamento, mu.nombre_municipio, a.estado;
    `;

    const [result] = await pool.query(query, [fk_id_usuario_adoptante]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        status: 404,
        message: "No se encontraron solicitudes de adopción para este usuario",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor: " + error.message,
    });
  }
};



// Controlador para iniciar el proceso de adopción
export const iniciarAdopcion = async (req, res) => {
  try {
    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Obtener parámetros y cuerpo de la solicitud
    const { id_mascota } = req.params;
    const { fk_id_usuario_adoptante } = req.body;

    console.log("Cuerpo de la solicitud recibido:", req.body);
    console.log("ID de usuario recibido:", fk_id_usuario_adoptante);

    // Verificar si el usuario existe
    const [usuarioResult] = await pool.query("SELECT id_usuario FROM usuarios WHERE id_usuario = ?", [fk_id_usuario_adoptante]);
    if (usuarioResult.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No se encontró el usuario'
      });
    }

    // Verificar si la mascota existe y su estado actual
    const [mascotaResult] = await pool.query("SELECT estado FROM mascotas WHERE id_mascota = ?", [id_mascota]);

    if (mascotaResult.length > 0) {
      const estadoMascota = mascotaResult[0].estado;

      // Verificar si la mascota está disponible para adopción
      if (estadoMascota === 'En Adopcion' || estadoMascota === 'Urgente') {
        // Iniciar el proceso de adopción y guardar el estado previo
        const [insertAdopcion] = await pool.query(
          "INSERT INTO adopciones (fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado, estado_anterior) VALUES (?, ?, CURDATE(), 'proceso de adopcion', ?)",
          [id_mascota, fk_id_usuario_adoptante, estadoMascota]
        );

        // Verificar si la adopción se insertó correctamente
        if (insertAdopcion.affectedRows > 0) {
          // Actualizar el estado de la mascota
          await pool.query("UPDATE mascotas SET estado = 'Reservado' WHERE id_mascota = ?", [id_mascota]);
          res.status(200).json({
            status: 200,
            message: 'Proceso de adopción iniciado correctamente'
          });
        } else {
          res.status(500).json({
            status: 500,
            message: 'No se pudo iniciar el proceso de adopción'
          });
        }
      } else {
        res.status(400).json({
          status: 400,
          message: 'La mascota no está disponible para adopción'
        });
      }
    } else {
      res.status(404).json({
        status: 404,
        message: 'No se encontró la mascota'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error.message
    });
  }
};


// Controlador para administrar la adopción (aceptar o denegar)
export const administrarAdopcion = async (req, res) => {
  try {
    const { id_adopcion } = req.params;
    const { accion } = req.body;

    // Verificar si la solicitud de adopción existe
    const [adopcionResult] = await pool.query("SELECT * FROM adopciones WHERE id_adopcion = ?", [id_adopcion]);
    if (adopcionResult.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No se encontró la solicitud de adopción'
      });
    }

    const adopcion = adopcionResult[0];

    // Obtener el estado anterior de la mascota desde la tabla `adopciones` (se supone que fue almacenado al iniciar la adopción)
    const [estadoAnteriorResult] = await pool.query("SELECT estado_anterior FROM adopciones WHERE id_adopcion = ?", [id_adopcion]);
    if (estadoAnteriorResult.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No se encontró el estado anterior de la mascota'
      });
    }

    const estadoAnterior = estadoAnteriorResult[0].estado_anterior; // Obtener el estado anterior de la adopción
    let nuevoEstadoMascota;
    let fechaAdopcionAceptada = null;

    // Procesar la acción solicitada
    if (accion === 'aceptar') {
      nuevoEstadoMascota = 'Adoptado';
      fechaAdopcionAceptada = new Date(); // Establecer la fecha de aceptación

      // Actualizar la solicitud de adopción con el estado "aceptada"
      await pool.query(
        "UPDATE adopciones SET estado = 'aceptada', fecha_adopcion = ? WHERE id_adopcion = ?", 
        [fechaAdopcionAceptada, id_adopcion]
      );
    } else if (accion === 'denegar') {
      nuevoEstadoMascota = estadoAnterior; // Restaurar el estado previo de la mascota

      // Actualizar el estado de la mascota primero
      await pool.query("UPDATE mascotas SET estado = ? WHERE id_mascota = ?", [nuevoEstadoMascota, adopcion.fk_id_mascota]);

      // Luego eliminar la solicitud de adopción
      await pool.query("DELETE FROM adopciones WHERE id_adopcion = ?", [id_adopcion]);
    } else {
      return res.status(400).json({
        status: 400,
        message: 'Acción no válida'
      });
    }

    // Actualizar el estado de la mascota si se acepta la adopción
    if (accion === 'aceptar') {
      const [updateResult] = await pool.query("UPDATE mascotas SET estado = ? WHERE id_mascota = ?", [nuevoEstadoMascota, adopcion.fk_id_mascota]);

      if (updateResult.affectedRows > 0) {
        return res.status(200).json({
          status: 200,
          message: `La adopción ha sido aceptada y el estado de la mascota se ha actualizado a ${nuevoEstadoMascota}`
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: 'No se pudo actualizar el estado de la mascota'
        });
      }
    } else {
      return res.status(200).json({
        status: 200,
        message: 'La adopción ha sido denegada y la mascota ha vuelto a su estado anterior'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error.message
    });
  }
};
