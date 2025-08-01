<template>
  <q-layout view="lHh lpr lff">
    <q-header class="bg-primary text-white">
      <q-toolbar class="q-pa-sm" style="height: 56px">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-avatar
            v-if="typeof logo === 'string'"
            style="width: 150px; height: 30px; border-radius: 0"
          >
            <img :src="logo" alt="icon" />
          </q-avatar>
        </q-toolbar-title>
        <q-toolbar-title class="q-gutter-sm flex justify-end items-center" clearable>
          <q-btn
            flat
            dense
            icon="exit_to_app"
            text-color="white"
            label="Cerrar"
            @click="irdashboard"
          />
        </q-toolbar-title>
      </q-toolbar>

      <transition>
        <q-tabs
          align="left"
          v-model="currentTab"
          v-show="tabsVisible"
          style="background-color: #eeebe2"
        >
          <q-tab
            v-for="tab in activeTabs"
            :key="tab.codigo + '-' + tab.permiso"
            :name="tab.codigo"
            @click="navigateToTab(tab)"
            :class="{ 'text-weight-bold': currentTab === tab.codigo }"
            style="background: linear-gradient(to right, #219286, #044e49); border-radius: 10px"
            class="btn-res q-ma-sm"
          >
            <q-icon :name="tab.icono" class="icono q-mt-lg" />
            <span class="texto q-mt-lg">{{ tab.titulo.split('-')[2] }}</span>
          </q-tab>
        </q-tabs>
      </transition>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-white" style="position: fixed">
      <div>
        <router-link to="/">
          <q-img class="absolute-top" src="../assets/fondou.jpg" style="height: 150px">
            <div class="absolute-bottom bg-transparent">
              <q-avatar size="56px" class="q-mb-sm">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
              <div class="text-weight-bold">{{ nombreUsuario }}</div>
              <div>{{ cargo }}</div>
            </div>
          </q-img>
        </router-link>
      </div>
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
          @click="ocultarTabs"
        />

        <q-list padding="">
          <div
            v-for="menu in items.filter((i) => i.codigo !== 'opcionesocultas')"
            :key="menu.codigo"
            class="q-pa-none menu-item"
          >
            <q-expansion-item
              :label="menu.titulo"
              :icon="iconos[menu.codigo] || 'help_outline'"
              header-class="text-weight-bold text-grey-9"
              expand-icon-class="text-grey-6"
              class="menu-header bg-white-1"
              v-model="expandedMenu[menu.codigo]"
              @update:model-value="updateExpandedMenu(menu.codigo, $event)"
              style=""
            >
              <q-list class="submenu-list q-pl-lg">
                <q-item
                  v-for="submenu in menu.submenu"
                  :key="submenu.codigo + '_' + submenu.permiso"
                  clickable
                  v-ripple
                  :to="'/' + llevarPrimeraPAgina(submenu)"
                  class="submenu-item"
                  :class="{
                    'submenu-activo': subMenuSeleccionado === submenu.codigo.split('-')[0],
                  }"
                  active-class="my-menu-link"
                  @click="selectSubmenu(submenu)"
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
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container style="height: calc(100vh - 50px)">
      <router-view style="background-color: #eeebe2; overflow-y: auto; height: 100%" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { PAGINAS, PAGINAS_ICONS } from 'src/stores/paginas'
import { useMenuStore } from 'src/stores/permitidos'
import logo from 'src/assets/IMAGOTIPO-02.png'
const expandedMenu = reactive({})
const subMenuSeleccionado = ref(null)

const updateExpandedMenu = (currentMenuCode, isExpanded) => {
  for (const menuCode in expandedMenu) {
    if (menuCode !== currentMenuCode) {
      expandedMenu[menuCode] = false
    }
  }
  expandedMenu[currentMenuCode] = isExpanded
}

onMounted(() => {
  items.value.forEach((item) => {
    if (item.codigo !== 'opcionesocultas') {
      expandedMenu[item.codigo] = false
    }
  })
})

const ocultarTabs = () => {
  console.log('ocultar tabs')
  tabsVisible.value = false
}
const irdashboard = () => {
  window.location.href = '/app/dashboard'
}
const router = useRouter()
const menuStore = useMenuStore()

const leftDrawerOpen = ref(false)
const tabsVisible = ref(false) // New reactive variable for tabs visibility
const nombreUsuario = ref('Usuario')
const cargo = ref('Sin cargo')
const items = ref([])
const activeTabs = ref([])
const currentTab = ref('')

// --- Drawer auto-open/close logic ---

// --- Tabs auto-open/close logic ---
let tabsTimeout = null
const TABS_TIMEOUT_MS = 10000 // 15 seconds, same as drawer

const startTabsTimeout = () => {
  clearTabsTimeout() // Clear any existing timeout
  tabsTimeout = setTimeout(() => {
    if (tabsVisible.value) {
      tabsVisible.value = true
    }
  }, TABS_TIMEOUT_MS)
}

const clearTabsTimeout = () => {
  if (tabsTimeout) {
    clearTimeout(tabsTimeout)
    tabsTimeout = null
  }
}

// --- End of auto-open/close logic for both drawer and tabs ---

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
  configuraciongeneral: 'tune',
  configuracionproducto: 'inventory',
  configuracioncliente: 'manage_accounts',
  leyendasdefacturas: 'description',
  metodosdepagodefacturas: 'payments',
  administracioncreacion: 'create',
  administracionasignacion: 'assignment_turned_in',
  administracionprecios: 'attach_money',
  registrodecliente: 'person_add',
  registrarproveedor: 'local_shipping',
  crearcampanas: 'campaign',
  generarpedido: 'add_shopping_cart',
  registrarcompra: 'shopping_basket',
  movimientos: 'swap_vert',
  registrarventa: 'point_of_sale',
  contingencias: 'warning',
  cuentasporcobrar: 'credit_score',
  inventarioexterno: 'store',
  reporteproductoscomprados: 'assignment_returned',
  reportestockdeproductosindividual: 'inventory',
  reportestockdeproductosglobal: 'warehouse',
  reportedeindicederotacion: 'refresh',
  reportedeventasporcampanas: 'campaign',
  reportedecaducidaddeproductos: 'event_busy',
  reporteproductosvendidosglobal: 'assessment',
})

const loadTabsForSubmenu = (submenuCodigo) => {
  const paginasSubmenu = PAGINAS[submenuCodigo] || []
  const usuario = menuStore.obtenerUsuario

  activeTabs.value = paginasSubmenu
    .map((paginaCodigo) => {
      const codigoCompleto = `${paginaCodigo}-${usuario}`
      console.log(codigoCompleto)
      const pagina = menuStore.obtenerPagina(codigoCompleto)
      console.log(pagina)
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

const cargarPaginasSubMenu = (submenuCodigo) => {
  const paginasSubmenu = PAGINAS[submenuCodigo] || []
  const usuario = menuStore.obtenerUsuario
  return paginasSubmenu.map((paginaCodigo) => {
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
}

function llevarPrimeraPAgina(submenu) {
  const submenuCode = submenu.codigo.split('-')[0]
  const tabs = cargarPaginasSubMenu(submenuCode).filter((item) => item != null)
  if (tabs.length > 0) {
    const firstTab = tabs[0]
    return firstTab.codigo
  } else {
    return submenu.codigo.split('-')[0]
  }
}

const selectSubmenu = async (submenu) => {
  const submenuCode = submenu.codigo.split('-')[0]
  subMenuSeleccionado.value = submenuCode
  loadTabsForSubmenu(submenuCode)
  tabsVisible.value = true

  // Si el submenú tiene tabs, navegar al primer tab.
  if (activeTabs.value.length > 0) {
    const firstTab = activeTabs.value[0]
    await navigateToTab(firstTab)
  }
}

const navigateToTab = (tab) => {
  console.log('navegando')
  console.log(tab)
  router.push(`/${tab.codigo}?key=${tab.permiso}`)
  startTabsTimeout()
  console.log('ok')
  currentTab.value = tab.codigo // Asegura que el tab actual se actualice
}

// watch(
//   () => route.path,
//   (newPath) => {
//     const pathParts = newPath.split('/')
//     if (pathParts.length > 1) {
//       const currentPage = pathParts[1]
//       currentTab.value = currentPage

//       const grupo = Object.keys(PAGINAS).find((grupo) => PAGINAS[grupo].includes(currentPage))

//       if (grupo) {
//         loadTabsForSubmenu(grupo)
//         subMenuSeleccionado.value = grupo
//         // Expandir el menú principal si el submenú está dentro de él
//         for (const menu of items.value) {
//           if (menu.submenu && menu.submenu.some((s) => s.codigo.split('-')[0] === grupo)) {
//             expandedMenu[menu.codigo] = true
//             break
//           }
//         }
//       } else {
//         subMenuSeleccionado.value = null
//       }
//     }
//   },
//   { immediate: true },
// )

onMounted(() => {
  const loadData = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const userData = loadData('yofinanciero')
  if (userData[0]) {
    nombreUsuario.value = userData[0].nombre || 'Usuario'
    cargo.value = userData[0].cargo || 'Sin cargo'
  }

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
.submenu-activo {
  background-color: #f2c037;
  color: #1976d2;
  font-weight: bold;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
