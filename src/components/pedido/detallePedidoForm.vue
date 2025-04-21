<template>
  <div class="q-pa-md">
    <!-- Selector de Producto -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-select
          v-model="form.productos"
          :options="productosFiltrados"
          use-input
          input-debounce="300"
          @filter="filtrarProductos"
          label="Buscar producto (código o descripción)"
          outlined
          option-label="label"
          option-value="value"
          :loading="cargandoProductos"
          clearable
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No se encontraron productos. Por favor, revise el filtro.
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Detalles adicionales del producto -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-6">
        <q-input v-model="form.stock" outlined label="Stock Actual*" readonly disabled />
      </div>
      <div class="col-md-6">
        <q-input v-model="form.cantidad" outlined label="Cantidad*" required />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

const productos = ref([])
const productoSeleccionado = ref(null)

const productosFiltrados = ref([])
const cargandoProductos = ref(false)
// Estado del formulario
const form = ref({
  productos: '',
  stock: '',
  cantidad: '',
})
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()

// Datos del usuario y empresa (simulados)
const usuario = ref({
  idusuario: idusuario,
  empresa: {
    idempresa: idempresa,
    nombre: 'Mi Empresa SA',
  },
})

async function cargarProductosDisponibles() {
  try {
    cargandoProductos.value = true
    productos.value = []
    productoSeleccionado.value = null

    // Simular datos del carritoPrueba en localStorage

    const endpoint = `/listaProductosDisponiblesVenta/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar productos')

    // Filtrar productos como en la lógica original
    let productosDisponibles = data.datos

    console.log(productosDisponibles)
    // Mapear para el selector
    productos.value = productosDisponibles.map((producto) => ({
      label: `${producto.codigo} - ${producto.descripcion}`,
      value: producto.id,
      originalData: {
        ...producto,
        datosAdicionales: `${producto.codigosin}-${producto.actividadsin}-${producto.unidadsin}-${producto.codigonandina}`,
      },
    }))

    productosFiltrados.value = [...productos.value]
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los productos disponibles',
    })
  } finally {
    cargandoProductos.value = false
  }
}

// Filtrar productos dinámicamente mientras se escribe
// function filtrarProductos(val, update) {
//   cargandoProductos.value = true
//   update(() => {
//     if (val === '') {
//       productosFiltrados.value = [...dropdownProducts]
//     } else {
//       const searchTerm = val.toLowerCase()
//       productosFiltrados.value = dropdownProducts.filter((product) =>
//         product.label.toLowerCase().includes(searchTerm),
//       )
//     }
//     cargandoProductos.value = false
//   })
// }
function filtrarProductos(val, update) {
  update(() => {
    if (val === '') {
      console.log(productosFiltrados.value, productos.value)
      productosFiltrados.value = productos.value
    } else {
      const searchTerm = val.toLowerCase()
      productosFiltrados.value = productos.value.filter((v) =>
        v.label.toLowerCase().includes(searchTerm),
      )
    }
  })
}

onMounted(async () => {
  try {
    // Primero cargar la divisa y esperar a que termine

    // Luego cargar el resto de los datos
    await cargarProductosDisponibles()
  } catch (error) {
    console.error('Error en inicialización:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al inicializar componente',
    })
  }
})
</script>

<style scoped>
.q-mb-md {
  margin-bottom: 16px;
}
</style>
