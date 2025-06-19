<template>
  <q-card class="q-mt-lg">
    <q-card-section>
      <div class="text-h6">Productos seleccionados</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-table
        :rows="carrito"
        :columns="columnasCarrito"
        row-key="id"
        flat
        bordered
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn icon="delete" color="negative" flat round @click="eliminarProducto(props.row)" />
          </q-td>
        </template>

        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="5" class="text-right text-weight-bold">Sub Total:</q-td>
            <q-td class="text-center">{{ currencyStore.simbolo }}{{ subTotal }}</q-td>
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
                @update:model-value="actualizarDescuento"
              />
            </q-td>
            <q-td></q-td>
          </q-tr>
          <q-tr>
            <q-td colspan="5" class="text-right text-weight-bold">Total:</q-td>
            <q-td class="text-center">{{ currencyStore.simbolo }}{{ total }}</q-td>
            <q-td></q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useCarritoStore } from 'src/stores/venta/carritoStore'
import { useCurrencyStore } from 'src/stores/currencyStore'

const currencyStore = useCurrencyStore()
const carritoStore = useCarritoStore()

const columnasCarrito = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'precio', label: 'Precio Unit.', field: 'precio', align: 'right' },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    format: (val) => `${currencyStore.simbolo}${val.toFixed(2)}`,
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const carrito = computed(() => carritoStore.carrito)
const subTotal = computed(() => carritoStore.subTotal)
const total = computed(() => carritoStore.total)
const descuento = computed({
  get: () => carritoStore.descuento,
  set: (value) => carritoStore.actualizarDescuento(value),
})

function eliminarProducto(producto) {
  carritoStore.eliminarProducto(producto.id)
}
</script>
