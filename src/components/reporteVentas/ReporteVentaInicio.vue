<template>
  <q-table
    flat
    bordered
    title="Reporte de Ventas"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="pagination"
    class="q-mt-md"
  >
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          color="primary"
          icon="picture_as_pdf"
          size="sm"
          dense
          @click="verComprobante(props.row)"
          title="VER COMPROBANTE"
        />
      </q-td>
    </template>
  </q-table>
  <q-dialog v-model="mostrarModal" persistent full-width full-height>
    <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Vista previa de PDF</div>
        <q-space />
        <q-btn flat round icon="close" @click="mostrarModal = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
        <iframe
          v-if="pdfData"
          :src="pdfData"
          style="width: 100%; height: 100%; border: none"
        ></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { numeroALetras } from 'src/composables/FuncionesG'
import { useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { URL_APIE } from 'src/composables/services'
import { decimas, redondear } from 'src/composables/FuncionesG'
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idusuario = contenidousuario[0]?.idusuario
const idempresa = contenidousuario[0]?.empresa?.idempresa
const pdfData = ref(null)
const mostrarModal = ref(false)

const columns = [
  { name: 'nfactura', label: 'N° Fact', field: 'nfactura', align: 'center' },
  { name: 'cliente', label: 'Cliente.', field: 'cliente', align: 'left' },
  { name: 'ventatotal', label: 'Monto', field: 'ventatotal', align: 'right' },
  { name: 'acciones', label: '', field: 'acciones', sortable: false },
]

const rows = ref([])
const detalleVenta = ref([])
async function loadRows() {
  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const dd = String(hoy.getDate()).padStart(2, '0')

  const fechaInicio = `${yyyy}-${mm}-${dd}`
  const fechaFin = `${yyyy}-${mm}-${dd}`
  try {
    const response = await api.get(`reporteventas/${idusuario}/${fechaInicio}/${fechaFin}`) // Cambia a tu ruta real
    rows.value = response.data.sort((a, b) => b.idventa - a.idventa)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
// const processedRows = computed(() => {
//   return rows.value.map((row, index) => ({
//     ...row,
//     numero: index + 1,
//   }))
// })
const pagination = {
  rowsPerPage: 10,
}
const getDetalleVenta = async (id) => {
  try {
    const response = await api.get(`detallesVenta/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detalleVenta.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const verComprobante = async (id) => {
  await getDetalleVenta(id.idventa)
  if (detalleVenta.value) {
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }
}

function imprimirReporte() {
  console.log(detalleVenta.value)
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
          doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
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

        // const finalY = doc.lastAutoTable.finalY + 5 // un poco de espacio debajo

        // doc.setFontSize(6)
        // doc.setFont(undefined, 'normal')

        // // // Monto en palabras
        // doc.text('Son: ' + montoTexto, 5, finalY)
        // const rightX = 200
        // doc.text('SUBTOTAL:', rightX - 40, finalY, { align: 'right' })
        // doc.text(subtotal, rightX, finalY, { align: 'right' })

        // doc.text('DESCUENTO:', rightX - 40, finalY + 5, { align: 'right' })
        // doc.text(descuento, rightX, finalY + 5, { align: 'right' })

        // doc.text('MONTO TOTAL:', rightX - 40, finalY + 10, { align: 'right' })
        // doc.text(montototal, rightX, finalY + 10, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
onMounted(() => {
  loadRows()
})
</script>
