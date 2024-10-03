import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Función para formatear las fechas
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Función para calcular la edad en meses
const calculateAgeInMonths = (birthdate) => {
  const birth = new Date(birthdate);
  const now = new Date();

  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  return years * 12 + months;
};

export const generatePDF = async (mascota) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, left: 50, right: 50, bottom: 50 },
    info: {
      Title: `Ficha Técnica - ${mascota.nombre_mascota}`,
      Author: 'BuddyPet App',
    },
  });

  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // **Header Section:**
  const headerMargin = 10;
  const imagePath = path.resolve('uploads/buddypet.png');
  const mascotaImagePath = path.resolve('uploads', mascota.imagen);

  // Insertar logo en la parte superior izquierda
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, {
      fit: [200, 200],
      align: 'left',
      valign: 'top',
      x: headerMargin,
      y: headerMargin,
    });
  } else {
    console.error('Archivo de imagen no encontrado:', imagePath);
  }

  // Título de la ficha técnica
  doc
    .fontSize(24)
    .fillColor('black')
    .font('Helvetica-Bold')
    .text(`Ficha Técnica - ${mascota.nombre_mascota}`, {
      align: 'center',
      underline: true,
      lineGap: 5,
    })
    .moveDown(1);

  // **Mascota Image:**
  if (fs.existsSync(mascotaImagePath)) {
    doc
      .image(mascotaImagePath, {
        fit: [150, 200],
        align: 'center',
        x: 350,
        y: 180,
      })
      .strokeColor('black')
      .lineWidth(1)
      .rect(350, 120, 150, 200)
      .stroke();
  } else {
    console.error('Imagen de mascota no encontrada:', mascotaImagePath);
  }

  // **Tabla de Información de la Mascota:**
  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor('black')
    .text('Nombre:', 50, 150)
    .text(`${mascota.nombre_mascota}`, 150, 150)
    .text('Fecha Nacimiento:', 50, 170)
    .text(`${formatDate(mascota.fecha_nacimiento)}`, 150, 170)
    .text('Edad:', 50, 190)
    .text(`${calculateAgeInMonths(mascota.fecha_nacimiento)} meses`, 150, 190)
    .text('Estado:', 50, 210)
    .text(`${mascota.estado}`, 150, 210)
    .text('Esterilizado:', 50, 230)
    .text(`${mascota.esterilizado}`, 150, 230)
    .text('Tamaño:', 50, 250)
    .text(`${mascota.tamano}`, 150, 250)
    .text('Peso:', 50, 270)
    .text(`${mascota.peso} kg`, 150, 270)
    .text('Categoría:', 50, 290)
    .text(`${mascota.nombre_categoria}`, 150, 290)
    .text('Raza:', 50, 310)
    .text(`${mascota.nombre_raza}`, 150, 310)
    .text('Ubicación:', 50, 330)
    .text(
      `${mascota.nombre_departamento}, ${mascota.nombre_municipio}`,
      150,
      330
    )
    .moveDown(2);

  // **Vacunas Section:**
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .text('Vacunas:', 50, 370, { underline: true });

  mascota.vacunas.forEach((vacuna, index) => {
    const yPos = 400 + index * 20;
    const fechaVacuna = formatDate(vacuna.fecha_vacuna);
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(
        `- ${vacuna.enfermedad} (${fechaVacuna}): ${vacuna.estado}`,
        50,
        yPos
      );
  });

  doc.moveDown(2);

  // **Descripción:**
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .text('Descripción:', { underline: true });

  doc
    .font('Helvetica')
    .fontSize(12)
    .text(mascota.descripcion)
    .moveDown(2);

  // **Pie de página:**
  const footerMargin = 40;
  doc
    .fontSize(20)
    .text('BuddyPet', {
      align: 'center',
      y: doc.page.height - footerMargin,
    });

  // Terminar el PDF
  doc.end();

  // Convertir el PDF a un buffer
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
};
