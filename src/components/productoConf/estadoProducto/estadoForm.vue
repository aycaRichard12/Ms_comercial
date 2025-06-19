<template>
  <q-form @submit.prevent="handleSubmit">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Estados Productos</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="localData.nombre"
          label="Estado del producto*"
          outlined
          dense
          :rules="[(val) => !!val || 'Campo requerido']"
          name="nombre"
          autocomplete="off"
        />

        <q-input
          v-model="localData.descripcion"
          label="Descripción*"
          outlined
          dense
          :rules="[(val) => !!val || 'Campo requerido']"
          name="descripcion"
          autocomplete="off"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
        <q-btn label="Guardar" type="submit" color="primary" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEditing: Boolean,
  modelValue: Object,
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
