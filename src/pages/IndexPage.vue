<template>
  <q-page class="grid-container">
    <div class="box green">
      <q-card v-if="venta" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/VENTAS.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Venta</q-item-label>
            <q-item-label caption>{{ venta.titulo || 'Ventas' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>
          <q-item-section>
            <q-btn
              flat
              style="color: green"
              label="ok"
              @click="cambiarComponente(VentaComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box yellow">
      <q-card v-if="compra" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/PEDIDOS.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Pedido</q-item-label>
            <q-item-label caption>{{ compra.titulo || 'Compras' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section>
            <q-btn
              flat
              style="color: yellow"
              label="ok"
              @click="cambiarComponente(PedidoComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box red">
      <q-card v-if="dashboard" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/REPORTES.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Reportes</q-item-label>
            <q-item-label caption>{{ dashboard.titulo || 'Reportes' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section>
            <q-btn
              flat
              style="color: red"
              label="ok"
              @click="cambiarComponente(ReporteComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box blue">
      <component :is="componenteActivo" />
    </div>
    <div class="box purple">
      <div class="q-pa-md">
        <q-card class="my-card">
          <q-video src="https://www.youtube.com/embed/k3_tw44QsZQ?rel=0" />

          <q-card-section>
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
/* ======= ESTILOS GENERALES ======= */
.grid-container {
  display: grid;
  gap: 10px;
  padding: 10px;
}

.box {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.q-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* ======= COLORES Y POSICIONAMIENTO ======= */
.green {
  background: green;
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
.yellow {
  background: gold;
  grid-column: 3 / 5;
  grid-row: 1 / 2;
}
.red {
  background: red;
  grid-column: 5 / 7;
  grid-row: 1 / 2;
}
.purple {
  background: purple;
  grid-column: 7 / 11;
  grid-row: 1 / 9;
}
.blue {
  background: rgb(210, 210, 210);
  grid-column: 1 / 7;
  grid-row: 2 / 9;
}

/* ======= ESTILOS PARA ESCRITORIO ======= */
@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: auto auto auto auto auto auto auto auto;

    grid-template-rows: auto auto auto auto auto auto auto auto;
  }
}

/* ======= ESTILOS PARA ANDROID (MÓVILES) ======= */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr; /* Una sola columna */
    grid-template-rows: auto;
  }

  .box {
    height: auto; /* Ajustar altura automáticamente */
  }
  .green,
  .yellow,
  .red,
  .blue,
  .purple {
    grid-column: 1 / 2; /* Todas las cajas en una sola columna */
    grid-row: auto;
  }
}
</style>

<script setup>
import { ref, onMounted, shallowRef, markRaw, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
console.log('Quasar in App.vue:', $q)
// Carga asíncrona de componentes con manejo de errores
const PedidoComponent = defineAsyncComponent({
  loader: () => import('src/components/pedido/pedidoComponent.vue'),
  loadingComponent: { template: '<div>Cargando pedidos...</div>' },
  errorComponent: { template: '<div>Error al cargar pedidos</div>' },
})

const VentaComponent = defineAsyncComponent({
  loader: () => import('src/components/venta/ventaComponent.vue'),
  loadingComponent: { template: '<div>Cargando ventas...</div>' },
})

const ReporteComponent = defineAsyncComponent({
  loader: () => import('src/components/reporte/reporteComponent.vue'),
  loadingComponent: { template: '<div>Cargando reportes...</div>' },
})

const componenteActivo = shallowRef(markRaw(VentaComponent))

const cambiarComponente = (componente) => {
  try {
    componenteActivo.value = markRaw(componente)
  } catch (error) {
    console.error('Error al cambiar componente:', error)
    // Opcional: Mostrar notificación de error al usuario
  }
}
const nombreUsuario = ref('') // Variable reactiva
const venta = ref({})
const compra = ref({})
const dashboard = ref({})

// inicialconst expanded = ref(false)

const contenidoUsuario = localStorage.getItem('yofinanciero')
const contenidoMenus = JSON.parse(localStorage.getItem('yofinancieromenu'))

onMounted(() => {
  if (contenidoUsuario && contenidoMenus) {
    try {
      const parsedData = JSON.parse(contenidoUsuario)
      nombreUsuario.value = parsedData[0]?.nombre || 'Usuario desconocido'

      venta.value = verificar_permiso_venta()
      compra.value = verificar_permiso_pedido()
      dashboard.value = verificar_permiso_dashboard()
      console.log(venta.value) // Devuelve el objeto del submenú o null
      console.log(compra.value) // Devuelve el objeto del submenú o null
      console.log(dashboard.value) // Devuelve el objeto del submenú o null

      // Establecer componente inicial basado en permisos
      if (venta.value) componenteActivo.value = VentaComponent
      else if (compra.value) componenteActivo.value = PedidoComponent
      else if (dashboard.value) componenteActivo.value = ReporteComponent
    } catch (error) {
      console.error('Error al parsear los datos de localStorage:', error)
    }
  } else {
    console.warn('No hay datos en localStorage para "yofinanciero"')
  }
})

const verificar_permiso_pedido = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'generarpedido-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_venta = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarventa-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_dashboard = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'dashboard-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
</script>
