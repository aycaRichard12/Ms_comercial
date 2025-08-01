export const PAGINAS = Object.freeze({
  configuraciongeneral: Object.freeze(['tipodealmacen', 'divisas', 'leyendaproforma']),
  configuracionproducto: Object.freeze([
    'categoriadeproducto',
    'estadodeproducto',
    'unidaddeproducto',
    'caracteristicadeproducto',
    'parametrosdeobsolescencia',
  ]),
  configuracioncliente: Object.freeze(['tiposdeclientes', 'canalesdeventa']),
  administracioncreacion: Object.freeze([
    'registraralmacen',
    'registrarpuntodeventa',
    'registrarproductos',
  ]),
  administracionasignacion: Object.freeze([
    'asignaralmacen',
    'asignarpuntodeventa',
    'asignarproductos',
  ]),
  administracionprecios: Object.freeze([
    'costounitario',
    'categoriasdeprecio',
    'preciossugeridos',
    'reportedepreciosbase',
    'reportedecategoriasdeprecio',
  ]),
  registrarventa: Object.freeze([
    'registrarventaoculto',
    'registrarcotizacionoculto',
    'reportedeventas',
    'reportedecotizacionesocultas',
    'reporteproductosvendidosindividual',
    'kardex',
  ]),
  contingencias: Object.freeze(['registraranulaciones', 'registrodeextravios', 'registrodemermas']),
  cuentasporcobrar: Object.freeze([
    'cuentasporcobrarocultas',
    'reportecuentasporcobrarocultas',

    'reportecuentasxpagarxperiodo',
  ]),
  reportedeindicederotacion: Object.freeze([
    'reportedeindicederotacionporalmacen',
    'reportedeindicederotacionglobal',
    'reportedeindicederotacionporcliente',
  ]),
  // ... (otros grupos con el mismo formato)
})

export const PAGINAS_ICONS = Object.freeze({
  // Íconos para los submenús de Configuración General
  tipodealmacen: 'store',
  divisas: 'attach_money',
  leyendaproforma: 'description',

  // Íconos para los submenús de Configuración de Producto
  categoriadeproducto: 'category',
  estadodeproducto: 'fact_check',
  unidaddeproducto: 'straighten',
  caracteristicadeproducto: 'style',
  parametrosdeobsolescencia: 'history_toggle_off',

  // Íconos para los submenús de Configuración de Cliente
  tiposdeclientes: 'groups',
  canalesdeventa: 'shopping_cart',

  // Íconos para los submenús de Administración Creación
  registraralmacen: 'storefront',
  registrarpuntodeventa: 'local_mall',
  registrarproductos: 'playlist_add',

  // Íconos para los submenús de Administración Asignación
  asignaralmacen: 'assignment_return',
  asignarpuntodeventa: 'assignment_ind',
  asignarproductos: 'post_add',

  // Íconos para los submenús de Administración de Precios
  costounitario: 'attach_money',
  categoriasdeprecio: 'price_check',
  preciossugeridos: 'request_quote',

  // Íconos para los submenús de Registro de Ventas
  registrarventaoculto: 'shopping_basket',
  registrarcotizacionoculto: 'calculate',
  reportedeventas: 'insights',
  reportedecotizacionesocultas: 'visibility_off',
  reporteproductosvendidosindividual: 'shopping_cart',
  kardex: 'list_alt',

  // Íconos para los submenús de Contingencias
  registraranulaciones: 'cancel',
  registrodeextravios: 'help_outline',
  registrodemermas: 'remove_shopping_cart',

  // Íconos para los submenús de Cuentas por Cobrar
  reportecuentasporcobrarocultas: 'account_balance_wallet',
  cuentasporcobrarocultas: 'credit_card',

  // Íconos para los submenús de Reporte de Índice de Rotación
  reportedeindicederotacionporalmacen: 'store',
  reportedeindicederotacionglobal: 'public',
  reportedeindicederotacionporcliente: 'person_search',
})

/**
 * Helper para verificar si una clave existe en los atributos.
 * @param {string} grupo - Ej: 'configuraciongeneral'
 * @param {string} atributo - Ej: 'tipodealmacen'
 */
export const tieneAtributo = (grupo, atributo) => {
  return PAGINAS[grupo]?.includes(atributo) ?? false
}

/**
 * Obtiene todos los grupos disponibles
 * @returns {string[]}
 */
export const obtenerGrupos = () => {
  return Object.keys(PAGINAS)
}

/**
 * Obtiene todos los atributos de un grupo
 * @param {string} grupo
 * @returns {string[]}
 */
export const obtenerAtributos = (grupo) => {
  return PAGINAS[grupo] || []
}

/**
 * Obtiene el ícono para un menú/submenú
 * @param {string} codigo
 * @returns {string}
 */
export const obtenerIcono = (codigo) => {
  const prefix = codigo?.split('-')[0] || ''
  return PAGINAS_ICONS[prefix] || 'help_outline'
}
