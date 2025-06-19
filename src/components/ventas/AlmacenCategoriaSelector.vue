<template>
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
        @update:model-value="onAlmacenSeleccionado"
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
        @update:model-value="onCategoriaSeleccionada"
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
</template>

<script setup>
import { ref } from 'vue'
import { useCategorias } from 'src/composables/venta/apiComposables'

const emit = defineEmits(['almacen-seleccionado', 'categoria-seleccionada'])

const {
  almacenes,
  cargandoAlmacenes,
  categoriasPrecio,
  cargandoCategorias,
  cargarCategoriasPrecio,
} = useCategorias()

const almacenSeleccionado = ref(null)
const categoriaPrecioSeleccionada = ref(null)
const categoriaCampaniaSeleccionada = ref(null)
const mostrarCategoriasCampania = ref(false)

function onAlmacenSeleccionado() {
  cargarCategoriasPrecio(almacenSeleccionado.value)
  emit('almacen-seleccionado', almacenSeleccionado.value)
}

function onCategoriaSeleccionada() {
  emit('categoria-seleccionada', categoriaPrecioSeleccionada.value)
}
</script>
