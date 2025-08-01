<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <template v-for="box in orderedTopBoxes" :key="box.id">
        <div class="col-xs-12 col-sm-6 col-md-3" :class="box.colorClass">
          <q-card
            flat
            dense
            bordered
            class="full-height"
            style="background: linear-gradient(to right, #219286, #044e49)"
            :style="{ color: 'white' }"
          >
            <q-item>
              <q-item-section :avatar="box.id !== 'venta'">
                <div class="svg-icon-wrapper">
                  <component :is="box.iconComponent" class="svg-icon" style="color: white" />
                </div>
              </q-item-section>

              <q-item-section>
                <q-item-label style="font-size: 10px">{{ box.title }}</q-item-label>
                <q-item-label
                  caption
                  style="font-family: Arial, Helvetica, sans-serif; color: white; font-size: 12px"
                  >{{ box.subtitle }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item class="q-pt-none">
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
      </template>
    </div>
    <div class="row flex justify-start">
      <q-btn icon="help_outline" color="blue" flat @click="iniciarGuia" />
    </div>
    <div class="row q-col-gutter-x-md">
      <div class="col-xs-12 col-md-8" id="venta">
        <component :is="componenteActivo" />
      </div>
      <div class="col-xs-12 col-md-4" id="reportes-hoy">
        <div class="full-height"><ReporteVentaInicio /></div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, shallowRef, markRaw, defineAsyncComponent, computed } from 'vue' // Add 'computed'
import { useQuasar } from 'quasar'
import ReporteVentaInicio from 'src/components/reporteVentas/ReporteVentaInicio.vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import IconVentas from 'src/assets/VENTAS.svg'
import IconPedidos from 'src/assets/PEDIDOS.svg'
import IconAdmin from 'src/assets/ADMINISTRACION.svg'
import IconReportes from 'src/assets/REPORTES.svg'

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
      iconComponent: IconVentas,

      title: 'VENTAS',
      subtitle: venta.value.titulo || 'Generar venta',
      cardId: 'venta-card',
    })
  if (compra.value)
    boxes.push({
      id: 'compra',
      component: PedidoComponent,
      data: compra.value,
      iconComponent: IconPedidos,
      title: 'COMPRAS',
      subtitle: 'Compras o Producción',
      cardId: 'compra-card',
    })
  if (producto.value)
    boxes.push({
      id: 'producto',
      component: CrearProductos,
      data: producto.value,
      iconComponent: IconAdmin,
      title: 'PRODUCTOS',
      subtitle: 'Administración Productos',
      cardId: 'producto-card',
    })
  if (dashboard.value)
    boxes.push({
      id: 'dashboard',
      component: ReporteComponent,
      data: dashboard.value,
      iconComponent: IconReportes,
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
/* ======= ESTILOS GENERALES (Flexbox-friendly) ======= */
.q-page {
  /* Quasar's q-pa-md class handles padding, no need for custom padding here */
  /* Ensure no overflow from the page itself if content is too wide */
  overflow-x: hidden;
}

/* Remove .grid-container styles as it's replaced by q-page, row, and col */

.box {
  /* This class is still applied to the wrapper div of each card, but its main layout role is replaced by col classes */
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  /* Ensure boxes don't overflow their column */
  min-width: 0; /* Important for flex items to prevent overflow */
  overflow: hidden; /* Hide any content that still tries to overflow its box */
}

.q-card {
  flex-grow: 1; /* Allow q-card to grow and fill available height within its column */
  display: flex;
  flex-direction: column;
  /* Ensure the card content doesn't overflow its boundaries */
  min-width: 0;
  overflow: hidden; /* Crucial: Prevents content inside card from overflowing the card itself */
}
.svg-icon-wrapper {
  width: 60px; /* Ancho deseado para el contenedor del SVG */
  height: 60px; /* Alto deseado para el contenedor del SVG */
  display: flex; /* Usar flexbox para centrar el SVG */
  justify-content: center; /* Centrar horizontalmente */
  align-items: center; /* Centrar verticalmente */
  overflow: hidden; /* Asegurar que el SVG no se desborde del contenedor */
}

/* Estilos para el SVG real dentro del contenedor */
.svg-icon {
  max-width: 100%; /* Asegurar que el SVG no sea más ancho que su contenedor */
  max-height: 100%; /* Asegurar que el SVG no sea más alto que su contenedor */
  display: block; /* Eliminar espacio extra debajo del SVG */
  /* El color se aplica a través de la prop `style` en el template,
     pero si el SVG usa `currentColor`, este estilo lo afectará. */
}

/* Ensure images scale down */
.q-avatar img {
  max-width: 100%;
  height: auto;
  display: block; /* Remove extra space below images */
}

/* Ensure text breaks if too long */
.q-item-label {
  word-break: break-word; /* Breaks long words */
  overflow-wrap: break-word; /* Breaks long words */
  white-space: normal; /* Ensures text wraps */
}

/* Backgrounds for specific sections (e.g., blue and purple content areas) */
/* You can define custom classes or use Quasar's background color classes */
/* No specific media queries needed for .green, .yellow, .red, .coffee, .blue, .purple
   as their responsive behavior is handled by Quasar's col classes (col-xs-12, col-sm-6, col-md-3, etc.) */
</style>
