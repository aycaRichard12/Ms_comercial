<template>
  <q-table
    flat
    bordered
    title="Ventas de Hoy "
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="pagination"
    no-data-label="No hay ninguna venta"
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
    <template v-slot:bottom-row>
      <q-tr>
        <q-td colspan="2" class="text-right text-bold">Total:</q-td>
        <q-td class="text-right text-bold">{{ decimas(cantidadTotal) }}</q-td>
      </q-tr>
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
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { PDFdetalleVentaInicio } from 'src/utils/pdfReportGenerator'
import { redondear } from 'src/composables/FuncionesG'
import { decimas } from 'src/composables/FuncionesG'
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idusuario = contenidousuario[0]?.idusuario
const idempresa = contenidousuario[0]?.empresa?.idempresa
const pdfData = ref(null)
const mostrarModal = ref(false)

const columns = [
  { name: 'nfactura', label: 'N° Fact', field: 'nfactura', align: 'center' },
  {
    name: 'cliente',
    label: 'Razon social',
    align: 'left',
    field: (row) => row.cliente.split('-')[0],
  },
  { name: 'ventatotal', label: 'Monto', field: (row) => decimas(row.ventatotal), align: 'right' },
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
    console.log(rows.value)
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
const cantidadTotal = computed(() => {
  return rows.value.reduce((sum, dato) => sum + redondear(parseFloat(dato.ventatotal)), 0)
})
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

async function imprimirReporte() {
  console.log(detalleVenta.value)

  const doc = await PDFdetalleVentaInicio(detalleVenta)
  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
onMounted(() => {
  loadRows()
})
</script>
