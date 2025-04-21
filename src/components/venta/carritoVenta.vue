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
          @click="handleBack"
          :disable="carritoPrueba.length === 0"
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
          :prefix="currencyStore.simbolo"
          :rules="[(val) => val > 0 || 'Ingrese precio válido']"
        />
      </div>

      <div class="col-12 col-sm-3 flex items-center">
        <q-btn
          label="Añadir al carritoPrueba"
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
          :rows="carritoPrueba"
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
              <q-td class="text-center">{{ currencyStore.simbolo }}{{ subTotal.toFixed(2) }}</q-td>
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
                  :prefix="currencyStore.simbolo"
                  @update:model-value="calcularTotal"
                />
              </q-td>
              <q-td></q-td>
            </q-tr>
            <q-tr>
              <q-td colspan="5" class="text-right text-weight-bold">Total:</q-td>
              <q-td class="text-center">{{ currencyStore.simbolo }}{{ total.toFixed(2) }}</q-td>
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
import { useCurrencyStore } from 'src/stores/currencyStore'
const currencyStore = useCurrencyStore()

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
const emit = defineEmits(['volver'])

const handleBack = () => {
  continuarVenta()
  emit('volver') // Esto activará el toggle en el padre
}
// Estado del componente
const almacenSeleccionado = ref(null)
const categoriaPrecioSeleccionada = ref(null)
const categoriaCampaniaSeleccionada = ref(null)
const mostrarCategoriasCampania = ref(false)
const productoSeleccionado = ref(null)
const cantidad = ref(1)
const precioUnitario = ref(0)
const descuento = ref(0)
const carritoPrueba = ref([])

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

// Columnas para la tabla del carritoPrueba
const columnasCarrito = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  {
    name: 'precio',
    label: 'Precio Unit.',
    field: 'precio',
    align: 'right',
    format: (val) => `${currencyStore.simbolo}${val.toFixed(2)}`,
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    format: (val) => `${currencyStore.simbolo}${val.toFixed(2)}`,
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
  return carritoPrueba.value.reduce((sum, item) => sum + item.subtotal, 0)
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

    // Simular datos del carritoPrueba en localStorage
    const datos = JSON.parse(localStorage.getItem('carrito'))
    console.log(datos.listaProductos)
    const datosCarrito = datos
    const idporcentajeventa = categoriaPrecioSeleccionada.value

    const endpoint = `/listaProductosDisponiblesVenta/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar productos')

    // Filtrar productos como en la lógica original
    let productosDisponibles = data.datos.filter((u) => u.idporcentaje == idporcentajeventa)
    console.log(productosDisponibles, datosCarrito.listaProductos)
    if (datosCarrito.listaProductos.length > 0) {
      productosDisponibles = productosDisponibles.filter(
        (u) =>
          !datosCarrito.listaProductos.some((u2) => {
            console.log(u2, u)
            return Number(u.id) === Number(u2.id)
          }),
      )
    }
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

function seleccionarProducto(producto) {
  if (!producto) {
    resetearCamposProducto()
    return
  }

  precioUnitario.value = producto.originalData.precio || 0
}
function decimas(saldo) {
  var saldocondecimas = parseFloat(saldo).toFixed(2)
  return saldocondecimas
}
function redondear(num) {
  if (typeof num != 'number') {
    return null
  }
  let signo = num >= 0 ? 1 : -1
  return parseFloat(
    (Math.round(num * Math.pow(10, 2) + signo * 0.0001) / Math.pow(10, 2)).toFixed(2),
  )
}
function agregarAlCarrito() {
  const datos = JSON.parse(localStorage.getItem('carrito'))
  const producto = productoSeleccionado.value.originalData
  const nuevoProducto = {
    idproductoalmacen: producto.idalmacen,
    cantidad: cantidad.value,
    precio: precioUnitario.value,
    idstock: producto.idstock,
    idporcentaje: producto.idporcentaje,
    candiponible: producto.stock,
    descripcion: producto.descripcion,
    codigo: producto.codigo,
    id: producto.id,
    subtotal: precioUnitario.value * cantidad.value,
    datosAdicionales: producto.datosAdicionales,
  }
  datos.listaProductos.push(nuevoProducto)

  const nuevoProductoFactura = {
    codigoProducto: producto.codigo,
    codigoActividadSin: producto.actividadsin,
    codigoProductoSin: producto.codigosin,
    descripcion: producto.descripcion,
    unidadMedida: producto.unidadsin,
    precioUnitario: precioUnitario.value,
    subTotal: decimas(redondear(parseFloat(cantidad.value) * parseFloat(precioUnitario.value))),
    cantidad: cantidad.value,
    numeroSerie: '',
    montoDescuento: 0,
    numeroImei: '',
    codigoNandina: producto.codigonandina,
  }
  datos.listaProductosFactura.push(nuevoProductoFactura)

  // Actualiza el subtotal sumando los nuevos productos
  datos.subtotal = datos.listaProductos
    .reduce((subtotal, producto) => {
      const precio = parseFloat(producto.precio)
      const cantidad = parseFloat(producto.cantidad)
      return subtotal + precio * cantidad
    }, 0)
    .toFixed(2)

  // Calcula la ventatotal restando el descuento del subtotal
  datos.ventatotal = (parseFloat(datos.subtotal) - parseFloat(datos.descuento)).toFixed(2)

  carritoPrueba.value.push(nuevoProducto)

  // Guarda los datos actualizados en el localStorage
  localStorage.setItem('carrito', JSON.stringify(datos))
  $q.notify({
    type: 'positive',
    message: 'Producto agregado al carrito',
  })

  resetearCamposProducto()
  productoSeleccionado.value = null
  cargarProductosDisponibles()
}
function eliminarDelCarrito(item) {
  carritoPrueba.value = carritoPrueba.value.filter((i) => i.id !== item.id)

  // Actualizar localStorage
  localStorage.setItem(
    'carritoPrueba',
    JSON.stringify({
      listaProductos: carritoPrueba.value.map((item) => ({
        idproductoalmacen: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    }),
  )

  $q.notify({
    type: 'info',
    message: 'Producto eliminado del carritoPrueba',
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
    productos: carritoPrueba.value,
    descuento: descuento.value,
    total: total.value,
  })
}
function limpiarCarrito() {
  localStorage.setItem(
    'carritoPrueba',
    JSON.stringify({
      listaProductos: [],
    }),
  )
  localStorage.removeItem('carrito')
}

function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
    window.location.assign('../../vapp/')
  }
}

async function crearCarritoVenta() {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo

    // Verificar que currencyStore.divisa esté cargado
    if (!currencyStore.divisa) {
      console.error('Divisa no está definida en currencyStore')
      return
    }

    // Obtener datos existentes o crear estructura inicial
    const carritoExistente = JSON.parse(localStorage.getItem('carrito')) || {
      listaProductos: [],
      listaProductosFactura: [],
      listaFactura: {},
    }

    const datos = {
      ...carritoExistente,
      idalmacen: almacenSeleccionado.value || 0,
      codigosinsucursal: null,
      token,
      tipo,
      iddivisa: currencyStore.divisa.id || null, // Eliminado computed()
      idcampana: categoriaCampaniaSeleccionada.value || 0,
      ventatotal: total.value || 0,
      subtotal: subTotal.value || 0,
      descuento: descuento.value || 0,
      nropagos: 0,
      valorpagos: 0,
      dias: 0,
      fechalimite: 0,
    }

    console.log('Guardando carritoDos:', datos)
    localStorage.setItem('carrito', JSON.stringify(datos))
    return true
  } catch (error) {
    console.error('Error al crear carritoDos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al preparar datos de venta',
    })
    return false
  }
}
// Inicialización $
onMounted(async () => {
  try {
    // Primero cargar la divisa y esperar a que termine
    await currencyStore.cargarDivisaActiva()

    // Verificar que se cargó correctamente
    if (!currencyStore.divisa) {
      console.error('No se pudo cargar la divisa')
      return
    }

    // Luego cargar el resto de los datos
    await limpiarCarrito()

    await cargarAlmacenes()
    await crearCarritoVenta()
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
.q-card {
  border-radius: 8px;
  margin-top: 20px;
}

.q-table__bottom-row td {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
