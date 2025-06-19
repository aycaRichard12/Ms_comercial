<template>
  <q-layout view="lHh lpr lff">
    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar class="q-pa-sm" style="height: 56px">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-avatar size="150px">
            <img src="../assets/IMAGOTIPO-02.svg" />
          </q-avatar>
        </q-toolbar-title>
        <q-toolbar-title class="q-gutter-sm flex justify-end items-center">
          <q-btn
            flat
            dense
            icon="exit_to_app"
            text-color="white"
            label="Cerrar Sesión"
            @click="irdashboard"
          />
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="left" v-model="currentTab">
        <q-tab
          v-for="tab in activeTabs"
          :key="tab.codigo + '-' + tab.permiso"
          :name="tab.codigo"
          :icon="tab.icono"
          :label="tab.titulo.split('-')[2]"
          @click="navigateToTab(tab)"
          :class="{ 'text-weight-bold': currentTab === tab.codigo }"
        />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
      >
        <q-btn
          label="Inicio"
          icon="home"
          to="/"
          flat
          unelevated
          color="primary"
          class="menu-header"
          expand-icon-class="text-grey-6"
          header-class="text-weight-medium text-grey-9"
        />

        <q-list padding>
          <q-item
            v-for="menu in items.filter((i) => i.codigo !== 'opcionesocultas')"
            :key="menu.codigo"
            class="q-pa-none menu-item"
          >
            <q-expansion-item
              :label="menu.titulo"
              :icon="iconos[menu.codigo] || 'help_outline'"
              header-class="text-weight-bold text-grey-9"
              expand-icon-class="text-grey-6"
              class="menu-header bg-grey-1"
              v-model="expandedMenu[menu.codigo]"
              @update:model-value="updateExpandedMenu(menu.codigo, $event)"
            >
              <q-list class="submenu-list q-pl-lg">
                <q-item
                  v-for="submenu in menu.submenu"
                  :key="submenu.codigo + '_' + submenu.permiso"
                  clickable
                  v-ripple
                  :to="'/' + submenu.codigo.split('-')[0] + '?key=' + submenu.permiso"
                  class="submenu-item"
                  active-class="my-menu-link"
                  @click="loadTabsForSubmenu(submenu.codigo.split('-')[0])"
                >
                  <q-item-section avatar>
                    <q-icon color="blue" :name="iconos[submenu.codigo.split('-')[0]]" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-grey-8 text-body2">
                    {{ submenu.titulo }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-item>
        </q-list>
      </q-scroll-area>

      <router-link to="/">
        <q-img class="absolute-top" src="../assets/flogo.jpg" style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
            <div class="text-weight-bold">{{ nombreUsuario }}</div>
            <div>{{ cargo }}</div>
          </div>
        </q-img>
      </router-link>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PAGINAS, PAGINAS_ICONS } from './paginas'
import { useMenuStore } from './permitidos'

const expandedMenu = reactive({})

const updateExpandedMenu = (currentMenuCode, isExpanded) => {
  // Close all other menus
  for (const menuCode in expandedMenu) {
    if (menuCode !== currentMenuCode) {
      expandedMenu[menuCode] = false
    }
  }
  // Set the current menu's state
  expandedMenu[currentMenuCode] = isExpanded
}

// Initialize expandedMenu on component mount
onMounted(() => {
  items.value.forEach((item) => {
    if (item.codigo !== 'opcionesocultas') {
      expandedMenu[item.codigo] = false
    }
  })
})

// Verificar permisos
// Obtener datos de página
const irdashboard = () => {
  window.location.href = '/app/dashboard'
}
const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const leftDrawerOpen = ref(false)
const nombreUsuario = ref('Usuario')
const cargo = ref('Sin cargo')
const items = ref([])
const activeTabs = ref([])
const currentTab = ref('')

// Iconos para los menús principales
const iconos = ref({
  configuraciones: 'settings',
  administracion: 'admin_panel_settings',
  compras: 'shopping_cart',
  ventas: 'point_of_sale',
  reportes: 'bar_chart',
  dashboard: 'dashboard',
  productos: 'inventory_2',
  clientes: 'people',
  proveedores: 'local_shipping',
  // Configuraciones específicas
  configuraciongeneral: 'tune', // Para configuración general
  configuracionproducto: 'inventory', // Configuración de productos
  configuracioncliente: 'manage_accounts', // Configuración de clientes

  // Facturación
  leyendasdefacturas: 'description', // Leyendas/notas
  metodosdepagodefacturas: 'payments', // Métodos de pago

  // Administración
  administracioncreacion: 'create', // Creación de elementos
  administracionasignacion: 'assignment_turned_in', // Asignaciones
  administracionprecios: 'attach_money', // Gestión de precios

  // Registros
  registrodecliente: 'person_add', // Registro de clientes
  registrarproveedor: 'local_shipping', // Registro de proveedores
  crearcampanas: 'campaign', // Creación de campañas

  // Operaciones
  generarpedido: 'add_shopping_cart', // Generar pedido
  registrarcompra: 'shopping_basket', // Registrar compra
  movimientos: 'swap_vert', // Movimientos de inventario
  registrarventa: 'point_of_sale', // Registrar venta
  contingencias: 'warning', // Contingencias
  cuentasporcobrar: 'credit_score', // Cuentas por cobrar
  inventarioexterno: 'store', // Inventario externo

  // Reportes
  reporteproductoscomprados: 'assignment_returned', // Reporte productos comprados
  reportestockdeproductosindividual: 'inventory', // Stock individual
  reportestockdeproductosglobal: 'warehouse', // Stock global
  reportedeindicederotacion: 'refresh', // Índice de rotación
  reportedeventasporcampanas: 'campaign', // Ventas por campañas
  reportedecaducidaddeproductos: 'event_busy', // Caducidad de productos
  reporteproductosvendidosglobal: 'assessment', // Productos vendidos global
})

// Cargar tabs para un submenú específico
const loadTabsForSubmenu = (submenuCodigo) => {
  const paginasSubmenu = PAGINAS[submenuCodigo] || []
  const usuario = menuStore.obtenerUsuario

  activeTabs.value = paginasSubmenu
    .map((paginaCodigo) => {
      const codigoCompleto = `${paginaCodigo}-${usuario}`
      const pagina = menuStore.obtenerPagina(codigoCompleto)

      if (!pagina || !pagina.permiso) return null

      return {
        codigo: paginaCodigo,
        titulo: pagina.titulo || paginaCodigo,
        icono: PAGINAS_ICONS[paginaCodigo] || 'help_outline',
        permiso: pagina.permiso,
      }
    })
    .filter(Boolean)
}

// Navegar al tab seleccionado
const navigateToTab = (tab) => {
  console.log(tab)
  router.push(`/${tab.codigo}?key=${tab.permiso}`)
}

// Observar cambios en la ruta
watch(
  () => route.path,
  (newPath) => {
    const pathParts = newPath.split('/')
    if (pathParts.length > 1) {
      const currentPage = pathParts[1]
      currentTab.value = currentPage

      // Buscar el grupo al que pertenece esta página
      const grupo = Object.keys(PAGINAS).find((grupo) => PAGINAS[grupo].includes(currentPage))

      if (grupo) {
        loadTabsForSubmenu(grupo)
      }
    }
  },
  { immediate: true },
)

// Cargar datos iniciales
onMounted(() => {
  const loadData = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch {
      return defaultValue
    }
  }

  // Datos usuario
  const userData = loadData('yofinanciero')
  if (userData[0]) {
    nombreUsuario.value = userData[0].nombre || 'Usuario'
    cargo.value = userData[0].cargo || 'Sin cargo'
  }

  // Datos menú
  const menuData = loadData('yofinancieromenu')
  if (menuData[0]?.menu) {
    items.value = menuData[0].menu
  }
})

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style lang="scss">
.my-menu-link {
  color: white;
  background: #f2c037;
}
.q-tab--active {
  color: var(--q-warning) !important;
  font-weight: bold;
}
</style>
