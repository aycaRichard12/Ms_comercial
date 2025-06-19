<template>
  <div class="q-pa-md">
    <!-- Encabezado -->
    <!-- <div class="row items-center q-mb-md">
      <div class="col-12 col-md-8 text-center">
        <h4 class="text-h4">Carga de productos</h4>
      </div>
      <div class="col-12 col-md-4 text-end">
        <q-btn
          label="Continuar"
          icon-right="arrow_right_alt"
          color="primary"
          @click="handleBack"
          :disable="carritoStore.carrito.length === 0"
        />
      </div>
    </div> -->

    <!-- <AlmacenCategoriaSelector
      @almacen-seleccionado="cargarCategoriasPrecio"
      @categoria-seleccionada="cargarProductosDisponibles"
    /> -->

    <!-- <ProductoSelector
      :disabled="!categoriaPrecioSeleccionada"
      @producto-seleccionado="seleccionarProducto"
    />

    <ProductoDetalle
      v-if="productoSeleccionado"
      :producto="productoSeleccionado"
      @agregar-al-carrito="agregarAlCarrito"
    />

    <CarritoTable /> -->
  </div>
</template>

<script setup></script>
