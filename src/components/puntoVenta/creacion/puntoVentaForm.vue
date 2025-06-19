<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card-section class="q-gutter-md">
      <q-input
        v-model="localData.nombre"
        label="Punto de venta*"
        outlined
        dense
        autocomplete="off"
        :rules="[(val) => !!val || 'Campo requerido']"
      />
      <q-input
        v-model="localData.descripcion"
        label="Descripción*"
        outlined
        dense
        autocomplete="off"
        :rules="[(val) => !!val || 'Campo requerido']"
      />
      <q-select
        v-model="localData.idalmacen"
        :options="almacenes"
        label="Almacén*"
        emit-value
        map-options
        outlined
        dense
        :rules="[(val) => !!val || 'Seleccione un tipo']"
      />
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
  almacenes: {
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
