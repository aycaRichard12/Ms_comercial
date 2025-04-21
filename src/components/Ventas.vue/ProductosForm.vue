<template>
  <q-card class="q-mb-md">
    <!-- Encabezado -->
    <q-card-section class="row items-center q-pb-none">
      <div class="col-md-8 text-center">
        <h5 class="text-h5 q-my-none">Carga de productos</h5>
      </div>
      <div class="col-md-4 text-right">
        <q-btn
          color="primary"
          label="Continuar"
          icon-right="arrow_forward"
          @click="continuar"
          :disable="!hayProductos"
        />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Filtros -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Filtro Almacén -->
        <div class="col-md-4">
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenes"
            option-label="nombre"
            option-value="id"
            label="Origen de venta*"
            emit-value
            map-options
            clearable
            @update:model-value="cambiarAlmacen"
            :loading="cargandoAlmacenes"
          />
        </div>

        <!-- Filtro Campaña (condicional) -->
        <div class="col-md-4" v-if="mostrarCampana">
          <q-select
            v-model="campanaSeleccionada"
            :options="campanas"
            option-label="nombre"
            option-value="id"
            label="Campañas activas"
            emit-value
            map-options
            clearable
            @update:model-value="cambiarCampana"
            :loading="cargandoCampanas"
          />
        </div>

        <!-- Filtro Categoría -->
        <div class="col-md-4">
          <q-select
            v-model="categoriaSeleccionada"
            :options="categorias"
            option-label="nombre"
            option-value="id"
            label="Categoría de precio"
            emit-value
            map-options
            clearable
            @update:model-value="cambiarCategoria"
            :loading="cargandoCategorias"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Formulario para agregar productos -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Selector de Producto -->
        <div class="col-md-5">
          <q-select
            v-model="productoSeleccionado"
            :options="productosFiltrados"
            option-label="descripcionCompleta"
            label="Producto*"
            use-input
            fill-input
            input-debounce="300"
            @filter="filtrarProductos"
            @update:model-value="seleccionarProducto"
            :loading="cargandoProductos"
            :disable="!categoriaSeleccionada"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.codigo }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.descripcion }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ scope.opt.stock }} disponibles</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Stock disponible -->
        <div class="col-md-2">
          <q-input
            v-model.number="stockDisponible"
            label="Stock disponible"
            type="number"
            readonly
            outlined
          />
        </div>

        <!-- Cantidad -->
        <div class="col-md-2">
          <q-input
            v-model.number="cantidad"
            label="Cantidad*"
            type="number"
            min="1"
            :max="stockDisponible"
            :rules="[
              (val) => val > 0 || 'Ingrese cantidad válida',
              (val) => val <= stockDisponible || 'Supera el stock disponible',
            ]"
            outlined
          />
        </div>

        <!-- Precio -->
        <div class="col-md-2">
          <q-input
            v-model.number="precio"
            label="Precio unitario*"
            type="number"
            min="0.01"
            step="0.01"
            prefix="$"
            :rules="[(val) => val > 0 || 'Ingrese precio válido']"
            outlined
          />
        </div>

        <!-- Botón agregar -->
        <div class="col-md-1 flex flex-center">
          <q-btn
            round
            color="positive"
            icon="add"
            @click="agregarProducto"
            :disable="!productoValido"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Tabla de productos en carrito -->
    <q-card-section>
      <q-table
        :rows="carrito.listaProductos"
        :columns="columnasCarrito"
        row-key="idproductoalmacen"
        flat
        bordered
        :pagination="{ rowsPerPage: 10 }"
        :loading="cargandoCarrito"
      >
        <!-- Columna de acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              icon="delete"
              color="negative"
              size="sm"
              flat
              round
              @click="eliminarProducto(props.row.idproductoalmacen)"
            />
          </q-td>
        </template>

        <!-- Totales en el footer -->
        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="3" class="text-right text-weight-bold">Sub Total:</q-td>
            <q-td class="text-right">{{ formatoMoneda(carrito.subtotal) }}</q-td>
            <q-td></q-td>
          </q-tr>

          <q-tr>
            <q-td colspan="3" class="text-right text-weight-bold">Descuento:</q-td>
            <q-td>
              <q-input
                v-model.number="carrito.descuento"
                type="number"
                min="0"
                step="0.01"
                dense
                borderless
                style="width: 100px"
                @update:model-value="actualizarDescuento"
              />
            </q-td>
            <q-td></q-td>
          </q-tr>

          <q-tr>
            <q-td colspan="3" class="text-right text-weight-bold">Total:</q-td>
            <q-td class="text-right">{{ formatoMoneda(carrito.ventatotal) }}</q-td>
            <q-td></q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useVentasStore } from 'stores/ventas'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const ventasStore = useVentasStore()

// Acceso al store
const { carrito, almacenes, categorias, campanas, mostrarCampana, productosFiltrados } =
  storeToRefs(ventasStore)

// Estados locales
const almacenSeleccionado = ref(null)
const campanaSeleccionada = ref(null)
const categoriaSeleccionada = ref(null)
const productoSeleccionado = ref(null)
const cantidad = ref(1)
const precio = ref(0)
const stockDisponible = ref(0)
const terminoBusqueda = ref('')

// Estados de carga
const cargandoAlmacenes = ref(false)
const cargandoCampanas = ref(false)
const cargandoCategorias = ref(false)
const cargandoProductos = ref(false)
const cargandoCarrito = ref(false)

// Columnas para la tabla del carrito
const columnasCarrito = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  {
    name: 'precio',
    label: 'Precio',
    field: (row) => row.precio,
    format: (val) => formatoMoneda(val),
    align: 'right',
    sortable: true,
  },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed properties
const hayProductos = computed(() => carrito.value.listaProductos.length > 0)
const productoValido = computed(() => {
  return (
    productoSeleccionado.value &&
    cantidad.value > 0 &&
    cantidad.value <= stockDisponible.value &&
    precio.value > 0
  )
})

// Métodos
async function cambiarAlmacen(idAlmacen) {
  try {
    cargandoCampanas.value = true
    cargandoCategorias.value = true

    ventasStore.idalmacenfiltro = idAlmacen
    carrito.value.idalmacen = idAlmacen

    // Cargar campañas y categorías en paralelo
    await Promise.all([ventasStore.cargarCampanas(), ventasStore.cargarCategorias()])

    // Reiniciar selecciones
    campanaSeleccionada.value = null
    categoriaSeleccionada.value = null
    productoSeleccionado.value = null
  } catch (error) {
    mostrarError('Error al cambiar almacén', error)
  } finally {
    cargandoCampanas.value = false
    cargandoCategorias.value = false
  }
}

async function cambiarCampana(idCampana) {
  try {
    cargandoCategorias.value = true

    if (idCampana && idCampana !== 0) {
      await ventasStore.cargarCategoriasCampana(idCampana)
    } else {
      await ventasStore.cargarCategorias()
    }

    categoriaSeleccionada.value = null
    productoSeleccionado.value = null
  } catch (error) {
    mostrarError('Error al cambiar campaña', error)
  } finally {
    cargandoCategorias.value = false
  }
}

function cambiarCategoria() {
  productoSeleccionado.value = null
}

function filtrarProductos(val, update) {
  terminoBusqueda.value = val.toLowerCase()
  update()
}

function seleccionarProducto(producto) {
  if (producto) {
    stockDisponible.value = producto.stock
    precio.value = producto.precio
    cantidad.value = 1
  } else {
    stockDisponible.value = 0
    precio.value = 0
    cantidad.value = 1
  }
}

function agregarProducto() {
  try {
    if (!productoValido.value) return

    ventasStore.agregarProducto({
      ...productoSeleccionado.value,
      cantidad: cantidad.value,
      precio: precio.value,
    })

    // Resetear formulario
    productoSeleccionado.value = null
    stockDisponible.value = 0
    precio.value = 0
    cantidad.value = 1

    $q.notify({
      type: 'positive',
      message: 'Producto agregado al carrito',
      timeout: 1000,
    })
  } catch (error) {
    mostrarError('Error al agregar producto', error)
  }
}

function eliminarProducto(idProducto) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar este producto del carrito?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    ventasStore.eliminarProducto(idProducto)
    $q.notify({
      type: 'info',
      message: 'Producto eliminado del carrito',
      timeout: 1000,
    })
  })
}

function actualizarDescuento() {
  ventasStore.actualizarTotales()
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(valor)
}

function continuar() {
  if (!hayProductos.value) {
    $q.dialog({
      title: 'Confirmar',
      message: 'No hay productos en el carrito. ¿Desea continuar de todos modos?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      emit('continuar')
    })
  } else {
    emit('continuar')
  }
}

function mostrarError(titulo, error) {
  $q.notify({
    type: 'negative',
    message: titulo,
    caption: error.message || 'Error desconocido',
    position: 'top',
  })
  console.error(titulo, error)
}

// Eventos
const emit = defineEmits(['continuar'])

// Ciclo de vida
onMounted(async () => {
  try {
    cargandoAlmacenes.value = true
    await ventasStore.cargarAlmacenes()

    // Si solo hay un almacén, seleccionarlo automáticamente
    if (almacenes.value.length === 1) {
      almacenSeleccionado.value = almacenes.value[0].id
      await cambiarAlmacen(almacenes.value[0].id)
    }
  } catch (error) {
    mostrarError('Error al cargar datos iniciales', error)
  } finally {
    cargandoAlmacenes.value = false
  }
})
</script>

<style lang="scss" scoped>
.q-table {
  th {
    font-weight: bold;
    background-color: #f5f5f5;
  }

  .q-table__bottom {
    border-top: 1px solid #e0e0e0;
  }
}

.q-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.q-field {
  margin-bottom: 12px;
}
</style>
