<template>
  <div>
    <div class="row q-col-gutter-md">
      <!-- Almacén -->
      <div class="col-md-3">
        <q-select
          v-model="filtroAlmacen"
          :options="almacenes"
          label="Origen de venta*"
          emit-value
          map-options
          option-value="value"
          option-label="label"
          filled
        />
      </div>

      <!-- Campañas Activas -->
      <div class="col-md-3" v-show="mostrarCampanas">
        <q-select
          v-model="campanaSeleccionada"
          :options="campanas"
          label="Campañas Activas"
          filled
        />
      </div>

      <!-- Categoría de precio -->
      <div class="col-md-3" v-show="mostrarCategoriaPrecio">
        <q-select
          v-model="categoriaPrecio"
          :options="categoriasPrecio"
          label="Categoría de precio"
          filled
        />
      </div>

      <!-- Categorías de Precio con Campaña -->
      <div class="col-md-3" v-show="mostrarCategoriaCampana">
        <q-select
          v-model="categoriaCampana"
          :options="categoriasCampana"
          label="Categorías de Precio con Campaña"
          filled
        />
      </div>

      <!-- Mostrar checkbox -->
      <div class="col-md-3" v-show="mostrarCheckCampana">
        <q-checkbox v-model="verCategoriaConCampana" label="Mostrar Categorías con Campaña" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <!-- Producto -->
      <div class="col-md-4">
        <q-input
          v-model="producto"
          label="Producto*"
          placeholder="Ingrese el nombre o código del producto"
          debounce="300"
          filled
          @update:model-value="buscarProducto"
        />
        <q-menu v-model="mostrarOpciones" fit anchor="bottom left" self="top left">
          <q-list>
            <q-item
              v-for="(p, index) in listaProductos"
              :key="index"
              clickable
              @click="seleccionarProducto(p)"
            >
              <q-item-section>{{ p.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <!-- Stock disponible -->
      <div class="col-md-2">
        <q-input v-model="stockDisponible" label="Stock disponible" disable filled />
      </div>

      <!-- Cantidad -->
      <div class="col-md-2">
        <q-input v-model="cantidad" label="Cantidad" type="number" filled />
      </div>

      <!-- Precio unitario -->
      <div class="col-md-2">
        <q-input v-model="precio" label="Precio unitario" type="number" filled>
          <template #append>
            <q-icon name="attach_money" />
          </template>
        </q-input>
      </div>

      <!-- Botón Añadir -->
      <div class="col-md-2 flex items-center">
        <q-btn color="primary" label="Añadir producto" @click="anadirProducto" />
      </div>

      <!-- Hidden inputs (pueden usarse como refs o variables internas) -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Datos simulados para selects
const almacenes = [
  { label: 'Seleccione un Almacén', value: '' },
  { label: 'Almacén Cochabamba', value: '58' },
]

const campanas = []
const categoriasPrecio = [{ label: 'Seleccione una Categoría', value: '' }]
const categoriasCampana = []

// Variables de estado
const filtroAlmacen = ref('')
const campanaSeleccionada = ref('')
const categoriaPrecio = ref('')
const categoriaCampana = ref('')
const verCategoriaConCampana = ref(false)

const mostrarCampanas = ref(false)
const mostrarCategoriaPrecio = ref(true)
const mostrarCategoriaCampana = ref(false)
const mostrarCheckCampana = ref(false)

const producto = ref('')
const listaProductos = ref([])
const mostrarOpciones = ref(false)

const stockDisponible = ref('')
const cantidad = ref('')
const precio = ref('')

// Simular búsqueda
function buscarProducto() {
  if (producto.value.length >= 2) {
    listaProductos.value = [
      { label: 'Producto 1', value: 'P1' },
      { label: 'Producto 2', value: 'P2' },
    ]
    mostrarOpciones.value = true
  } else {
    mostrarOpciones.value = false
  }
}

function seleccionarProducto(p) {
  producto.value = p.label
  mostrarOpciones.value = false
  // Simular valores
  stockDisponible.value = '25'
  precio.value = '100'
}

function anadirProducto() {
  console.log('Producto añadido:', {
    producto: producto.value,
    cantidad: cantidad.value,
    precio: precio.value,
  })
}
</script>
