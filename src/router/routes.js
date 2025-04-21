const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/configuraciongeneral',
        component: () => import('pages/General/tipoAlmacenGeneral.vue'),
      },
      {
        path: '/tipodealmacen',
        component: () => import('pages/General/tipoAlmacenGeneral.vue'),
      },
      {
        path: '/divisas',
        component: () => import('pages/General/divisasGeneral.vue'),
      },
      {
        path: '/leyendaproforma',
        component: () => import('pages/General/leyendaProformaGeneral.vue'),
      },
      {
        path: '/configuracionproducto',
        component: () => import('pages/ProductoConf/categoriaProducto.vue'),
      },
      {
        path: '/categoriadeproducto',
        component: () => import('pages/ProductoConf/categoriaProducto.vue'),
      },
      {
        path: '/estadodeproducto',
        component: () => import('pages/ProductoConf/estadoProducto.vue'),
      },
      {
        path: '/unidaddeproducto',
        component: () => import('pages/ProductoConf/unidadProducto.vue'),
      },
      {
        path: '/configuracioncliente',
        component: () => import('pages/config/configuracionclientePage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
