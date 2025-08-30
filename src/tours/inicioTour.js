export function getHomeTourSteps({ venta, compra, dashboard, producto }) {
  const steps = []

  if (venta) {
    steps.push({
      element: '#venta-card',
      popover: {
        title: 'Módulo de Ventas',
        description: 'Aquí puedes gestionar tus ventas y realizar nuevas transacciones.',
        side: 'left',
        align: 'start',
      },
    })
  }

  if (compra) {
    steps.push({
      element: '#compra-card',
      popover: {
        title: 'Módulo de Compras',
        description: 'Consulta y administra todas tus compras de manera sencilla.',
        side: 'bottom',
        align: 'start',
      },
    })
  }

  if (dashboard) {
    steps.push({
      element: '#reportes-card',
      popover: {
        title: 'Reportes y Estadísticas',
        description: 'Accede a análisis detallados y estadísticas de rendimiento.',
        side: 'bottom',
        align: 'start',
      },
    })
  }

  if (producto) {
    steps.push({
      element: '#producto-card',
      popover: {
        title: 'Gestión de Productos',
        description: 'Agrega, edita y organiza tus productos.',
        side: 'bottom',
        align: 'start',
      },
    })
  }

  steps.push({
    element: '#reportes-hoy',
    popover: {
      title: 'Resumen de Reportes',
      description: 'Visualiza rápidamente los reportes del día.',
      side: 'bottom',
      align: 'start',
    },
  })

  return steps
}
