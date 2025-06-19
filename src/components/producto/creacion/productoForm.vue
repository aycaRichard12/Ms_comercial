<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card-section>
      <div class="text-h6">Nuevo Registro</div>
    </q-card-section>

    <q-card-section class="q-gutter-md row">
      <div class="col-3">
        <q-input v-model="localData.codigo" label="Cod. Producto*" />
        <q-input v-model="localData.codigobarras" label="Cod. de Barras" />
        <q-select
          v-model="localData.categoria"
          :options="categorias"
          label="Categorías*"
          emit-value
          map-options
          @update:model-value="
            (val) => {
              console.log('Categoría seleccionada:', val)
              emit('categoria-changed', val)
            }
          "
        />

        <q-select
          v-model="localData.estadoproductos"
          :options="estados"
          label="Estados del Producto*"
          emit-value
          map-options
        />
      </div>

      <div class="col-4">
        <q-input v-model="localData.nombre" label="Nombre del Producto*" />
        <q-input v-model="localData.descripcion" label="Descripción*" />
        <q-select
          v-model="localData.subcategoria"
          :options="subcategorias"
          label="Sub Categorías*"
          emit-value
          map-options
        />
        <q-select
          v-model="localData.unidad"
          :options="unidades"
          label="Unidad*"
          emit-value
          map-options
        />
      </div>

      <div class="col-4">
        <q-select
          v-model="localData.medida"
          :options="medidas"
          label="Característica*"
          emit-value
          map-options
          required
        />
        <q-input v-model="localData.otraCaracteristica" label="Otras.Caract." />
        <q-file v-model="localData.imagen" label="Imagen del Producto" />
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      <q-btn label="Guardar" type="submit" color="primary" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEditing: Boolean,
  modelValue: Object,
  categorias: {
    type: Array,
    default: () => [],
  },
  estados: {
    type: Array,
    default: () => [],
  },
  subcategorias: {
    type: Array,
    default: () => [],
  },
  unidades: {
    type: Array,
    default: () => [],
  },
  medidas: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['submit', 'cancel'])

const localData = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)

const handleSubmit = () => {
  emit('submit', localData.value)
}
</script>
