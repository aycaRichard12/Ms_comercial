<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-card-section class="q-gutter-md">
      <q-row class="q-col-gutter-md">
        <q-col cols="12" md="6">
          <q-input
            v-model="localData.nombre"
            label="Nombre"
            name="nombre"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-input
            v-model="localData.direccion"
            label="Dirección"
            name="direccion"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-input
            v-model="localData.telefono"
            label="Teléfono"
            name="telefono"
            outlined
            dense
            autocomplete="off"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-input
            v-model="localData.email"
            label="Email"
            name="email"
            type="email"
            outlined
            dense
            autocomplete="off"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-select
            v-model="localData.tipoalmacen"
            :options="tiposAlmacen"
            label="Tipo de Almacén"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Seleccione un tipo']"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-select
            v-model="localData.sucursal"
            :options="sucursales"
            label="Sucursal"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Seleccione una sucursal']"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-input
            v-model="localData.stockmin"
            label="Stock Mínimo"
            name="stockmin"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un valor']"
          />
        </q-col>

        <q-col cols="12" md="6">
          <q-input
            v-model="localData.stockmax"
            label="Stock Máximo"
            name="stockmax"
            type="number"
            outlined
            dense
            :rules="[(val) => !!val || 'Ingrese un valor']"
          />
        </q-col>
      </q-row>
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
  tiposAlmacen: {
    type: Array,
    default: () => [],
  },
  sucursales: {
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


