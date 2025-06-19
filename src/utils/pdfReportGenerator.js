import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { decimas, redondear } from 'src/composables/FuncionesG'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'

import { imagen } from 'src/boot/url'

const tipo = { 1: 'Pedido Compra', 2: 'Pedido Movimiento' }

export default function imprimirReporte(detallePedido) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detallePedido.value))

  const datos = detallePlano[0].detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 100, halign: 'left' },
      cantidad: { cellWidth: 80, halign: 'right' },
    },
    didParseCell: function (data) {
      if (data.row.index >= datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}/${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('ORDEN PEDIDO', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        doc.setDrawColor(0)
        doc.setLineWidth(0.2)
        doc.line(5, 30, 200, 30)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS ORDEN:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        const cliente = `${detallePlano[0].almacen}`
        doc.text(cliente, 5, 38)

        doc.text(detallePlano[0].empresa.direccion, 5, 41)
        doc.text(detallePlano[0].empresa.email, 5, 44)
        doc.text('Fecha de Orden: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuarios[0].usuario, 200, 38, { align: 'right' })
        doc.text(detallePlano[0].usuarios[0].cargo, 200, 41, { align: 'right' })
        doc.text('Tipo ' + tipo[detallePlano[0].tipopedido], 200, 44, { align: 'right' })
      }
    },
  })
  return doc
}
export function PDFreporteCuentasXCobrarPeriodo(reportData, startDate, endDate) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha_actual' }, // Match actual field names from API
    { header: 'Cliente', dataKey: 'nombre_cliente' },
    { header: 'Comercial', dataKey: 'nombre_comercial' },
    { header: 'Monto Venta', dataKey: 'monto_total_venta' },
    { header: 'Desc.', dataKey: 'descuento_venta' },
    { header: 'Saldo Cobro', dataKey: 'saldo_estado_cobro' },
    { header: 'Monto Cobrado', dataKey: 'monto_detalle_cobro' },
    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]

  // Data for jsPDF-autoTable - map from `reportData.value`
  const datos = reportData.value.map((item, indice) => ({
    indice: indice + 1,
    fecha_actual: item.fecha_actual,
    nombre_cliente: item.nombre_cliente,
    nombre_comercial: item.nombre_comercial,
    monto_total_venta: item.monto_total_venta.toFixed(2), // Format for display
    descuento_venta: item.descuento_venta.toFixed(2),
    saldo_estado_cobro: item.saldo_estado_cobro.toFixed(2),
    monto_detalle_cobro: item.monto_detalle_cobro.toFixed(2),
    // foto_detalle_cobro: item.foto_detalle_cobro, // Handle separately if needed
  }))

  const monto_total_venta = datos.reduce((sum, u) => {
    return sum + Number(u.monto_total_venta)
  }, 0)
  const saldo_estado_cobro = datos.reduce((sum, u) => {
    return sum + Number(u.saldo_estado_cobro)
  }, 0)
  const monto_detalle_cobro = datos.reduce((sum, u) => {
    return sum + Number(u.monto_detalle_cobro)
  }, 0)
  const descuento_venta = datos.reduce((sum, u) => {
    return sum + Number(u.descuento_venta)
  }, 0)
  const pieTable = {
    nombre_comercial: 'Total:',
    monto_total_venta: monto_total_venta.toFixed(2),
    descuento_venta: descuento_venta.toFixed(2),
    saldo_estado_cobro: saldo_estado_cobro.toFixed(2),
    monto_detalle_cobro: monto_detalle_cobro.toFixed(2),
  }
  datos.push(pieTable)

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6, // Slightly increased for readability
      cellPadding: 1, // Reduced padding to fit more columns
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
      fontSize: 7, // Header font size
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha_actual: { cellWidth: 20, halign: 'center' },
      nombre_cliente: { cellWidth: 40, halign: 'left' },
      nombre_comercial: { cellWidth: 40, halign: 'left' },
      monto_total_venta: { cellWidth: 20, halign: 'right' },
      descuento_venta: { cellWidth: 20, halign: 'right' },
      saldo_estado_cobro: { cellWidth: 20, halign: 'right' },
      monto_detalle_cobro: { cellWidth: 25, halign: 'right' },
      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      // Use 'data' parameter provided by autoTable
      // Only draw header on the first page
      // Or draw on every page: if (doc.internal.getNumberOfPages() === 1) { ... }
      // This header will appear on every page for multi-page reports
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal') // Reset font style

      // Header content
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness

      // Line before header
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
        }
        // If logoEmpresa is a URL, it's more complex. Consider using it as Base64.
        // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20) // If using URL, uncomment and ensure URL_APIE is defined

        // Company Info (Left)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Report Title (Center)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE DE COBROS DIARIOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section
        doc.line(5, 30, doc.internal.pageSize.getWidth() - 5, 30)

        // Report Data Info (Left below line)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          `Fecha Inicio: ${cambiarFormatoFecha(startDate.value)} - Fecha Fin: ${cambiarFormatoFecha(endDate.value)}`,
          5,
          38,
        )

        // User Data (Right below line)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', doc.internal.pageSize.getWidth() - 5, 35, {
          align: 'right',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, doc.internal.pageSize.getWidth() - 5, 38, { align: 'right' })
        doc.text(cargo, doc.internal.pageSize.getWidth() - 5, 41, { align: 'right' })
      }
      // Logo (if base64)

      // Footer (Page Number)
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' },
      )
      doc.text(
        `Fecha de Impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'left' },
      )
    },
  })

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFreporteCreditos(
  reportData,
  startDate,
  endDate,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({
    orientation: 'landscape', // Usamos horizontal para más columnas
    unit: 'mm',
  })

  // Datos de la empresa
  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo
  const nombreUsuario = idempresa.nombre
  const cargoUsuario = idempresa.cargo

  // Configuración de columnas
  const columns = [
    { header: 'N°', dataKey: 'numero' },
    { header: 'Fecha Crédito', dataKey: 'fechaventa' },
    { header: 'Cliente', dataKey: 'razonsocial' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Fecha Límite', dataKey: 'fechalimite' },
    { header: 'Cuotas', dataKey: 'ncuotas' },
    { header: 'Cuotas Pagadas', dataKey: 'cuotaspagadas' },
    { header: 'Valor Cuota', dataKey: 'valorcuotas' },
    { header: 'Monto Venta', dataKey: 'montoventa' },
    { header: 'Total Cobrado', dataKey: 'totalcobrado' },
    { header: 'Saldo', dataKey: 'saldo' },
    { header: 'Total Anulado', dataKey: 'totalanulado' },
    { header: 'Total Atrasado', dataKey: 'totalatrasado' },
    { header: 'Días Mora', dataKey: 'moradias' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  // Mapeo de datos
  const datos = reportData.map((item) => ({
    numero: item.numero,
    fechaventa: item.fechaventa ? cambiarFormatoFecha(item.fechaventa) : '',
    razonsocial: item.razonsocial,
    sucursal: item.sucursal,
    fechalimite: item.fechalimite ? cambiarFormatoFecha(item.fechalimite) : '',
    ncuotas: item.ncuotas,
    cuotaspagadas: item.cuotaspagadas || '0',
    valorcuotas: item.valorcuotas ? decimas(redondear(parseFloat(item.valorcuotas))) : '0.00',
    montoventa: item.montoventa ? decimas(redondear(parseFloat(item.montoventa))) : '0.00',
    totalcobrado: item.totalcobrado ? decimas(redondear(parseFloat(item.totalcobrado))) : '0.00',

    saldo: decimas(redondear(parseFloat(item.saldo))) || '0.00',
    totalanulado: Number(item.estado) === 4 ? decimas(redondear(parseFloat(item.saldo))) : 0.0,
    totalatrasado: Number(item.estado) === 3 ? decimas(redondear(parseFloat(item.saldo))) : 0.0,
    moradias:
      item.fechalimite && Number(item.estado) === 3
        ? Math.max(obtenerDias(item.fechalimite), 0)
        : 0,
    estado: getEstadoText(item.estado),
  }))

  // Configuración de autoTable
  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [22, 160, 133], // Verde
      textColor: 255,
      halign: 'center',
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      numero: { cellWidth: 10 },
      fechaventa: { cellWidth: 20 },
      razonsocial: { cellWidth: 30 },
      sucursal: { cellWidth: 25 },
      fechalimite: { cellWidth: 20 },
      ncuotas: { cellWidth: 12 },
      cuotaspagadas: { cellWidth: 18 },
      valorcuotas: { cellWidth: 18, halign: 'right' },
      montoventa: { cellWidth: 18, halign: 'right' },
      totalcobrado: { cellWidth: 18, halign: 'right' },
      saldo: { cellWidth: 18, halign: 'right' },
      totalanulado: { cellWidth: 18, halign: 'right' },
      totalatrasado: { cellWidth: 18, halign: 'right' },
      moradias: { cellWidth: 15 },
      estado: { cellWidth: 15 },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'grid',
    didDrawPage: (data) => {
      // Encabezado en cada página
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')

      // Solo agregar logo en primera página
      if (data.pageNumber === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          doc.addImage(logoEmpresa, 'PNG', 10, 5, 20, 20)
        }

        // Información de la empresa
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 35, 10)
        doc.setFontSize(8)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 35, 15)
        doc.text(`Tel: ${telefonoEmpresa}`, 35, 20)

        // Título del reporte
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE DE CRÉDITOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Fechas del reporte
        doc.setFontSize(9)
        doc.text(
          `Del ${cambiarFormatoFecha(startDate)} al ${cambiarFormatoFecha(endDate)}`,
          doc.internal.pageSize.getWidth() / 2,
          22,
          { align: 'center' },
        )

        // Filtros aplicados
        let filtrosText = ''
        if (clienteSeleccionado) {
          filtrosText += `Cliente: ${clienteSeleccionado.nombre} `
        }
        if (sucursalSeleccionada) {
          filtrosText += `Sucursal: ${sucursalSeleccionada.nombre}`
        }

        if (filtrosText) {
          doc.setFontSize(8)
          doc.text(`Filtros: ${filtrosText}`, 35, 28)
        }

        // Usuario generador
        doc.setFontSize(8)
        doc.text(
          `Generado por: ${nombreUsuario} - ${cargoUsuario}`,
          doc.internal.pageSize.getWidth() - 10,
          28,
          { align: 'right' },
        )

        // Línea separadora
        doc.setDrawColor(0)
        doc.setLineWidth(0.2)
        doc.line(10, 32, doc.internal.pageSize.getWidth() - 10, 32)
      }

      // Pie de página (número de página)
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - 10,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'right' },
      )
      doc.text(
        `Fecha impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        10,
        doc.internal.pageSize.getHeight() - 5,
      )
    },
  })

  return doc
}

// Función auxiliar para obtener texto del estado
function getEstadoText(estado) {
  const estados = {
    1: 'Activo',
    2: 'Finalizado',
    3: 'Atrasado',
    4: 'Anulado',
  }
  return estados[Number(estado)] || ''
}

// Función auxiliar para calcular días de mora
function obtenerDias(fechalimite) {
  const fecha1 = Math.floor(new Date().getTime() / (1000 * 3600 * 24))
  const fecha2 = Math.floor(new Date(fechalimite).getTime() / (1000 * 3600 * 24))
  return fecha1 - fecha2
}

export function PDFreporteStockProductosIndividual(processedRows) {
  console.log(processedRows.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Fecha Registro', dataKey: 'fecha' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Sub Categoría', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'País', dataKey: 'pais' },
    { header: 'Stock mínimo', dataKey: 'stockminimo' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Costo total', dataKey: 'costo' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const datos = processedRows.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    almacen: item.almacen,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    pais: item.pais,
    stockminimo: item.stockminimo,
    stock: item.stock,
    costo: decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
    estado: item.estado == 1 ? 'Activo' : 'No activo',
  }))
  const totalstock = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock)),
    0,
  )

  const costoTotal = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock) * parseFloat(dato.costounitario)),
    0,
  )

  datos.push({ stockminimo: 'Total:', stock: totalstock, costo: decimas(costoTotal) })
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'center' },
      almacen: { cellWidth: 25, halign: 'left' },
      codigo: { cellWidth: 20, halign: 'left' },
      producto: { cellWidth: 30, halign: 'left' },
      categoria: { cellWidth: 30, halign: 'left' },
      subcategoria: { cellWidth: 25, halign: 'left' },
      descripcion: { cellWidth: 40, halign: 'left' },
      unidad: { cellWidth: 10, halign: 'center' },
      pais: { cellWidth: 20, halign: 'center' },
      stockminimo: { cellWidth: 15, halign: 'right' },
      stock: { cellWidth: 15, halign: 'right' },
      costo: { cellWidth: 15, halign: 'right' },
      estado: { cellWidth: 15, halign: 'center' },
    },
    // didParseCell: function (data) {
    //   // Ejemplo: destacar la última fila (que contiene el Monto Total)
    //   // if (data.row.index === datos.length - 1) {
    //   //   data.cell.styles.halign = 'left'
    //   // }
    //   // if (data.row.index === datos.length - 2) {
    //   //   data.cell.styles.halign = 'left'
    //   // }
    //   // if (data.row.index === datos.length - 3) {
    //   //   data.cell.styles.halign = 'left'
    //   // }
    //   // También puedes aplicar estilo a una fila específica, por ejemplo la de índice 2:
    //   // if (data.row.index === 2) {
    //   //   data.cell.styles.fontStyle = 'italic'
    //   //   data.cell.styles.fillColor = [255, 240, 200]
    //   // }
    // },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //console.log(`${URL_APIE}${logoEmpresa}`)
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE PRODUCTOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

export function PDFreporteStockProductosIndividual_img(processedRows) {
  console.log(processedRows.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Sub Categoría', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Costo total', dataKey: 'costo' },
    { header: 'Imagen', dataKey: 'imagen' },
  ]

  // Helper function to add images (you might need to adjust this based on your image handling)
  const addImageToCell = (imagePath) => {
    try {
      // This should return an image object or data that jsPDF-autoTable can handle
      // You might need to implement proper image loading logic here
      console.log(imagen + imagePath)
      return { image: imagen + imagePath, width: 15, height: 15 }
    } catch (error) {
      console.error('Error loading image:', error)
      return ''
    }
  }

  const datos = processedRows.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    stock: item.stock,
    costo: decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
    imagen: item.imagen ? addImageToCell(item.imagen) : '', // Handle cases where image might be missing
  }))

  const totalstock = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock)),
    0,
  )

  const costoTotal = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock) * parseFloat(dato.costounitario)),
    0,
  )

  // Add summary row (better approach)
  datos.push({
    indice: '',
    codigo: '',
    producto: '',
    categoria: '',
    subcategoria: '',
    descripcion: '',
    unidad: 'Total:',
    stock: totalstock,
    costo: decimas(costoTotal),
    imagen: '',
  })

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      codigo: { cellWidth: 30, halign: 'left' },
      producto: { cellWidth: 40, halign: 'left' },
      categoria: { cellWidth: 40, halign: 'left' },
      subcategoria: { cellWidth: 30, halign: 'left' },
      descripcion: { cellWidth: 50, halign: 'left' },
      unidad: { cellWidth: 20, halign: 'center' },
      stock: { cellWidth: 15, halign: 'right' },
      costo: { cellWidth: 15, halign: 'right' },
      imagen: { cellWidth: 40, halign: 'center' },
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: (data) => {
      // Only add header on first page
      if (data.pageNumber === 1) {
        // Logo
        if (logoEmpresa) {
          try {
            //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20)
          } catch (error) {
            console.error('Error loading logo:', error)
          }
        }

        // Company info
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Title
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE PRODUCTOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }

      // Footer with page number
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' },
      )
    },
  })

  return doc
}
