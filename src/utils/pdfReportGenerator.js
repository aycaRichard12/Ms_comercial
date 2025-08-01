import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { decimas, redondear } from 'src/composables/FuncionesG'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { numeroALetras } from 'src/composables/FuncionesG'
import { imagen } from 'src/boot/url'
import { api } from 'src/boot/axios'
//import { URL_APIE } from 'src/composables/services'
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

    saldo:
      decimas(redondear(parseFloat(item.montoventa) - parseFloat(item.totalcobrado || 0))) ||
      '0.00',
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

export function generarPdfCotizacion(data) {
  console.log(data)
  const comprobanteData = []
  const cotizacionDetalle = data[0]
  console.log(cotizacionDetalle)

  const empresaInfo = cotizacionDetalle.empresa
  const usuarioInfo = cotizacionDetalle.usuario
  const clienteInfo = cotizacionDetalle.cliente
  const cotizacionInfo = cotizacionDetalle.cotizacion
  const divisaCotizacion = cotizacionDetalle.divisa
  console.log(divisaCotizacion.divisa)

  comprobanteData.empresa = {
    nombre: empresaInfo.nombre,
    direccion: empresaInfo.direccion,
    celular: empresaInfo.celular,
    email: empresaInfo.email,
    logoUrl: `.././em/${empresaInfo.logo}`, // Ajusta la URL de la imagen según tu configuración
  }
  comprobanteData.Nro = cotizacionInfo.Nro || '' // Si existe un número de cotización
  comprobanteData.clienteDisplay = `${clienteInfo.cliente} - ${clienteInfo.nombrecomercial} - ${clienteInfo.sucursal}`
  comprobanteData.nit = clienteInfo.nit
  comprobanteData.direccion = clienteInfo.direccion
  comprobanteData.email = clienteInfo.email
  comprobanteData.fecha = cotizacionInfo.fecha
  comprobanteData.usuario = usuarioInfo.usuario
  comprobanteData.cargo = usuarioInfo.cargo // Asumo que hay un campo rol en usuario

  let currentSubtotal = 0
  const detalleProductos = cotizacionDetalle.detalle.map((item) => {
    const totalProducto = redondear(item.cantidad * item.precio)
    currentSubtotal += totalProducto
    return {
      ...item,
      total: totalProducto,
    }
  })

  comprobanteData.detalle = detalleProductos
  comprobanteData.descuento = cotizacionInfo.descuento
  comprobanteData.subtotal = redondear(currentSubtotal)
  comprobanteData.montoTotal = redondear(currentSubtotal - cotizacionInfo.descuento)
  console.log(comprobanteData)
  const detallePlano = comprobanteData
  console.log(detallePlano)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  detallePlano.detalle.map((item) => {
    console.log(item)
  })
  const datos = detallePlano.detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano.detalle.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano.descuento)))

  const descuento = decimas(detallePlano.descuento || 0)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal) },
  )
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
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
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
        doc.text('COMPROBANTE', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        console.log(divisaCotizacion)
        const nfactura = cotizacionInfo.nfactura || ''
        const divisa = divisaCotizacion.divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.clienteDisplay, 5, 38)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano.fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.cargo, 200, 41, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

export function PDFfacturaCorreo(detalleVenta) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre

  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono
  const logoEmpresa = usuario.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano[0].detalle[0].reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano[0].descuento)))

  const descuento = decimas(detallePlano[0].descuento || 0)
  const montoTexto = numeroALetras(montototal, detallePlano[0].divisa)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal), descripcion: montoTexto },
  )
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
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
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
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })
  return doc
}

export function PDFComprovanteVenta(detalleVenta) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano[0].detalle[0].reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano[0].descuento)))

  const descuento = decimas(detallePlano[0].descuento || 0)
  const montoTexto = numeroALetras(montototal, detallePlano[0].divisa)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal), descripcion: montoTexto },
  )
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
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
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
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })
  return doc
}

export function PDFreporteVentasPeriodo(filteredCompra, almacen) {
  console.log(filteredCompra, almacen, almacen.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Tipo-Venta', dataKey: 'tipoventa' },
    { header: 'Tipo-Pago', dataKey: 'tipopago' },
    { header: 'Nro.Factura', dataKey: 'nfactura' },
    { header: 'Canal', dataKey: 'canal' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Dscto', dataKey: 'descuento' },
    { header: 'Monto', dataKey: 'ventatotal' },
  ]
  // filteredCompra.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = filteredCompra.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    cliente: item.cliente,
    sucursal: item.sucursal,
    tipoventa: tipo[item.tipoventa],
    tipopago: item.tipopago,
    nfactura: item.nfactura,
    canal: item.canal,
    total: item.total,
    descuento: decimas(item.descuento),
    ventatotal: decimas(item.ventatotal),
  }))

  const descuento = filteredCompra.value.reduce(
    (sum, row) => sum + redondear(parseFloat(row.descuento)),
    0,
  )

  const total = filteredCompra.value.reduce(
    (sum, row) =>
      sum + redondear(parseFloat(row.ventatotal)) + redondear(parseFloat(row.descuento)),
    0,
  )

  datos.push({
    canal: 'Total Sumatorias',
    total: decimas(total),
    descuento: decimas(descuento),
    ventatotal: decimas(total + descuento),
  })

  console.log(almacen.value)
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
      fecha: { cellWidth: 15, halign: 'left' },
      cliente: { cellWidth: 25, halign: 'left' },
      sucursal: { cellWidth: 25, halign: 'left' },
      tipoventa: { cellWidth: 25, halign: 'center' },
      tipopago: { cellWidth: 15, halign: 'center' },
      nfactura: { cellWidth: 15, halign: 'center' },
      canal: { cellWidth: 20, halign: 'left' },
      total: { cellWidth: 15, halign: 'right' },
      descuento: { cellWidth: 15, halign: 'right' },
      ventatotal: { cellWidth: 15, halign: 'right' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
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
        doc.text('REPORTE VENTAS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Nombre del Almacen: ' + (almacen.value?.label || 'Todo los Almacenes'), 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(cargo, 200, 41, { align: 'right' })
      }
    },
  })
  return doc
}

export async function PDFenviarFacturaCorreo(idcliente, detalleVenta, $q) {
  const contenidousuario = validarUsuario()
  //const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))
  const doc = PDFfacturaCorreo(detalleVenta)
  try {
    const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    const pdfBlob = doc.output('blob')

    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `factura-${detallePlano[0].nfactura}.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', detallePlano[0].nfactura)
    formData.append('clientName', detallePlano[0].cliente)
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Factura enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar la factura por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}

export async function PDFenviarComprobanteCorreo(idcliente, data, $q) {
  const contenidousuario = validarUsuario()
  //const doc = new jsPDF({ orientation: 'portrait' })
  console.log(idcliente)
  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono

  const doc = generarPdfCotizacion(data)
  try {
    const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    const pdfBlob = doc.output('blob')

    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `Comprobante.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', '-')
    formData.append('clientName', data[0]?.cliente)
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Comprobante enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar Comproante por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}

export async function PDFdetalleVentaInicio(detalleVenta) {
  console.log(detalleVenta)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = detalleVenta.value

  // detallePlano[0].detalle[0].map((item) => {
  //   console.log(item)
  // })

  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano[0].detalle[0].reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano[0].descuento)))

  const descuento = decimas(detallePlano[0].descuento || 0)
  const montoTexto = numeroALetras(montototal, detallePlano[0].divisa)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal), descripcion: montoTexto },
  )

  console.log(datos)
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
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
      // También puedes aplicar estilo a una fila específica, por ejemplo la de índice 2:
      // if (data.row.index === 2) {
      //   data.cell.styles.fontStyle = 'italic'
      //   data.cell.styles.fillColor = [255, 240, 200]
      // }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
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
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })

  return doc
}

export async function PDFenviarFacturaCorreoAlInicio(idcliente, detalleVenta, $q) {
  const contenidousuario = validarUsuario()
  //const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono

  const detallePlano = detalleVenta

  const doc = await PDFdetalleVentaInicio(detalleVenta)
  try {
    const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    const pdfBlob = doc.output('blob')

    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `factura-${detallePlano[0].nfactura}.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', detallePlano[0].nfactura)
    formData.append('clientName', detallePlano[0].cliente)
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Factura enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar la factura por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}

export function DPFReporteCotizacion(cotizaciones) {
  console.log(cotizaciones.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Comercial', dataKey: 'sucursal' },
    { header: 'Monto', dataKey: 'cotizaciontotal' },
    { header: 'Desc.', dataKey: 'descuento' },
    { header: 'Total.', dataKey: 'total' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = cotizaciones.value.map((key) => ({
    nro: key.nro,
    fecha: cambiarFormatoFecha(key.fecha),
    cliente: key.cliente,
    sucursal: key.sucursal,
    descuento: decimas(key.descuento),
    cotizaciontotal: decimas(key.cotizaciontotal),
    total: decimas(redondear(parseFloat(key.cotizaciontotal) + parseFloat(key.descuento))),
  }))
  // Data for jsPDF-autoTable - map from `reportData.
  // value`

  const cotizaciontotal = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.cotizaciontotal))
  }, 0)
  console.log(cotizaciontotal)
  const descuento = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.descuento))
  }, 0)
  const total = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.total))
  }, 0)

  const pieTable = {
    sucursal: 'Total:',
    cotizaciontotal: parseFloat(cotizaciontotal).toFixed(2),
    descuento: parseFloat(descuento).toFixed(2),
    total: parseFloat(total).toFixed(2),
  }
  datos.push(pieTable)
  console.log(datos)

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
      nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha: { cellWidth: 25, halign: 'center' },
      cliente: { cellWidth: 50, halign: 'left' },
      sucursal: { cellWidth: 50, halign: 'left' },
      descuento: { cellWidth: 20, halign: 'right' },
      cotizaciontotal: { cellWidth: 20, halign: 'right' },
      total: { cellWidth: 20, halign: 'right' },

      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 30,
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
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
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
        doc.text('REPORTE COTIZACIONES', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
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

export function PDFConprovanteCotizacion(cotizacion) {
  console.log(cotizacion[0].detalle)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono
  const logoEmpresa = usuario.empresa.logo

  const columns = [
    { header: 'N°', dataKey: 'nro' },
    { header: 'Codigo', dataKey: 'codigoProducto' },
    { header: 'Producto', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'SubTotal', dataKey: 'subtotal' },
  ]

  const datos = cotizacion[0].detalle.map((key, indice) => ({
    nro: indice + 1,
    codigoProducto: key.codigoProducto,
    descripcion: key.descripcion,
    cantidad: key.cantidad,
    precio: decimas(parseFloat(key.precio)),
    subtotal: decimas(parseFloat(key.cantidad) * parseFloat(key.precio)),
  }))
  const total = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.subtotal))
  }, 0)

  const pieTable = {
    precio: 'Total:',
    subtotal: decimas(parseFloat(total)),
  }
  datos.push(pieTable)

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6,
      cellPadding: 1,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
      fontSize: 7,
    },

    columnStyles: {
      nro: { cellWidth: 15, halign: 'center' },
      codigoProducto: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 30, halign: 'right' },
      precio: { cellWidth: 25, halign: 'right' },
      subtotal: { cellWidth: 30, halign: 'right' },
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal')
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
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
        doc.text('COMPROBANTE', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
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
  return doc
}

export function PDFextrabiosRobos(extravios) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Estado', dataKey: 'autorizacion' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = extravios.value.map((key, index) => ({
    nro: index + 1,
    fecha: cambiarFormatoFecha(key.fecha),
    almacen: key.almacen,
    descripcion: key.descripcion,
    autorizacion: Number(key.autorizacion) === 1 ? 'Autorizado' : 'No Autorizado',
  }))
  // Data for jsPDF-autoTable - map from `reportData.
  // value

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
      nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha: { cellWidth: 30, halign: 'center' },
      almacen: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 80, halign: 'left' },
      autorizacion: { cellWidth: 20, halign: 'left' },

      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 30,
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
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
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
        doc.text('REPORTE DE MERMAS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
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

export function PDFComprovanteExtravio(detalleExtravio) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]
  console.log(detalleExtravio)

  const datos = detalleExtravio.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
  console.log(datos)

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
      codigo: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 70, halign: 'left' },
      cantidad: { cellWidth: 65, halign: 'right' },
    },

    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
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
        doc.text('COMPROBANTE DE EXTRAVIO', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }
    },
  })
  return doc
}

export function PDFreporteMermas(mermas) {
  console.log(mermas)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Estado', dataKey: 'autorizacion' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = mermas.value.map((key, index) => ({
    nro: index + 1,
    fecha: cambiarFormatoFecha(key.fecha),
    almacen: key.almacen,
    descripcion: key.descripcion,
    autorizacion: Number(key.autorizacion) === 1 ? 'Autorizado' : 'No Autorizado',
  }))
  // Data for jsPDF-autoTable - map from `reportData.
  // value

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
      nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha: { cellWidth: 30, halign: 'center' },
      almacen: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 80, halign: 'left' },
      autorizacion: { cellWidth: 20, halign: 'left' },

      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 30,
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
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
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
        doc.text('REPORTE DE MERMAS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
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

export function PDFComprovanteMerma(detallemerma) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]
  console.log(detallemerma)

  const datos = detallemerma.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
  console.log(datos)

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
      codigo: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 70, halign: 'left' },
      cantidad: { cellWidth: 65, halign: 'right' },
    },

    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
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
        doc.text('COMPROBANTE DE MERMA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }
    },
  })
  return doc
}
