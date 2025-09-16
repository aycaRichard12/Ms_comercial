<template>
  <q-card class="document-preview q-pa-md">
    <q-card-section class="text-center">
      <div class="text-h4 text-weight-bold">Nota de Crédito/Débito</div>
      <div class="text-subtitle1 text-grey-8">Razón Social: {{ nota.nombreRazonSocial }}</div>
      <div>NIT: {{ nota.numeroDocumento }}</div>
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <div class="text-h6 section-title">Datos de la Factura Original</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Nro. Factura:</q-item-label>
              <q-item-label class="text-weight-medium">{{
                nota.facturaExterna.numeroFactura
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Fecha Factura:</q-item-label>
              <q-item-label>{{
                new Date(nota.facturaExterna.fechaFacturaOriginal).toLocaleDateString('es-BO')
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Monto Total Original:</q-item-label>
              <q-item-label class="text-weight-medium"
                >Bs. {{ nota.facturaExterna.montoTotalFacturaOriginal.toFixed(2) }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>CUF Original:</q-item-label>
              <q-item-label class="cuf-text">{{
                nota.facturaExterna.numeroAutorizacionCuf
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="text-h6 section-title">Detalle Factura</div>
      <q-table
        flat
        bordered
        :rows="nota.facturaExterna.detalleFacturaOriginal"
        :columns="columnsDetalle"
        row-key="codigoProducto"
        hide-bottom
        class="q-mt-md"
      />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="text-h6 section-title">Datos de la Nota</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Nro. Nota:</q-item-label>
              <q-item-label class="text-weight-medium">{{ nota.numeroNota }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Código Cliente:</q-item-label>
              <q-item-label>{{ nota.codigoCliente }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Usuario:</q-item-label>
              <q-item-label>{{ nota.usuario }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Punto de Venta:</q-item-label>
              <q-item-label>{{ getPuntoVenta(nota.codigoPuntoVenta) }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Documento de Identidad:</q-item-label>
              <q-item-label>
                {{ getTipoDocumento(nota.codigoTipoDocumentoIdentidad) }} -
                {{ nota.numeroDocumento }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Leyenda:</q-item-label>
              <q-item-label>{{ getLeyenda(nota.codigoLeyenda) }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="text-h6 section-title">Detalle de la Devolución / Ajuste</div>
      <q-table
        flat
        bordered
        :rows="nota.detalles"
        :columns="ColumnsDetalleAjuste"
        row-key="codigoProducto"
        hide-bottom
        class="q-mt-md"
      >
        <!-- Edición en línea de cliente -->

        <template v-slot:body-cell-cantidad="props">
          <q-td :props="props" style="cursor: pointer; background-color: #f9f9f9">
            <q-popup-edit v-model.number="props.row.cantidad" v-slot="scope">
              <label for="cantidad">Cantidad</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                autofocus
                type="number"
                id="cantidad"
                @keyup.enter="scope.set"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit>
            {{ props.row.cantidad }}
            <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
          </q-td>
        </template>
        <template v-slot:body-cell-precioUnitario="props">
          <q-td :props="props">
            <q-popup-edit v-model.number="props.row.precioUnitario" v-slot="scope">
              <label for="preciounitario">Precio Unitario</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                autofocus
                type="number"
                step="0.01"
                inputmode="decimal"
                id="preciounitario"
                @keyup.enter="scope.set"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit>
            {{ props.row.precioUnitario }}
            <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
          </q-td>
        </template>

        <template v-slot:body-cell-montoDescuento="props">
          <q-td :props="props">
            <q-popup-edit v-model.number="props.row.montoDescuento" v-slot="scope">
              <label for="descuento">Descuento</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                autofocus
                type="number"
                step="0.01"
                inputmode="decimal"
                id="descuento"
                @keyup.enter="scope.set"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit>
            {{ props.row.montoDescuento }}
            <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
          </q-td>
        </template>
        <template v-slot:body-cell-subTotal="props">
          <q-td :props="props">
            {{
              props.row.subTotal =
                Number(props.row.cantidad) * parseFloat(props.row.precioUnitario) -
                parseFloat(props.row.montoDescuento)
            }}
          </q-td>
        </template>

        <!-- Edición en línea de total -->
      </q-table>
    </q-card-section>

    <q-card-section>
      <div class="row justify-end">
        <div class="col-12 col-md-5">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label caption>Descuento Adicional</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-weight-medium">
                  <q-popup-edit v-model.number="nota.montoDescuentoCreditoDebito" v-slot="scope">
                    <q-input
                      v-model.number="scope.value"
                      outlined
                      dense
                      autofocus
                      type="number"
                      step="0.01"
                      inputmode="decimal"
                      @keyup.enter="scope.set"
                      @keyup.esc="scope.cancel"
                    />
                  </q-popup-edit>
                  {{ nota.montoDescuentoCreditoDebito.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="bg-grey-2">
              <q-item-section>
                <q-item-label class="text-weight-bold">MONTO TOTAL DEVUELTO</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-h6 text-weight-bold">
                  <q-popup-edit v-model.number="nota.montoDescuento" v-slot="scope">
                    <q-input
                      v-model.number="scope.value"
                      outlined
                      dense
                      autofocus
                      type="number"
                      step="0.01"
                      inputmode="decimal"
                      @keyup.enter="scope.set"
                      @keyup.esc="scope.cancel"
                    />
                  </q-popup-edit>
                  {{ nota.montoDescuento.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Monto efectivo Crédito/Débito</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-weight-medium">
                  <q-popup-edit v-model.number="nota.montoEfectivoCreditoDebito" v-slot="scope">
                    <q-input
                      v-model.number="scope.value"
                      outlined
                      dense
                      autofocus
                      type="number"
                      step="0.01"
                      inputmode="decimal"
                      @keyup.enter="scope.set"
                      @keyup.esc="scope.cancel"
                    />
                  </q-popup-edit>
                  {{ nota.montoEfectivoCreditoDebito.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>

    <q-separator class="q-mt-md" />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn flat label="Cancelar" color="grey-8" icon="cancel" @click="$emit('cancelar')" />
      <q-btn
        unelevated
        label="Confirmar Registro"
        color="primary"
        icon="check_circle"
        @click="confirmarNota()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import { peticionGET } from 'src/composables/peticionesFetch'
import { URL_APICM } from 'src/composables/services'
import { useQuasar } from 'quasar'
import axios from 'axios'
const $q = useQuasar()

// =============================================
// PROPS Y EMITS
// =============================================
const props = defineProps({
  nota: {
    type: Object,
    required: true,
    // El valor por defecto ayuda a evitar errores durante el desarrollo si el prop no se pasa
    default: () => ({
      numeroNota: 'N/A',
      codigoPuntoVenta: 0,
      nombreRazonSocial: 'S/N',
      codigoTipoDocumentoIdentidad: 1,
      numeroDocumento: '000000',
      codigoCliente: 'C001',
      codigoLeyenda: 1,
      usuario: 'admin',
      montoTotalDevuelto: 0,
      montoDescuentoCreditoDebito: 0,
      montoEfectivoCreditoDebito: 0,
      facturaExterna: {
        facturaExterna: 1,
        numeroFactura: 0,
        numeroAutorizacionCuf: 'N/A',
        fechaFacturaOriginal: new Date().toISOString(),
        descuentoFacturaOriginal: 0,
        montoTotalFacturaOriginal: 0,
        detalleFacturaOriginal: [],
      },
      detalles: [],
    }),
  },
})
const nota = ref(props.nota)
const leyendasSINOptions = ref([])
const puntosVenta = ref([])
console.log(props.nota)
defineEmits(['cancelar'])

// =============================================
// CONFIGURACIÓN DE TABLA
// =============================================
const ColumnsDetalleAjuste = [
  {
    name: 'codigoProducto',
    label: 'Código Producto',
    align: 'left',
    field: 'codigoProducto',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
    style: 'white-space: normal;',
  },
  { name: 'cantidad', label: 'Cantidad', align: 'center', field: 'cantidad' },
  {
    name: 'unidadMedida',
    label: 'Unidad',
    align: 'left',
    field: 'unidadMedida',
    format: (val) => getUnidadMedida(val),
  },
  {
    name: 'precioUnitario',
    label: 'P. Unitario',
    align: 'right',
    field: 'precioUnitario',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'montoDescuento',
    label: 'Descuento',
    align: 'right',
    field: 'montoDescuento',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'subTotal',
    label: 'subTotal',
    align: 'right',
    field: 'subTotal',
    format: (val) => `Bs. ${val.toFixed(2)}`,
    style: 'font-weight: 500',
  },
]
const columnsDetalle = [
  {
    name: 'codigoProducto',
    label: 'Código Producto',
    align: 'left',
    field: 'codigoProducto',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
    style: 'white-space: normal;',
  },
  { name: 'cantidad', label: 'Cantidad', align: 'center', field: 'cantidad' },
  {
    name: 'unidadMedida',
    label: 'Unidad',
    align: 'left',
    field: 'unidadMedida',
    format: (val) => getUnidadMedida(val),
  },
  {
    name: 'precioUnitario',
    label: 'P. Unitario',
    align: 'right',
    field: 'precioUnitario',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'montoDescuento',
    label: 'Descuento',
    align: 'right',
    field: 'montoDescuento',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'subTotal',
    label: 'Subtotal',
    align: 'right',
    field: 'subTotal',
    format: (val) => `Bs. ${val.toFixed(2)}`,
    style: 'font-weight: 500',
  },
]

// =============================================
// FUNCIONES AUXILIARES (simuladas)
// =============================================
// En una aplicación real, estos datos vendrían de un store, un API o un archivo de configuración.
const getTipoDocumento = (codigo) => {
  const tipos = { 1: 'CI', 2: 'CEX', 3: 'PAS', 4: 'OD', 5: 'NIT' }
  return tipos[codigo] || 'Otro'
}
const getPuntoVenta = (codigo) => {
  console.log('Puntos de Venta disponibles:', puntosVenta.value)
  return (
    puntosVenta.value.find((pv) => pv.value === codigo)?.label || 'Punto de Venta no encontrado'
  )
}
// const calcular_montoEfectivoCreditoDebito = () => {
//   const totalTabla = nota.value.detalles.reduce((acc, item) => {
//     return (
//       acc +
//       Number(item.cantidad) * parseFloat(item.precioUnitario) -
//       parseFloat(item.montoDescuento)
//     )
//   }, 0)
//   return totalTabla - montoDescuentoCreditoDebito.value - montoTotalDevuelto.value
// }
const getLeyenda = (codigo) => {
  // Simulación de leyendas
  // const leyendas = {
  //   1: 'Ley N° 453: Tienes derecho a recibir información sobre las características y contenidos de los servicios que utilizas.',
  //   2: 'Ley N° 453: El proveedor deberá entregar el producto en las modalidades y términos ofertados o convenidos.',
  // }
  const res = leyendasSINOptions.value.find((obj) => Number(obj.value) == Number(codigo))
  console.log('Leyenda encontrada:', res)

  return res ? res.label : 'Leyenda no encontrada.'
}

const cargarPuntoVentas = async () => {
  try {
    const response = await validarUsuario()
    const idusuario = response[0]?.idusuario
    const endpoint = `${URL_APICM}/api/listaPuntoVentaFactura/${idusuario}`

    if (idusuario) {
      const response = await axios.get(endpoint)
      const data = response.data.datos

      console.log(data)
      if (data.estado == 'error') {
        console.log(data.error)
      } else {
        nota.value.codigoPuntoVenta = data.find(
          (pv) => pv.idpuntoventa === nota.value.venta.punto_venta,
        )?.codigosin
        console.log('Punto de Venta SIN asignado:', nota.value.codigoPuntoVenta)
        puntosVenta.value = data.map((item) => ({
          label: `${item.nombre} - ${item.codigosin}`,
          value: item.codigosin,
          id: item.idpuntoventa,
        }))
      }
    }
  } catch (error) {
    showError('Error al cargar Punto Venta Sin', error)
  }
}
const showError = (message, error) => {
  console.error(message, error)
  $q.notify({
    type: 'negative',
    message: `${message}: ${error.message || 'Error desconocido'}`,
  })
}

const cargarLeyendaSIN = async () => {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `${URL_APICM}/api/listaLeyendaSIN/leyendas/${token}/${tipo}`
    const resultado = await peticionGET(endpoint)
    if (resultado[0] === 'error') {
      $q.notify({
        type: 'negative',
        message: resultado.error || 'Error al cargar leyendas SIN',
      })
    } else {
      leyendasSINOptions.value = resultado.data.map((item) => ({
        label: `${item.codigoActividad} - ${item.descripcion}`,
        value: item.codigo,
        ...item,
      }))
      console.log(leyendasSINOptions.value)
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al cargar leyendas SIN',
    })
  }
}
const confirmarNota = () => {
  // Aquí puedes agregar la lógica para confirmar la nota de crédito/débito
  // Por ejemplo, enviar los datos al servidor o actualizar el estado en un store
  console.log('Nota confirmada:', nota.value)
  $q.notify({
    type: 'positive',
    message: 'Nota de Crédito/Débito confirmada exitosamente.',
  })
  // Emitir un evento para notificar al componente padre
  // Puedes pasar datos adicionales si es necesario
  // Por ejemplo, el ID de la nota creada o un mensaje de éxito
  // Aquí simplemente emitimos el evento sin datos adicionales
  // $emit('nota-confirmada', { id: nuevaNotaId, mensaje: 'Éxito' })
  // En este caso, solo cerramos el formulario
  // Puedes ajustar esto según tus necesidades
  // Por ejemplo, podrías querer limpiar el formulario en lugar de cerrarlo
  // O podrías querer redirigir al usuario a otra página
  // Aquí simplemente emitimos el evento para cerrar el formulario
  // y dejamos que el componente padre maneje lo que sucede después
  // como mostrar una lista actualizada de notas o redirigir a otra vista
  // Ajusta esto según la lógica de tu aplicación
  // $emit('cerrar-formulario')
  // En este caso, llamamos al método cancelar para cerrar el formulario
}

const getUnidadMedida = (codigo) => {
  // Simulación de unidades
  const unidades = {
    57: 'UNIDAD (BIENES)',
    58: 'PAQUETE',
    // ... agregar más unidades según el catálogo
  }
  return unidades[codigo] || 'N/A'
}
onMounted(async () => {
  await cargarLeyendaSIN()
  await cargarPuntoVentas()
})
</script>

<style scoped>
.document-preview {
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
}

.section-title {
  border-bottom: 2px solid var(--q-primary);
  padding-bottom: 8px;
  margin-bottom: 10px;
  color: var(--q-primary);
  font-weight: 500;
}

.q-item__label--caption {
  font-weight: 500;
  color: #555;
}

.cuf-text {
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
}
</style>
