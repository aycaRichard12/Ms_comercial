<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md">
      <q-form>
        <div class="row q-col-gutter-md" style="display: flex; justify-content: center">
          <q-input v-model="startDate" type="date" label="Fecha Inicial*" class="col-md-4" />
          <q-input v-model="endDate" type="date" label="Fecha Final*" class="col-md-4" />
        </div>
        <div class="q-mt-md" style="display: flex; justify-content: center">
          <q-btn color="primary" label="Generar reporte" @click="generarReporte" class="q-mr-sm" />
          <q-btn color="secondary" label="Exportar a Excel" @click="exportarExcel" />
        </div>
      </q-form>

      <q-table
        title="Reporte de Productos Comprados"
        :rows="datosFiltrados"
        :columns="columnas"
        row-key="codigo"
        class="q-mt-lg"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'
import * as XLSX from 'xlsx'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
const idusuario = idusuario_md5()
const startDate = ref(null)
const endDate = ref(null)
const datosFiltrados = ref([])

const columnas = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row) => date.formatDate(row.fecha, 'DD/MM/YYYY'),
    align: 'left',
  },
  { name: 'nrofactura', label: 'Nro. Doc.', field: 'nrofactura', align: 'left' },
  {
    name: 'tipocompra',
    label: 'Tipo de Compra',
    field: (row) => (row.tipocompra == 2 ? 'Contado' : 'Crédito'),
    align: 'left',
  },
  { name: 'codigo', label: 'Código Producto', field: 'codigo', align: 'left' },
  { name: 'codigobarra', label: 'Código Barras', field: 'codigobarra', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  {
    name: 'costounitario',
    label: 'Costo Unitario',
    field: 'costounitario',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'precio',
    label: 'Precio Unitario',
    field: 'precio',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'importe',
    label: 'Importe',
    field: 'importe',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costototal',
    label: 'Costo Total',
    field: 'costototal',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'compratotal',
    label: 'Compra Total',
    field: 'compratotal',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'utilidad',
    label: 'Utilidad',
    field: 'utilidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedor', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'subcategoria', label: 'Sub Categoría', field: 'subcategoria', align: 'left' },
]

async function generarReporte() {
  try {
    const point = `reportecomprasporproductos/${idusuario}/${startDate.value}/${endDate.value}`
    const response = await api.get(point)
    console.log(response)
    datosFiltrados.value = response.data
  } catch (error) {
    console.error('Error al obtener reporte:', error)
  }
}

function exportarExcel() {
  const worksheet = XLSX.utils.json_to_sheet(
    datosFiltrados.value.map((item) => ({
      Fecha: date.formatDate(item.fecha, 'DD/MM/YYYY'),
      'Nro. documento': item.nrofactura,
      'Tipo de compra': item.tipocompra == 2 ? 'Contado' : 'Crédito',
      'Código producto': item.codigo,
      'Código barras': item.codigobarra,
      Descripción: item.descripcion,
      'Costo unitario': item.costounitario,
      'Precio unitario': item.precio,
      Cantidad: item.cantidad,
      Importe: item.importe,
      'Costo total': item.costototal,
      'Compra total': item.compratotal,
      Utilidad: item.utilidad,
      'Nombre usuario': item.usuario,
      'Almacén empresa': item.almacen,
      Proveedor: item.proveedor,
      Unidad: item.unidad,
      Categoría: item.categoria,
      'Sub Categoría': item.subcategoria,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
  XLSX.writeFile(
    workbook,
    `Reporte_Productos_Comprados_${new Date().toISOString().split('T')[0]}.xlsx`,
  )
}
onMounted(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')

  // Set default to first day of current month and today
  startDate.value = `${year}-${month}-01`
  endDate.value = `${year}-${month}-${day}`
})
</script>

<style scoped>
.q-table thead tr {
  background-color: #f1f1f1;
  font-weight: bold;
}
</style>
