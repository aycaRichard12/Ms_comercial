import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => {
    try {
      // 1. Obtener datos del localStorage de forma segura
      const storedData = localStorage.getItem('yofinancieromenu')
      if (!storedData) {
        return {
          permitidos: [],
          usuario: null,
          menuPrincipal: [],
        }
      }

      // 2. Parsear los datos
      const parsedData = JSON.parse(storedData)

      // 3. Verificar estructura básica
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        return {
          permitidos: [],
          usuario: null,
          menuPrincipal: [],
        }
      }

      // 4. Extraer el primer módulo (asumiendo que es el correcto)
      const modulo = parsedData[0]

      // 5. Buscar opciones ocultas y usuario
      let opcionesOcultas = { submenu: [] }
      let usuario = null
      let menuPrincipal = []

      if (modulo.menu && Array.isArray(modulo.menu)) {
        // Encontrar opciones ocultas
        const ocultas = modulo.menu.find((obj) => obj.codigo === 'opcionesocultas')
        if (ocultas) {
          opcionesOcultas = {
            submenu: Array.isArray(ocultas.submenu) ? ocultas.submenu : [],
          }
          // Extraer usuario del primer item (si existe)
          usuario = ocultas.usuario || null
        }

        // Filtrar menu principal (excluyendo opcionesocultas)
        menuPrincipal = modulo.menu.filter((item) => item.codigo !== 'opcionesocultas')
      }

      return {
        permitidos: opcionesOcultas.submenu,
        usuario,
        menuPrincipal,
      }
    } catch (error) {
      console.error('Error al cargar datos del menú:', error)
      return {
        permitidos: [],
        usuario: null,
        menuPrincipal: [],
      }
    }
  },

  getters: {
    // Verifica si una página está permitida
    existe: (state) => (codigopagina) => {
      return state.permitidos.some((pagina) => pagina.codigo === codigopagina)
    },

    // Obtiene los datos completos de una página
    obtenerPagina: (state) => (codigopagina) => {
      const pagina = state.permitidos.find((pagina) => pagina.codigo === codigopagina)
      if (!pagina) return null

      // Convertir permiso de string "1111" a boolean
      return {
        ...pagina,
      }
    },

    // Obtiene datos del usuario
    obtenerUsuario: (state) => {
      return state.usuario
    },

    // Obtiene el menú principal (sin opciones ocultas)
    obtenerMenuPrincipal: (state) => {
      return state.menuPrincipal
    },
  },
})
