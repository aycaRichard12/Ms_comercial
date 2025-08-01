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
    </div>

    <q-form @submit.prevent="$emit('submit', { warehouse, pointOfSale })">
      <div class="title-container">
        <div class="title">Asignación de puntos de venta</div>
        <div class="subtitle">{{ user.name }}</div>
      </div>
      <q-card-section class="row q-col-gutter-x-md justify-center">
        <div class="col-12 col-md-4">
          <label for="almacen">Almacén*</label>
          <q-select
            v-model="warehouse"
            :options="warehouses"
            outlined
            dense
            emit-value
            map-options
            id="almacen"
            option-value="id"
            option-label="name"
            @update:model-value="$emit('load', warehouse)"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="puntoventa">Punto de venta*</label>
          <q-select
            v-model="pointOfSale"
            :options="pointsOfSale"
            id="puntoventa"
            outlined
            dense
            emit-value
            map-options
            option-value="id"
            option-label="name"
          />
        </div>
      </q-card-section>
      <q-card-section class="flex justify-center">
        <q-btn type="submit" color="primary" label="Registrar"
      /></q-card-section>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const warehouse = ref(null)
const pointOfSale = ref(null)
defineProps(['user', 'warehouses', 'pointsOfSale'])
</script>
