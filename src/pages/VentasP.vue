<template>
  <q-page padding>
    <div v-if="vista === 'principal'">
      <productos-form />
    </div>

    <div v-else-if="vista === 'opciones'">
      <tipo-venta />
    </div>

    <div v-else-if="vista === 'comprobante'">
      <comprobante-venta />
    </div>

    <div v-else-if="vista === 'factura-compra'">
      <factura-compra-venta />
    </div>

    <div v-else-if="vista === 'factura-exportacion'">
      <factura-exportacion />
    </div>

    <div v-else-if="vista === 'factura-alquiler'">
      <factura-alquileres />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import ProductosForm from 'components/Ventas/ProductosForm.vue'
import TipoVenta from 'components/Ventas/TipoVenta.vue'
import ComprobanteVenta from 'components/Ventas/ComprobanteVenta.vue'
import FacturaCompraVenta from 'components/Ventas/FacturaCompraVenta.vue'
import FacturaExportacion from 'components/Ventas/FacturaExportacion.vue'
import FacturaAlquileres from 'components/Ventas/FacturaAlquileres.vue'

const vista = ref('principal')

function cambiarVista(nuevaVista) {
  vista.value = nuevaVista
}

defineExpose({
  cambiarVista,
})
</script>
