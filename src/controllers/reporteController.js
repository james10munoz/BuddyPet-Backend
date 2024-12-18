// controllers/reporteController.js
import { pool } from "../database/conexion.js";
import PDFDocument from "pdfkit";
import moment from "moment";
import fs from 'fs';
import path from 'path';
import { Writable } from "stream";

const generateAdoptedPetsPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            let buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const calculateAgeInMonths = (birthdate) => {
                const birth = new Date(birthdate);
                const now = new Date();

                const years = now.getFullYear() - birth.getFullYear();
                const months = now.getMonth() - birth.getMonth();

                return years * 12 + months;
            };

            // Define las constantes del margen
            const margin = 50;
            const imageSize = 60;
            const textFontSize = 10;
            const imagePath = path.resolve('uploads/buddypet.png');

            // Función para dibujar el margen
            const drawMargin = () => {
                doc
                    .strokeColor('#dc7633')
                    .lineWidth(1)
                    .rect(margin, margin, doc.page.width - 2 * margin, doc.page.height - 2 * margin)
                    .stroke();
            };

            // Función para dibujar la imagen y el texto
            const drawImageAndText = () => {
                if (fs.existsSync(imagePath)) {
                    const img = doc.openImage(imagePath);
                    const imageHeight = img.height / img.width * imageSize;

                    doc.image(imagePath, {
                        fit: [imageSize, imageSize],
                        align: 'center',
                        valign: 'top',
                        x: margin + 6,
                        y: margin + 10
                    });

                    doc
                        .fontSize(textFontSize)
                        .fillColor('black')
                        .font('Helvetica')
                        .text('Buddy Pet', 
                            margin + 6 + 4,
                            margin + imageHeight + 10 - 5);
                } else {
                    console.error('Archivo de imagen no encontrado:', imagePath);
                }
            };

            // Llama a drawMargin y drawImageAndText en la primera página
            drawMargin();
            drawImageAndText();

            // Añadir evento para cuando se agregue una nueva página
            doc.on('pageAdded', () => {
                drawMargin();
                drawImageAndText();
            });

            doc.moveDown(2); // Espacio inicial

            // Diseño del PDF
            doc
                .fontSize(24)
                .font('Helvetica-Bold')
                .fillColor('black')
                .text("Reporte de Mascotas Adoptadas", { align: "center" });

            // Encabezados
            doc.fontSize(12).text(`Fecha de Generación: ${moment().format("YYYY-MM-DD")}`, { align: "center" });
            doc.moveDown(2); // Espacio después de encabezados

            // Tabla de Datos
            data.forEach((mascota, index) => {
                const edadEnMeses = calculateAgeInMonths(mascota.fecha_nacimiento);
                
                // Texto general de la mascota antes de la imagen
                doc.fontSize(12)
                    .fillColor('#333333')
                    .text(`${index + 1}. Nombre: ${mascota.nombre_mascota}`);
                doc.text(`   Fecha de Nacimiento: ${moment(mascota.fecha_nacimiento).format("YYYY-MM-DD")}`);
                doc.text(`   Edad: ${edadEnMeses} meses`);
                doc.text(`   Estado: ${mascota.estado}`);
                doc.text(`   Esterilizado: ${mascota.esterilizado}`);
                doc.text(`   Tamaño: ${mascota.tamano}`);
                doc.text(`   Peso: ${mascota.peso}`);
                doc.text(`   Categoría: ${mascota.nombre_categoria}`);
                doc.text(`   Raza: ${mascota.nombre_raza}`);
                doc.text(`   Ubicación: ${mascota.nombre_departamento}, ${mascota.nombre_municipio}`);
                doc.text(`   Descripción: ${mascota.descripcion}`);
                doc.moveDown(2); // Espacio después de los datos de la mascota

                // Dibujar la imagen de la mascota
                if (mascota.imagen) {
                    if (fs.existsSync(mascota.imagen)) {
                        doc.image(mascota.imagen, {
                            fit: [100, 100],
                            align: 'center',
                            valign: 'top',
                            x: margin + 6,
                            y: doc.y
                        });

                        doc.moveDown(8); // Espacio debajo de la imagen
                    } else {
                        console.error('Archivo de imagen no encontrado:', mascota.imagen);
                    }
                }

                // Información de Vacunas
                if (mascota.vacunas && mascota.vacunas.length > 0) {
                    doc.text('   Vacunas:');
                    mascota.vacunas.forEach(vacuna => {
                        const fechaVacuna = moment(vacuna.fecha_vacuna).format("YYYY-MM-DD");
                        doc.text(`     - ${vacuna.enfermedad} (${fechaVacuna}): ${vacuna.estado}`);
                    });
                } else {
                    doc.text('   Vacunas: No tiene vacunas registradas.');
                }

                // Añadir espacio antes de la siguiente mascota
                doc.moveDown(4); // Espacio entre cada mascota
            });

            // Finaliza el PDF
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};


// Función para generar el PDF
const generatePDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            let buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const calculateAgeInMonths = (birthdate) => {
                const birth = new Date(birthdate);
                const now = new Date();
            
                const years = now.getFullYear() - birth.getFullYear();
                const months = now.getMonth() - birth.getMonth();
            
                return years * 12 + months;
            };
            
            // Define las constantes del margen
            const margin = 50;
            const imageSize = 60;
            const textFontSize = 10;
            const imagePath = path.resolve('uploads/buddypet.png');

            // Función para dibujar el margen
            const drawMargin = () => {
                doc
                    // .strokeColor('#dc7633')
                    .lineWidth(1)
                    // .rect(margin, margin, doc.page.width - 2 * margin, doc.page.height - 2 * margin)
                    .stroke();
            };

            // Función para dibujar la imagen y el texto
            const drawImageAndText = () => {
                if (fs.existsSync(imagePath)) {
                    const img = doc.openImage(imagePath);
                    const imageHeight = img.height / img.width * imageSize; // Calcula la altura de la imagen ajustada

                    doc.image(imagePath, {
                        fit: [imageSize, imageSize],
                        align: 'center',
                        valign: 'top',
                        x: margin + 6, // Ajusta la posición horizontal de la imagen
                        y: margin + 10  // Ajusta la posición vertical de la imagen
                    });

                    doc
                        .fontSize(textFontSize)
                        .fillColor('black')
                        .font('Helvetica')
                        .text('Buddy Pet', 
                            margin + 6 + 4,  // Ajusta la posición horizontal del texto
                            margin + imageHeight + 10 - 5); // Ajusta la posición vertical del texto
                } else {
                    console.error('Archivo de imagen no encontrado:', imagePath);
                }
            };
          

            // Llama a drawMargin y drawImageAndText en la primera página
            drawMargin();
            drawImageAndText();

            // Añadir evento para cuando se agregue una nueva página
            doc.on('pageAdded', () => {
                drawMargin();
                drawImageAndText();
            });
            doc.moveDown();
            doc.moveDown();
            // Diseño del PDF
            doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .fillColor('black')
            .text("Reporte de Mascotas en Adopción", { align: "center" });

            // Encabezados
            doc.fontSize(12).text(`Fecha de Generación: ${moment().format("YYYY-MM-DD")}`, { align: "center" });
            doc.moveDown();
            doc.moveDown();
// Tabla de Datos
data.forEach((mascota, index) => {
  const edadEnMeses = calculateAgeInMonths(mascota.fecha_nacimiento);
  
  // Texto general de la mascota antes de la imagen
  doc
  .font('Helvetica')
  .fontSize(12)
  .fillColor('black')
     .text(`${index + 1}. Nombre: ${mascota.nombre_mascota}`);
  doc.text(`   Fecha de Nacimiento: ${moment(mascota.fecha_nacimiento).format("YYYY-MM-DD")}`);
  doc.text(`   Edad: ${edadEnMeses} meses`);
  doc.text(`   Estado: ${mascota.estado}`);
  doc.text(`   Esterilizado: ${mascota.esterilizado}`);
  doc.text(`   Tamaño: ${mascota.tamano}`);
  doc.text(`   Peso: ${mascota.peso}`);
  doc.text(`   Categoría: ${mascota.nombre_categoria}`);
  doc.text(`   Raza: ${mascota.nombre_raza}`);
  doc.text(`   Ubicación: ${mascota.nombre_departamento}, ${mascota.nombre_municipio}`);
  doc.text(`   Descripción: ${mascota.descripcion}`);
  doc.moveDown();

  // Dibujar la imagen de la mascota
  if (mascota.imagen) {
      if (fs.existsSync(mascota.imagen)) {
          doc.image(mascota.imagen, {
              fit: [100, 100], // Tamaño de la imagen más grande
              align: 'center',
              valign: 'top',
              x: margin + 6,
              y: doc.y // Ajusta la posición vertical de la imagen
          });

          // Avanza el cursor después de la imagen para evitar superposiciones
          doc.moveDown(5); // Ajustar este valor para dar más espacio debajo de la imagen
      } else {
          console.error('Archivo de imagen no encontrado:', mascota.imagen);
      }
  }

  // Información de Vacunas (asegúrate de que se muestre después de la imagen)
  if (mascota.vacunas && mascota.vacunas.length > 0) {
      doc.text('   Vacunas:');
      mascota.vacunas.forEach(vacuna => {
          const fechaVacuna = moment(vacuna.fecha_vacuna).format("YYYY-MM-DD");
          doc.text(`     - ${vacuna.enfermedad} (${fechaVacuna}): ${vacuna.estado}`);
      });
  } else {
      doc.text('   Vacunas: No tiene vacunas registradas.');
  }

  // Añadir espacio antes de la siguiente mascota en el listado
  doc.moveDown(3);
});
// Define la función para dibujar el pie de página
const drawFooter = () => {
    const fixedXPosition = 474;
    const fixedYPosition = doc.page.height - 84;

    if (fs.existsSync(imagePath)) {
        doc.image(imagePath, {
            fit: [60, 60],
            align: 'center',
            valign: 'top',
            x: fixedXPosition,
            y: fixedYPosition - 60
        });
    } else {
        console.error('Archivo de imagen no encontrado:', imagePath);
    }

    doc
        .fontSize(10)
        .fillColor('black')
        .font('Helvetica')
        .text('Buddy Pet', fixedXPosition, fixedYPosition);
};

// Llama a drawMargin, drawImageAndText, y drawFooter en la primera página
drawMargin();
drawImageAndText();
drawFooter();

// Añadir evento para cuando se agregue una nueva página
doc.on('pageAdded', () => {
    drawMargin();
    drawImageAndText();
    drawFooter();
});


            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};



// Controlador para generar el reporte
export const generarReporte = async (req, res) => {
  try {
    const { tipo_fecha, fecha_inicio, fecha_fin, categoria, raza } = req.query;

    // Validación de parámetros
    if (!tipo_fecha || (tipo_fecha === "rango" && (!fecha_inicio || !fecha_fin))) {
      return res.status(400).json({
        status: 400,
        message: "Parámetros de fecha insuficientes",
      });
    }

    // Construir la consulta SQL con filtros
    let query = `
      SELECT 
        m.id_mascota,
        m.nombre_mascota, 
        m.fecha_nacimiento, 
        c.nombre_categoria, 
        r.nombre_raza, 
        m.estado,
        m.esterilizado,
        m.tamano,
        m.peso,
        m.descripcion,
        d.nombre_departamento,  
        mu.nombre_municipio    
      FROM mascotas m
      INNER JOIN categorias c ON m.fk_id_categoria = c.id_categoria
      INNER JOIN razas r ON m.fk_id_raza = r.id_raza
      INNER JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
      INNER JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
      WHERE m.estado IN ('En Adopcion', 'Urgente')
    `;
    let params = [];

    // Filtrar por fecha
    if (tipo_fecha === "dia") {
      query += " AND DATE(m.fecha_nacimiento) = ?";
      params.push(fecha_inicio);
    } else if (tipo_fecha === "mes") {
      query += " AND MONTH(m.fecha_nacimiento) = ? AND YEAR(m.fecha_nacimiento) = ?";
      const [mes, año] = fecha_inicio.split("-");
      params.push(mes, año);
    } else if (tipo_fecha === "rango") {
      query += " AND DATE(m.fecha_nacimiento) BETWEEN ? AND ?";
      params.push(fecha_inicio, fecha_fin);
    }

    // Filtrar por categoría
    if (categoria) {
      query += " AND c.id_categoria = ?";
      params.push(categoria);
    }

    // Filtrar por raza
    if (raza) {
      query += " AND r.id_raza = ?";
      params.push(raza);
    }

    const [mascotas] = await pool.query(query, params);

    if (mascotas.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No se encontraron mascotas con los filtros proporcionados",
      });
    }

    // Obtener las vacunas y una imagen para cada mascota
    for (let mascota of mascotas) {
      const [vacunas] = await pool.query(`
        SELECT enfermedad, estado, fecha_vacuna
        FROM vacunas 
        WHERE fk_id_mascota = ?
      `, [mascota.id_mascota]);

      mascota.vacunas = vacunas; // Agregar las vacunas a la mascota

      const baseImagePath = path.resolve('C:/James/mascotas/BackendMascotas-develop/backend/uploads');

const [imagenesResult] = await pool.query(`
  SELECT ruta_imagen 
  FROM imagenes 
  WHERE fk_id_mascota = ?
`, [mascota.id_mascota]);

// Si hay imágenes, tomar la primera; de lo contrario, null
mascota.imagenes = imagenesResult.map(img => img.ruta_imagen);
mascota.imagen = imagenesResult.length > 0 ? path.join(baseImagePath, imagenesResult[0].ruta_imagen) : null;

// Verificar en consola qué dato llega en imagen
console.log(`Mascota ID: ${mascota.id_mascota}, Imagen: ${mascota.imagen}, Todas las imágenes:`, mascota.imagenes);

    }

    // Generar el PDF
    const pdfBuffer = await generatePDF(mascotas);
    
    

    // Configurar las cabeceras para la descarga del PDF
    res.setHeader("Content-Disposition", `attachment; filename=Reporte_Mascotas_${Date.now()}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);console.log('Con esto se genera el reporte ',pdfBuffer.data);
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).json({
      status: 500,
      message: "Error en el servidor: " + error.message,
    });
  }
};




// Controlador para generar el reporte
export const generarReporteAdopciones = async (req, res) => {
  try {
      const { id_mascota, fecha_inicio, fecha_fin, categoria, raza, tipo_fecha } = req.query;

      // Validación de parámetros
      if (!tipo_fecha) {
          return res.status(400).json({
              status: 400,
              message: "El tipo de fecha es requerido.",
          });
      }

      // Construir la consulta SQL con filtros
      let query = `
          SELECT 
              a.id_adopcion,
              a.fecha_adopcion, 
              a.estado,
              m.id_mascota,
              m.nombre_mascota, 
              m.fecha_nacimiento, 
              c.nombre_categoria, 
              r.nombre_raza, 
              m.esterilizado,
              m.tamano,
              m.peso,
              m.descripcion,
              d.nombre_departamento,  
              mu.nombre_municipio    
          FROM adopciones a
          INNER JOIN mascotas m ON a.fk_id_mascota = m.id_mascota
          INNER JOIN categorias c ON m.fk_id_categoria = c.id_categoria
          INNER JOIN razas r ON m.fk_id_raza = r.id_raza
          INNER JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
          INNER JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
          WHERE a.estado = 'aceptada'
      `;
      let params = [];

      // Filtrar por fecha según el tipo de fecha
      if (tipo_fecha === 'dia' && fecha_inicio) {
          query += " AND DATE(a.fecha_adopcion) = ?";
          params.push(fecha_inicio);
      } else if (tipo_fecha === 'mes' && fecha_inicio) {
          // Suponiendo que fecha_inicio tiene el formato "MM-YYYY"
          const [mes, anio] = fecha_inicio.split('-');
          query += " AND MONTH(a.fecha_adopcion) = ? AND YEAR(a.fecha_adopcion) = ?";
          params.push(mes, anio);
      } else if (fecha_inicio && fecha_fin) {
          // Si hay un rango de fechas
          query += " AND DATE(a.fecha_adopcion) BETWEEN ? AND ?";
          params.push(fecha_inicio, fecha_fin);
      } else {
          return res.status(400).json({
              status: 400,
              message: "Parámetros de fecha insuficientes",
          });
      }

      // Filtrar por ID de mascota
      if (id_mascota) {
          query += " AND m.id_mascota = ?";
          params.push(id_mascota);
      }

      // Filtrar por categoría
      if (categoria) {
          query += " AND c.id_categoria = ?";
          params.push(categoria);
      }

      // Filtrar por raza
      if (raza) {
          query += " AND r.id_raza = ?";
          params.push(raza);
      }

      const [adopciones] = await pool.query(query, params);

      if (adopciones.length === 0) {
          return res.status(404).json({
              status: 404,
              message: "No se encontraron adopciones con los filtros proporcionados",
          });
      }
      if (!categoria && !raza) {
        return res.status(400).json({
            status: 400,
            message: "Se requiere al menos una categoría o raza para filtrar las adopciones.",
        });
    }
    

      // Obtener las vacunas y una imagen para cada mascota
      for (let adopcion of adopciones) {
          const [vacunas] = await pool.query(`
              SELECT enfermedad, estado, fecha_vacuna
              FROM vacunas 
              WHERE fk_id_mascota = ?
          `, [adopcion.id_mascota]);

          adopcion.vacunas = vacunas; // Agregar las vacunas a la mascota

          const baseImagePath = path.resolve('C:/James/mascotas/BackendMascotas-develop/backend/uploads');

          const [imagenesResult] = await pool.query(`
              SELECT ruta_imagen 
              FROM imagenes 
              WHERE fk_id_mascota = ?
          `, [adopcion.id_mascota]);

          // Si hay imágenes, tomar la primera; de lo contrario, null
          adopcion.imagenes = imagenesResult.map(img => img.ruta_imagen);
          adopcion.imagen = imagenesResult.length > 0 ? path.join(baseImagePath, imagenesResult[0].ruta_imagen) : null;

          // Verificar en consola qué dato llega en imagen
          console.log(`Mascota ID: ${adopcion.id_mascota}, Imagen: ${adopcion.imagen}, Todas las imágenes:`, adopcion.imagenes);
      }

      // Generar el PDF
      const pdfBuffer = await generateAdoptedPetsPDF(adopciones);

      // Configurar las cabeceras para la descarga del PDF
      res.setHeader("Content-Disposition", `attachment; filename=Reporte_Adopciones_${Date.now()}.pdf`);
      res.setHeader("Content-Type", "application/pdf");

      res.send(pdfBuffer);
  } catch (error) {
      console.error("Error al generar el reporte:", error);
      res.status(500).json({
          status: 500,
          message: "Error en el servidor: " + error.message,
      });
  }
};

