<template>
  <div class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <div class="col-12 col-md-8 text-center">
        <h4 class="text-h4">Carga de productos</h4>
      </div>
      <div class="col-12 col-md-4 text-end">
        <q-btn
          label="Continuar"
          icon-right="arrow_right_alt"
          color="primary"
          @click="continuarVenta"
          :disable="carrito.length === 0"
        />
      </div>
    </div>

    <!-- Fila de selección de almacén y categorías -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Origen de venta -->
      <div class="col-12 col-md-3">
        <q-select
          v-model="almacenSeleccionado"
          :options="almacenes"
          label="Origen de venta*"
          outlined
          emit-value
          map-options
          :loading="cargandoAlmacenes"
          @update:model-value="cargarCategoriasPrecio"
        />
      </div>

      <!-- Categorías de Precio -->
      <div class="col-12 col-md-3">
        <q-select
          v-model="categoriaPrecioSeleccionada"
          :options="categoriasPrecio"
          label="Categoría de precio"
          outlined
          emit-value
          map-options
          :loading="cargandoCategorias"
          :disable="!almacenSeleccionado"
          @update:model-value="cargarProductosDisponibles"
        />
      </div>

      <!-- Categorías con Campaña (condicional) -->
      <div class="col-12 col-md-3" v-if="mostrarCategoriasCampania">
        <q-select
          v-model="categoriaCampaniaSeleccionada"
          :options="categoriasCampania"
          label="Categorías con Campaña"
          outlined
          emit-value
          map-options
          :disable="!categoriaPrecioSeleccionada"
        />
      </div>

      <!-- Checkbox para mostrar categorías con campaña -->
      <div class="col-12 col-md-3 flex items-center">
        <q-checkbox v-model="mostrarCategoriasCampania" label="Mostrar Categorías con Campaña" />
      </div>
    </div>

    <!-- Selector de Producto -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-select
          v-model="productoSeleccionado"
          :options="productosFiltrados"
          use-input
          input-debounce="300"
          @filter="filtrarProductos"
          label="Buscar producto (código o descripción)"
          outlined
          option-label="label"
          option-value="value"
          @update:model-value="seleccionarProducto"
          :loading="cargandoProductos"
          :disable="!categoriaPrecioSeleccionada"
          clearable
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{
                  categoriaPrecioSeleccionada
                    ? 'No se encontraron productos'
                    : 'Seleccione una categoría primero'
                }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Detalles del Producto -->
    <div v-if="productoSeleccionado" class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-3">
        <q-input
          v-model="productoSeleccionado.originalData.stock"
          label="Stock disponible"
          outlined
          readonly
        />
      </div>

      <div class="col-12 col-sm-3">
        <q-input
          v-model.number="cantidad"
          label="Cantidad"
          outlined
          type="number"
          :rules="[
            (val) => val > 0 || 'Ingrese cantidad válida',
            (val) => val <= productoSeleccionado.originalData.stock || 'Supera el stock',
          ]"
        />
      </div>

      <div class="col-12 col-sm-3">
        <q-input
          v-model.number="precioUnitario"
          label="Precio unitario"
          outlined
          prefix="$"
          :rules="[(val) => val > 0 || 'Ingrese precio válido']"
        />
      </div>

      <div class="col-12 col-sm-3 flex items-center">
        <q-btn
          label="Añadir al carrito"
          color="primary"
          @click="agregarAlCarrito"
          :disable="!puedeAgregarProducto"
          class="full-width"
        />
      </div>
    </div>

    <!-- Tabla del Carrito -->
    <q-card class="q-mt-lg">
      <q-card-section>
        <div class="text-h6">Productos seleccionados</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="carrito"
          :columns="columnasCarrito"
          row-key="id"
          flat
          bordered
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                icon="delete"
                color="negative"
                flat
                round
                @click="eliminarDelCarrito(props.row)"
              />
            </q-td>
          </template>

          <template v-slot:bottom-row>
            <q-tr>
              <q-td colspan="5" class="text-right text-weight-bold">Sub Total:</q-td>
              <q-td class="text-center">${{ subTotal.toFixed(2) }}</q-td>
              <q-td></q-td>
            </q-tr>
            <q-tr>
              <q-td colspan="5" class="text-right text-weight-bold">Descuento:</q-td>
              <q-td class="text-center">
                <q-input
                  v-model.number="descuento"
                  dense
                  outlined
                  style="max-width: 100px"
                  prefix="$"
                  @update:model-value="calcularTotal"
                />
              </q-td>
              <q-td></q-td>
            </q-tr>
            <q-tr>
              <q-td colspan="5" class="text-right text-weight-bold">Total:</q-td>
              <q-td class="text-center">${{ total.toFixed(2) }}</q-td>
              <q-td></q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
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

// Estado del componente
const almacenSeleccionado = ref(null)
const categoriaPrecioSeleccionada = ref(null)
const categoriaCampaniaSeleccionada = ref(null)
const mostrarCategoriasCampania = ref(false)
const productoSeleccionado = ref(null)
const cantidad = ref(1)
const precioUnitario = ref(0)
const descuento = ref(0)
const carrito = ref([])

// Estados de carga
const cargandoAlmacenes = ref(false)
const cargandoCategorias = ref(false)
const cargandoProductos = ref(false)

// Datos ficticios
const almacenes = ref([])
const categoriasPrecio = ref([])
const categoriasCampania = ref([])
const productos = ref([])
const productosFiltrados = ref([])

// Columnas para la tabla del carrito
const columnasCarrito = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  {
    name: 'precio',
    label: 'Precio Unit.',
    field: 'precio',
    align: 'right',
    format: (val) => `$${val.toFixed(2)}`,
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    format: (val) => `$${val.toFixed(2)}`,
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

// Computed properties
const puedeAgregarProducto = computed(() => {
  return (
    productoSeleccionado.value &&
    cantidad.value > 0 &&
    cantidad.value <= productoSeleccionado.value.originalData.stock &&
    precioUnitario.value > 0
  )
})

const subTotal = computed(() => {
  return carrito.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const total = computed(() => {
  return subTotal.value - descuento.value
})

// Métodos
async function cargarAlmacenes() {
  try {
    cargandoAlmacenes.value = true
    const endpoint = `/listaResponsableAlmacen/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar almacenes')

    // Filtrar por usuario y mapear
    almacenes.value = data
      .filter((item) => item.idusuario == usuario.value.idusuario)
      .map((item) => ({
        label: item.almacen,
        value: item.idalmacen,
        codigosin: item.sucursales[0]?.codigosin || '',
      }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes disponibles',
    })
  } finally {
    cargandoAlmacenes.value = false
  }
}

async function cargarCategoriasPrecio() {
  try {
    cargandoCategorias.value = true
    categoriaPrecioSeleccionada.value = null
    categoriasPrecio.value = []

    const endpoint = `/listaCategoriaPrecio/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar categorías')

    categoriasPrecio.value = data
      .filter((item) => item.estado == 1 && item.idalmacen == almacenSeleccionado.value)
      .map((item) => ({
        label: item.nombre,
        value: item.id,
      }))
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las categorías de precio',
    })
  } finally {
    cargandoCategorias.value = false
  }
}

async function cargarProductosDisponibles() {
  try {
    cargandoProductos.value = true
    productos.value = []
    productoSeleccionado.value = null

    // Simular datos del carrito en localStorage
    const datosCarrito = JSON.parse(localStorage.getItem('carrito')) || { listaProductos: [] }
    const idporcentajeventa = categoriaPrecioSeleccionada.value

    const endpoint = `/listaProductosDisponiblesVenta/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar productos')

    // Filtrar productos como en la lógica original
    let productosDisponibles = data.datos.filter((u) => u.idporcentaje == idporcentajeventa)

    if (datosCarrito.listaProductos.length > 0) {
      productosDisponibles = productosDisponibles.filter(
        (u) => !datosCarrito.listaProductos.some((u2) => u.id == u2.idproductoalmacen),
      )
    }

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
  } // productosFiltrados.value = productos.value.filter
}

function filtrarProductos(val, update) {
  update(() => {
    if (val === '') {
      productosFiltrados.value = productos.value
    } else {
      const searchTerm = val.toLowerCase()
      productosFiltrados.value = productos.value.filter((v) =>
        v.label.toLowerCase().includes(searchTerm),
      )
    }
  })
}

function seleccionarProducto(producto) {
  if (!producto) {
    resetearCamposProducto()
    return
  }

  precioUnitario.value = producto.originalData.precio || 0
}

function agregarAlCarrito() {
  const producto = productoSeleccionado.value.originalData
  const nuevoItem = {
    id: producto.id,
    codigo: producto.codigo,
    descripcion: producto.descripcion,
    cantidad: cantidad.value,
    precio: precioUnitario.value,
    subtotal: precioUnitario.value * cantidad.value,
    idstock: producto.idstock,
    idporcentaje: producto.idporcentaje,
    idproductoalmacen: producto.id,
    datosAdicionales: producto.datosAdicionales,
  }

  // Agregar al carrito
  carrito.value.push(nuevoItem)

  // Actualizar localStorage
  localStorage.setItem(
    'carrito',
    JSON.stringify({
      listaProductos: carrito.value.map((item) => ({
        idproductoalmacen: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    }),
  )

  // Notificación y reset
  $q.notify({
    type: 'positive',
    message: 'Producto agregado al carrito',
  })

  resetearCamposProducto()
  productoSeleccionado.value = null
}

function eliminarDelCarrito(item) {
  carrito.value = carrito.value.filter((i) => i.id !== item.id)

  // Actualizar localStorage
  localStorage.setItem(
    'carrito',
    JSON.stringify({
      listaProductos: carrito.value.map((item) => ({
        idproductoalmacen: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    }),
  )

  $q.notify({
    type: 'info',
    message: 'Producto eliminado del carrito',
  })
}

function resetearCamposProducto() {
  cantidad.value = 1
  precioUnitario.value = 0
}

function continuarVenta() {
  $q.notify({
    type: 'positive',
    message: 'Procediendo al registro de la venta...',
  })

  // Aquí iría la lógica para continuar con el proceso de venta
  console.log('Datos para la venta:', {
    almacen: almacenSeleccionado.value,
    categoriaPrecio: categoriaPrecioSeleccionada.value,
    productos: carrito.value,
    descuento: descuento.value,
    total: total.value,
  })
}

// Inicialización
onMounted(() => {
  cargarAlmacenes()
})
</script>

<style scoped>
.q-card {
  border-radius: 8px;
  margin-top: 20px;
}

.q-table__bottom-row td {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
