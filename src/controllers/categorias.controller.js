import { pool } from "../database/conexion.js";
// import { validationResult } from "express-validator";

// Listar Categorías
export const listarCategorias = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM categorias");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Registrar Categoría
export const registrarCategoria = async (req, res) => {
  try {
    const { nombre_categoria, estado } = req.body;
    const [result] = await pool.query(
      "INSERT INTO categorias (nombre_categoria, estado) VALUES (?, ?)",
      [nombre_categoria, estado]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Categoría registrada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se registró la categoría",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};


// Actualizar Categoría por ID
export const actualizarCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    const { nombre_categoria, estado } = req.body;
    
    // Asegúrate de que ambos campos estén presentes
    if (!nombre_categoria || !estado) {
      return res.status(400).json({
        status: 400,
        message: "Faltan campos requeridos",
      });
    }

    const [result] = await pool.query(
      "UPDATE categorias SET nombre_categoria = ?, estado = ? WHERE id_categoria = ?",
      [nombre_categoria, estado, id_categoria]
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Categoría actualizada",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Categoría no encontrada o no se realizaron cambios",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};


// Eliminar Categoría por ID
export const eliminarCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    const [result] = await pool.query("DELETE FROM categorias WHERE id_categoria=?", [id_categoria]);
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Categoría eliminada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se eliminó la categoría",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Buscar Categoría por ID
export const buscarCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    const [result] = await pool.query("SELECT * FROM categorias WHERE id_categoria=?", [id_categoria]);
    if (result.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Categoría encontrada",
        data: result[0],
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "Categoría no encontrada",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};
