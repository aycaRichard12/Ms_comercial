<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <q-form @submit.prevent="handleSubmit">
        <q-card-section>
          <div class="text-h6">Tipo Cliente</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="localData.tipo"
            label="Tipo cliente*"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </q-card-section>
        <q-card-section
          ><q-input
            v-model="localData.descripcion"
            label="Descripción del tipo cliente*"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
          <q-btn label="Guardar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
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
