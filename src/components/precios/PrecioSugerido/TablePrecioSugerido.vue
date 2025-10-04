<template>
  <!-- Botón Cancelar Registro -->
  <div class="row q-col-gutter-x-md q-mb-md">
    <div class="col-12 col-md-4">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="filtroAlmacen"
        :options="almacenes"
        id="almacen"
        dense
        outlined
        @update:model-value="cargarCategoriaPrecio"
      />
    </div>
    <div class="col-12 col-md-4">
      <label for="categoria">Categoria</label>
      <q-select v-model="filtroscategoria" :options="categorias" dense outlined />
    </div>
    <div class="col-12 col-md-4 flex justify-end">
      <q-btn color="info" outline @click="onPrintReport" class="btn-res q-mt-lg">
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista Previa PDF</span>
      </q-btn>
    </div>
    <!-- Filtros -->
  </div>
  <div class="row justify-end">
    <div class="q-mb-md">
      <label for="buscar">Buscar...</label>
      <q-input v-model="filter" dense outlined debounce="300" style="background-color: white">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <!-- Tabla -->
  <q-table
    :rows="filtrados"
    :columns="columnas"
    row-key="id"
    flat
    bordered
    :filter="filter"
    :loading="loading"
  >
    <template v-slot:top-right> </template>
    <template #body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          flat
          dense
          icon="edit"
          color="primary"
          @click="editarProducto(props.row)"
          title="Editar producto"
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
import { ref, computed, watch } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { URL_APIE } from 'src/composables/services'
import { decimas, obtenerFechaActualDato, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
const currencyStore = useCurrencyStore()
console.log(currencyStore)
const pdfData = ref(null)
const mostrarModal = ref(false)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    default: () => [],
  },
})
const filtroAlmacen = ref(null)
const filtroscategoria = ref(null)
const filter = ref('')
const emit = defineEmits(['add', 'edit'])
const categorias = ref([])
// Datos simulados
// const datos = ref([
//   { id: 4002, codigo: 'P-01', descripcion: 'Base de maquillaje completo 50 tonos', precio: 0 },
//   { id: 4001, codigo: 'qq', descripcion: 'qq', precio: 0 },
// ])

const columnas = [
  { name: 'numero', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'right',
    format: (val) => (isNaN(val) ? '0.00' : Number(val).toFixed(2) + currencyStore.simbolo),
  },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const filtrados = computed(() => {
  const res = props.rows.filter((p) => {
    const matchesCateforia =
      (!filtroscategoria.value || p.idporcentaje === filtroscategoria.value?.value) &&
      filtroscategoria.value !== null
    const matchesCodigo =
      !filter.value ||
      p.codigo.toLowerCase().includes(filter.value.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filter.value.toLowerCase()) ||
      p.precio.toLowerCase().includes(filter.value.toLowerCase())
    return matchesCodigo && matchesCateforia
  })

  // return datos.value.filter((row) => {
  //   const coincideBusqueda =
  //     buscar.value === '' ||
  //     row.descripcion.toLowerCase().includes(buscar.value.toLowerCase()) ||
  //     row.codigo.toLowerCase().includes(buscar.value.toLowerCase())

  //   const coincideAlmacen = !filtros.value.almacen || true // Agrega lógica si almacenes filtran productos
  //   const coincideCategoria = !filtros.value.categoria || true // Agrega lógica si categorías filtran productos

  //   return coincideBusqueda && coincideAlmacen && coincideCategoria
  // })
  return res.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
const cargarCategoriaPrecio = async () => {
  console.log(filtroAlmacen.value)
  const almacen = filtroAlmacen.value
  try {
    const response = await api.get(`listaCategoriaPrecio/${idempresa}`)
    console.log(response.data)
    console.log(idusuario)
    const filtrado = response.data.filter(
      (u) => Number(u.estado) == 1 && Number(u.idalmacen) == Number(almacen.value),
    )
    categorias.value = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    filtroscategoria.value = categorias.value[0]
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function editarProducto(id) {
  emit('edit', id)
}
watch(
  () => props.almacenes,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroAlmacen.value) {
      console.log(nuevosAlmacenes)
      filtroAlmacen.value = nuevosAlmacenes[0]
      cargarCategoriaPrecio()
    }
  },
  { immediate: true },
)
function onPrintReport() {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Precio', dataKey: 'precio' },
  ]

  const datos = filtrados.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    descripcion: item.descripcion,
    precio: decimas(item.precio),
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
        doc.text('PRECIOS SUGERIDOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Nombre del Almacén: ' + filtroAlmacen.value?.label, 5, 38)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha se Impresión: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(idempresa.nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(idempresa.cargo, 200, 41, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
