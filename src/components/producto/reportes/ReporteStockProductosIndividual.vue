<template>
  <q-card-section>
    <q-form @submit.prevent>
      <div class="q-gutter-md">
        <div class="row q-col-gutter-md justify-center">
          <q-select
            v-model="form.almacen"
            label="Almacén*"
            :options="almacenes"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            clearable
            class="col-md-4"
            :input-style="{ paddingLeft: '10px', paddingRight: '10px' }"
            @update:model-value="generarReporte"
          />
        </div>
      </div>

      <div class="row q-gutter-sm justify-center q-mt-lg">
        <q-btn color="primary" label="Generar reporte" @click="generarReporte" />
        <q-btn color="primary" label="Vista previa del Reporte" @click="vistaPrevia" />
        <q-btn color="primary" label="Reporte Con imagen" @click="reporteImage" />
        <q-btn color="primary" label="Catalogo" @click="vistaCatalogo" />
      </div>
    </q-form>

    <q-form class="q-my-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtroEstado"
            label="Filtrar por estado del producto"
            :options="estados"
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtroOrden"
            label="Ordenar por stock de manera"
            :options="ordenes"
            dense
            outlined
          />
        </div>
      </div>
    </q-form>

    <q-table
      title="Productos"
      :rows="processedRows"
      :columns="columnas"
      flat
      row-key="id"
      separator="horizontal"
      :filter="search"
    >
      <template v-slot:top-right>
        <q-input
          v-model="search"
          placeholder="Buscar..."
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: white"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          {{ Number(props.row.estado) === 1 ? 'Activo' : 'No Activo' }}
        </q-td>
      </template>
      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="11" class="text-right text-bold">Sumatorias</q-td>
          <q-td class="text-right text-bold">{{ sumatoriaStock }}</q-td>
          <q-td class="text-right text-bold">{{ sumatoriaCosto }}</q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card-section>

  <q-card-section>
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
  </q-card-section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { decimas, redondear } from 'src/composables/FuncionesG'
import jsPDF from 'jspdf'
import { URL_APIE } from 'src/composables/services'
import { imagen } from 'src/boot/url'
import { PDFreporteStockProductosIndividual } from 'src/utils/pdfReportGenerator'
import { PDFreporteStockProductosIndividual_img } from 'src/utils/pdfReportGenerator'
const pdfData = ref(null)
const mostrarModal = ref(false)
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa
const idusuario = contenidousuario[0]?.idusuario
const form = ref({})
const filtroEstado = ref(null)
const filtroOrden = ref(null)
const almacenes = ref([])
const search = ref('')

const filtros = ref({
  estado: '0',
  orden: '1',
})

const estados = [
  { label: 'Todos', value: '0' },
  { label: 'Activos', value: '1' },
  { label: 'Inactivos', value: '2' },
]

const ordenes = [
  { label: 'Descendente', value: '1' },
  { label: 'Ascendente', value: '2' },
]

const datos = ref([])

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'right' },
  { name: 'fecha', label: 'Fecha registro', field: 'fecha', align: 'right' },
  { name: 'almacen', label: 'Almacén', field: 'almacen' },
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'producto', label: 'Producto', field: 'producto' },
  { name: 'categoria', label: 'Categoría', field: 'categoria' },
  { name: 'subcategoria', label: 'Sub categoría', field: 'subcategoria' },
  { name: 'descripcion', label: 'Descripcion', field: 'descripcion' },
  { name: 'unidad', label: 'Unidad', field: 'unidad' },
  { name: 'pais', label: 'País', field: 'pais' },
  { name: 'stockminimo', label: 'Stock mínimo', field: 'stockminimo', align: 'right' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right' },
  { name: 'costo', label: 'Costo total', field: 'costo', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado' },
]

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)

    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    form.value.almacen = almacenes.value[0]?.value
    generarReporte()
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}
const sumatoriaStock = computed(() =>
  processedRows.value.reduce((acc, item) => acc + Number(item.stock), 0),
)

const sumatoriaCosto = computed(() => {
  const total = processedRows.value.reduce((acc, item) => {
    const costo = parseFloat(item.costo)
    return acc + (isNaN(costo) ? 0 : costo)
  }, 0)
  return total.toFixed(2)
})

// Métodos simulados
const generarReporte = async () => {
  console.log('Generando reporte', form.value?.almacen, filtros.value)
  try {
    const response = await api.get(`reporteproductoalmacen/${form.value?.almacen}/${idempresa}`)
    console.log(response)
    datos.value = response.data
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  }
}
const processedRows = computed(() => {
  let rows = [...datos.value]
  console.log(filtroEstado.value?.value)
  // Filtrar por estado
  if (filtroEstado.value && Number(filtroEstado.value?.value) !== 0) {
    console.log('ok')
    rows = rows.filter((item) => Number(item.estado) === Number(filtroEstado.value?.value))
    console.log(rows)
  }

  // Ordenar por stock
  if (Number(filtroOrden.value?.value) === 1) {
    rows.sort((a, b) => b.stock - a.stock)
  } else if (Number(filtroOrden.value?.value) === 2) {
    rows.sort((a, b) => a.stock - b.stock)
  }

  return rows.map((item, index) => ({
    ...item,
    numero: index + 1,
    costo: decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
  }))
})

onMounted(() => {
  cargarAlmacenes()
})
const vistaPrevia = () => {
  const doc = PDFreporteStockProductosIndividual(processedRows)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
const reporteImage = async () => {
  const doc = PDFreporteStockProductosIndividual_img(processedRows)

  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

function convertirImagenARutaBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/jpeg')
      resolve(dataURL)
    }
    img.onerror = () => reject('Error al cargar imagen')
    img.src = url
  })
}
const prepararImagenes = async () => {
  const productosConImagenes = await Promise.all(
    processedRows.value.map(async (item) => {
      try {
        console.log(`${imagen}${item.imagen}`)
        const base64 = await convertirImagenARutaBase64(`${imagen}${item.imagen}`)
        return { ...item, imagenBase64: base64 }
      } catch (e) {
        console.warn('No se pudo cargar imagen para', item.codigo + e)
        return { ...item, imagenBase64: null }
      }
    }),
  )
  return productosConImagenes
}

const vistaCatalogo = async () => {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })
  const productos = await prepararImagenes() // ahora tienen `imagenBase64`
  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  if (logoEmpresa) {
    console.log(`${URL_APIE}${logoEmpresa}`)
    doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
  }
  doc.setFontSize(7)
  doc.setFont(undefined, 'bold')
  doc.text(nombreEmpresa, 10, 10)

  doc.setFontSize(6)
  doc.setFont(undefined, 'normal')
  doc.text(direccionEmpresa, 10, 13)
  doc.text(`Tel: ${telefonoEmpresa}`, 10, 16)

  // Título centrado
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('CATALOGO PRODUCTOS', doc.internal.pageSize.getWidth() / 2, 15, {
    align: 'center',
  })
  let startY = 50

  productos.forEach((item) => {
    const margenIzq = 10
    const margenDer = 120

    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(`Producto: ${item.producto}`, margenIzq, startY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)

    doc.text(`Código: ${item.codigo}`, margenIzq, startY + 5)
    doc.text(`Categoría: ${item.categoria}`, margenIzq, startY + 10)
    doc.text(`Subcategoría: ${item.subcategoria}`, margenIzq, startY + 15)
    doc.text(`Descripción: ${item.descripcion}`, margenIzq, startY + 20)
    doc.text(`Unidad: ${item.unidad}`, margenIzq, startY + 25)
    doc.text(`Stock: ${item.stock}`, margenIzq, startY + 30)
    doc.text(`Costo Unitario: ${item.costounitario}`, margenIzq, startY + 35)
    doc.text(`Estado: ${item.estado == 1 ? 'Activo' : 'No activo'}`, margenIzq, startY + 40)

    if (item.imagenBase64) {
      doc.addImage(`${imagen}${item.imagen}`, 'JPEG', margenDer, startY, 60, 40)
    } else {
      doc.text('Sin imagen', margenDer, startY + 10)
    }

    startY += 55
    if (startY + 50 > doc.internal.pageSize.getHeight()) {
      doc.addPage()
      startY = 20
    }
  })

  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
</script>
<style></style>
