export const PAGINAS_SELECT = Object.freeze({
  registrarventa: Object.freeze([
    'reportedeventas',
    'reportedecotizacionesocultas',
    'reporteproductosvendidosindividual',
  ]),
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

  registrodecliente: 'person_add',
  registrarproveedor: 'local_shipping',
  //autoiriziones
  gestionPedido: 'assignment_turned_in',
  procesarventaspendientes: 'pending_actions',
  autorizarcompra: 'shopping_bag',
  //compras
  registrarcompra: 'add_shopping_cart',
  reporteproductoscomprados: 'receipt_long',
  reportedecompras: 'bar_chart',
  reportestockdeproductosindividual: 'inventory',
  //campañas
  crearcampanas: 'campaign',
  reportedecampanas: 'summarize',
  reportedeventasporcampanas: 'sell',
  //Movimientos
  movimientos: 'swap_horiz',
  reportedemovimientos: 'assessment',
  //pedidos
})

/**
 * Helper para verificar si una clave existe en los atributos.
 * @param {string} grupo - Ej: 'configuraciongeneral'
 * @param {string} atributo - Ej: 'tipodealmacen'
 */
export const tieneAtributo = (grupo, atributo) => {
  return PAGINAS_SELECT[grupo]?.includes(atributo) ?? false
}

/**
 * Obtiene todos los grupos disponibles
 * @returns {string[]}
 */
export const obtenerGrupos = () => {
  return Object.keys(PAGINAS_SELECT)
}

/**
 * Obtiene todos los atributos de un grupo
 * @param {string} grupo
 * @returns {string[]}
 */
export const obtenerAtributos = (grupo) => {
  return PAGINAS_SELECT[grupo] || []
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
