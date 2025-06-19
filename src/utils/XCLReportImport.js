import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { validarUsuario } from 'src/composables/FuncionesG'
import * as XLSX from 'xlsx-js-style'

export function exportToXLSX_Reporte_CuentasXCobrarPeriodo(reportData, startDate, endDate) {
  // Prepare data: only include fields that should be in the Excel file
  // and apply any necessary formatting or transformations.
  const datos = reportData.value
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
  const dataForExport = datos.map((row) => {
    return {
      Fecha: row.fecha_actual,

      Cliente: row.nombre_cliente,
      'Nombre Comercial': row.nombre_comercial,

      'Monto Venta': parseFloat(row.monto_total_venta).toFixed(2), // Ensure numeric formatting
      'Descuento Venta': parseFloat(row.descuento_venta).toFixed(2),
      'Saldo Cobro': parseFloat(row.saldo_estado_cobro).toFixed(2),
      'Monto Cobrado': parseFloat(row.monto_detalle_cobro).toFixed(2),
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Define column widths based on data or sensible defaults
  // Map your data keys to desired widths
  const columnWidths = [
    { wch: 15 }, // Fecha

    { wch: 30 }, // Cliente
    { wch: 30 }, // Nombre Comercial

    { wch: 15 }, // Monto Venta
    { wch: 12 }, // Descuento Venta
    { wch: 15 }, // Saldo Cobro
    { wch: 15 }, // Monto Cobrado
  ]

  worksheet['!cols'] = columnWidths

  // Apply styles to all cells
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      const cell = worksheet[cell_ref]

      if (!cell) continue // Skip empty cells

      // Default styles for data rows
      let cellStyle = {
        font: {
          name: 'Arial',
          sz: 10,
          color: { rgb: '000000' },
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } }, // Light grey borders
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
        },
      }

      // Header row (R === 0) specific styles
      if (R === 0) {
        cellStyle.font = {
          name: 'Arial',
          sz: 11,
          bold: true,
          color: { rgb: 'FFFFFF' }, // White text
        }
        cellStyle.fill = {
          fgColor: { rgb: '4F81BD' }, // Dark blue background for header
        }
        cellStyle.alignment.horizontal = 'center' // Center header text
      } else {
        // Numeric column alignment for data rows
        const numericColumns = ['Monto Venta', 'Descuento Venta', 'Saldo Cobro', 'Monto Cobrado']
        const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })] // Get header cell to check column name
        if (headerCell && numericColumns.includes(headerCell.v)) {
          cellStyle.alignment.horizontal = 'right'
          // Optional: Set number format for currency/decimals
          cell.z = '0.00' // Two decimal places
        }
      }

      cell.s = cellStyle // Apply the determined style
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cobros Diarios')
  const filename = `Reporte_Cobros_Diarios_${startDate.value}_a_${endDate.value}.xlsx`
  XLSX.writeFile(workbook, filename)
}
export function exportToXLSX_Reporte_Creditos(
  reportData,
  startDate,
  endDate,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
) {
  // Preparar datos excluyendo la fila de totales si ya existe
  const datos = reportData.filter((item) => item.estado !== 5)

  // Calcular totales
  const totalValorCuotas = datos.reduce((sum, u) => sum + parseFloat(u.valorcuotas || 0), 0)
  const totalMontoVenta = datos.reduce((sum, u) => sum + parseFloat(u.montoventa || 0), 0)
  const totalCobrado = datos.reduce((sum, u) => sum + parseFloat(u.totalcobrado || 0), 0)
  const totalSaldo = datos.reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0)
  const totalAtrasado = datos
    .filter((u) => Number(u.estado) === 3)
    .reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0)
  const totalAnulado = datos
    .filter((u) => Number(u.estado) === 4)
    .reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0)

  // Mapear datos para exportación
  const dataForExport = datos.map((row) => ({
    'N°': row.numero,
    'Fecha Crédito': cambiarFormatoFecha(row.fechaventa),
    Cliente: row.razonsocial,
    Sucursal: row.sucursal,
    'Fecha Límite': cambiarFormatoFecha(row.fechalimite),
    Cuotas: row.ncuotas,
    'Cuotas Pagadas': row.cuotaspagadas || '0',
    'Valor Cuota': parseFloat(row.valorcuotas || 0).toFixed(2),
    'Monto Venta': parseFloat(row.montoventa || 0).toFixed(2),
    'Total Cobrado': parseFloat(row.totalcobrado || 0).toFixed(2),
    Saldo: parseFloat(row.saldo || 0).toFixed(2),
    'Días Mora':
      row.fechalimite && Number(row.estado) === 3 ? Math.max(obtenerDias(row.fechalimite), 0) : 0,
    totalAtrasado: totalAtrasado,
    totalAnulado: totalAnulado,
    Estado: getEstadoText(row.estado),
  }))

  // Agregar fila de totales
  dataForExport.push({
    'N°': '',
    'Fecha Crédito': '',
    Cliente: '',
    Sucursal: '',
    'Fecha Límite': '',
    Cuotas: '',
    'Cuotas Pagadas': 'TOTAL:',
    'Valor Cuota': totalValorCuotas.toFixed(2),
    'Monto Venta': totalMontoVenta.toFixed(2),
    'Total Cobrado': totalCobrado.toFixed(2),
    Saldo: totalSaldo.toFixed(2),
    totalAtrasado: totalAtrasado,
    totalAnulado: totalAnulado,
    'Días Mora': '',
    Estado: '',
  })

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas
  const columnWidths = [
    { wch: 5 }, // N°
    { wch: 12 }, // Fecha Crédito
    { wch: 30 }, // Cliente
    { wch: 20 }, // Sucursal
    { wch: 12 }, // Fecha Límite
    { wch: 8 }, // Cuotas
    { wch: 12 }, // Cuotas Pagadas
    { wch: 12 }, // Valor Cuota
    { wch: 12 }, // Monto Venta
    { wch: 12 }, // Total Cobrado
    { wch: 12 }, // Saldo
    { wch: 10 }, // Días Mora
    { wch: 12 }, // Estado
  ]
  worksheet['!cols'] = columnWidths

  // Aplicar estilos a las celdas
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      const cell = worksheet[cell_ref]

      if (!cell) continue

      // Estilo por defecto
      let cellStyle = {
        font: { name: 'Arial', sz: 10, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
        },
      }

      // Estilo para encabezados
      if (R === 0) {
        cellStyle.font = { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }
        cellStyle.fill = { fgColor: { rgb: '4F81BD' } } // Azul oscuro
        cellStyle.alignment.horizontal = 'center'
      }
      // Estilo para fila de totales
      else if (R === range.e.r) {
        cellStyle.font = { name: 'Arial', sz: 10, bold: true }
        cellStyle.fill = { fgColor: { rgb: 'F2F2F2' } } // Gris claro
      }
      // Estilo para columnas numéricas
      else {
        const numericColumns = ['Valor Cuota', 'Monto Venta', 'Total Cobrado', 'Saldo', 'Días Mora']
        const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })]
        if (headerCell && numericColumns.includes(headerCell.v)) {
          cellStyle.alignment.horizontal = 'right'
          cell.z = '0.00' // Formato de 2 decimales
        }
      }

      cell.s = cellStyle
    }
  }

  // Crear libro y agregar hoja
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Créditos')

  // Agregar información adicional como encabezado
  const contenidoUsuario = validarUsuario()
  const empresa = contenidoUsuario[0]?.empresa?.nombre || ''
  const usuario = contenidoUsuario[0]?.nombre || ''
  const cargo = contenidoUsuario[0]?.cargo || ''

  // Crear texto de filtros aplicados
  let filtros = `Del ${cambiarFormatoFecha(startDate)} al ${cambiarFormatoFecha(endDate)}`
  if (clienteSeleccionado) filtros += ` | Cliente: ${clienteSeleccionado.nombre}`
  if (sucursalSeleccionada) filtros += ` | Sucursal: ${sucursalSeleccionada.nombre}`

  // Agregar metadatos
  workbook.Props = {
    Title: `Reporte de Créditos - ${empresa}`,
    Subject: 'Reporte de créditos por periodo',
    Author: `${usuario} - ${cargo}`,
    CreatedDate: new Date(),
    Comments: filtros,
  }

  // Generar nombre de archivo
  let filename = `Reporte_Creditos_${startDate}_a_${endDate}`
  if (clienteSeleccionado) filename += `_${clienteSeleccionado.nombre.substring(0, 20)}`
  filename += '.xlsx'

  // Exportar archivo
  XLSX.writeFile(workbook, filename)
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
