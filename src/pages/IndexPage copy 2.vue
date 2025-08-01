<template>
  <q-page class="grid-container">
    <div v-for="(box, index) in orderedTopBoxes" :key="box.id">
      <div
        class="box"
        :style="{ 'grid-column': index * 2 + 1 + ' / ' + (index * 2 + 3), 'grid-row': '1 / 2' }"
      >
        <q-card
          flat
          dense
          bordered
          class="col"
          style="background: linear-gradient(to right, #219286, #044e49); color: white"
          :style="{ color: 'white' }"
        >
          <q-item>
            <q-item-section :avatar="box.id !== 'venta'">
              <q-avatar square style="width: 60px; height: 60px; overflow: hidden">
                <img :src="`src/assets/${box.img}`" style="object-fit: cover" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label style="font-size: 10px">{{ box.title }}</q-item-label>
              <q-item-label
                caption
                style="font-family: Arial, Helvetica, sans-serif; color: white; font-size: 12px"
              >
                {{ box.subtitle }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section> </q-item-section>
            <q-item-section :id="box.cardId">
              <q-btn
                flat
                :style="{ color: componenteActivo === box.component ? '#f2c037' : 'white' }"
                label="Ir"
                @click="cambiarComponente(box.component)"
              />
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

    <div class="box blue" id="venta" :style="blueBoxGridPosition">
      <div style="display: flex; justify-content: end">
        <q-btn icon="help_outline" color="blue" flat @click="iniciarGuia" />
      </div>
      <component :is="componenteActivo" />
    </div>
    <div class="box purple" id="reportes-hoy" :style="purpleBoxGridPosition">
      <ReporteVentaInicio />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, shallowRef, markRaw, defineAsyncComponent, computed } from 'vue' // Add 'computed'
import { useQuasar } from 'quasar'
import ReporteVentaInicio from 'src/components/reporteVentas/ReporteVentaInicio.vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
//f2c037
const $q = useQuasar()
console.log('Quasar in App.vue:', $q)
const PedidoComponent = defineAsyncComponent({
  loader: () => import('pages/compra/RcompraPage.vue'),
  loadingComponent: { template: '<div>Cargando pedidos...</div>' },
  errorComponent: { template: '<div>Error al cargar pedidos</div>' },
})
const CrearProductos = defineAsyncComponent({
  loader: () => import('pages/producto/CproductoPage.vue'),
  loadingComponent: { template: '<div>Cargando Productos...</div>' },
  errorComponent: { template: '<div>Error al cargar Productos</div>' },
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
  }
}

const nombreUsuario = ref('')
const venta = ref(null) // Initialize with null to indicate no access initially
const compra = ref(null)
const dashboard = ref(null)
const producto = ref(null)

const contenidoUsuario = localStorage.getItem('yofinanciero')
const contenidoMenus = JSON.parse(localStorage.getItem('yofinancieromenu'))

onMounted(() => {
  if (contenidoUsuario && contenidoMenus) {
    try {
      const parsedData = JSON.parse(contenidoUsuario)
      nombreUsuario.value = parsedData[0]?.nombre || 'Usuario desconocido'

      venta.value = verificar_permiso_venta()
      compra.value = verificar_permiso_compra()
      dashboard.value = verificar_permiso_dashboard()
      producto.value = verificar_permiso_producto()

      // Set initial component based on permissions
      if (venta.value) componenteActivo.value = VentaComponent
      else if (compra.value) componenteActivo.value = PedidoComponent
      else if (dashboard.value) componenteActivo.value = ReporteComponent
      else if (producto.value) componenteActivo.value = CrearProductos // Added this
    } catch (error) {
      console.error('Error al parsear los datos de localStorage:', error)
    }
  } else {
    console.warn('No hay datos en localStorage para "yofinanciero"')
  }
})

const verificar_permiso_compra = () => {
  if (!contenidoMenus) return null // Handle case where contenidoMenus is null
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarcompra-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_venta = () => {
  if (!contenidoMenus) return null
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarventa-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_dashboard = () => {
  if (!contenidoMenus) return null
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'dashboard-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_producto = () => {
  if (!contenidoMenus) return null
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarproductos-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}

// Computed property to determine the order and visibility of the top boxes
const orderedTopBoxes = computed(() => {
  const boxes = []
  if (venta.value)
    boxes.push({
      id: 'venta',
      component: VentaComponent,
      data: venta.value,
      img: 'Ventas.png',
      title: 'VENTAS',
      subtitle: venta.value.titulo || 'Generar venta',
      cardId: 'venta-card',
    })
  if (compra.value)
    boxes.push({
      id: 'compra',
      component: PedidoComponent,
      data: compra.value,
      img: 'Compras.png',
      title: 'COMPRAS',
      subtitle: 'Compras o Producción',
      cardId: 'compra-card',
    })
  if (producto.value)
    boxes.push({
      id: 'producto',
      component: CrearProductos,
      data: producto.value,
      img: 'Productos.png',
      title: 'PRODUCTOS',
      subtitle: 'Administración Productos',
      cardId: 'producto-card',
    })
  if (dashboard.value)
    boxes.push({
      id: 'dashboard',
      component: ReporteComponent,
      data: dashboard.value,
      img: 'Reportes.png',
      title: 'REPORTES',
      subtitle: dashboard.value.titulo || 'Reportes',
      cardId: 'reportes-card',
    })
  return boxes
})

const driverObj = driver()

const iniciarGuia = () => {
  const steps = []
  if (venta.value) {
    steps.push({
      element: '#venta-card',
      popover: {
        title: 'Módulo de Ventas',
        description:
          'Aquí puedes gestionar tus ventas y realizar nuevas transacciones. Haz clic para acceder.',
        side: 'left',
        align: 'start',
      },
    })
  }
  if (compra.value) {
    steps.push({
      element: '#compra-card',
      popover: {
        title: 'Módulo de Compras',
        description:
          'Consulta y administra todas tus compras de manera sencilla. Presiona el botón para ingresar.',
        side: 'bottom',
        align: 'start',
      },
    })
  }
  if (dashboard.value) {
    steps.push({
      element: '#reportes-card',
      popover: {
        title: 'Reportes y Estadísticas',
        description: 'Accede a análisis detallados y estadísticas de rendimiento en tu negocio.',
        side: 'bottom',
        align: 'start',
      },
    })
  }
  if (producto.value) {
    steps.push({
      element: '#producto-card',
      popover: {
        title: 'Gestión de Productos',
        description: 'Agrega, edita y organiza tus productos. ¡Optimiza tu catálogo aquí!',
        side: 'bottom',
        align: 'start',
      },
    })
  }

  steps.push({
    element: '#venta',
    popover: {
      title: 'Carrito de Ventas',
      description: 'Realiza la venta de tus productos fácilmente desde esta sección.',
      side: 'bottom',
      align: 'start',
    },
  })
  steps.push({
    element: '#reportes-hoy',
    popover: {
      title: 'Resumen de Reportes',
      description:
        'Visualiza rápidamente los reportes y métricas del día para mantener el control de tu negocio.',
      side: 'bottom',
      align: 'start',
    },
  })

  driverObj.setSteps(steps)
  driverObj.drive()
}
</script>

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
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

/* ======= COLORES Y POSICIONAMIENTO ======= */
.green {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
.yellow {
  grid-column: 3 / 5;
  grid-row: 1 / 2;
}
.red {
  grid-column: 5 / 7;
  grid-row: 1 / 2;
}
.coffee {
  grid-column: 7/9;
  grid-row: 1/2;
}
.purple {
  grid-column: 10 / 11;
  grid-row: 1 / 9;
}
.blue {
  grid-column: 1 / 9;
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
  .coffee,
  .purple {
    grid-column: 1 / 1; /* Todas las cajas en una sola columna */
    grid-row: auto;
  }
}
</style>
