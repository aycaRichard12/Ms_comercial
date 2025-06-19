<template>
  <div>
    <div class="row q-mb-md">
      <div class="col-md-2">
        <q-btn
          color="primary"
          icon="arrow_back"
          label="Volver"
          size="sm"
          @click="$emit('volver')"
        />
      </div>
      <div class="col-md-8 text-center">
        <div class="text-h6">Asignación de puntos de venta</div>
        <div class="text-subtitle1">{{ user.name }}</div>
      </div>
    </div>

    <q-form @submit.prevent="$emit('submit', { warehouse, pointOfSale })">
      <div class="row q-col-gutter-md">
        <div class="col-md-6">
          <q-select
            v-model="warehouse"
            :options="warehouses"
            label="Almacén*"
            outlined
            dense
            emit-value
            map-options
            option-value="id"
            option-label="name"
            @update:model-value="$emit('load', warehouse)"
          />
        </div>

        <div class="col-md-6">
          <q-select
            v-model="pointOfSale"
            :options="pointsOfSale"
            label="Punto de venta*"
            outlined
            dense
            emit-value
            map-options
            option-value="id"
            option-label="name"
          />
        </div>

        <div class="col-12 text-center">
          <q-btn type="submit" color="primary" label="Registrar" />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const warehouse = ref(null)
const pointOfSale = ref(null)
defineProps(['user', 'warehouses', 'pointsOfSale'])
</script>
