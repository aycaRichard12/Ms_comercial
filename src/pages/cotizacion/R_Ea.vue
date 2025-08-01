<q-dialog v-model="showPdfModal" maximized>
      <q-card class="pdf-modal-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ pdfModalTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div id="reporteH" class="invoice-container">
            <div class="invoice-overflow">
              <div style="min-width: 600px">
                <header>
                  <div class="row q-col-gutter-sm">
                    <div class="col-4 company-details">
                      <div class="text-h6 text-bold">{{ usuarioInfo.empresa?.nombre }}</div>
                      <div>{{ usuarioInfo.empresa?.direccion }}</div>
                      <div>{{ usuarioInfo.empresa?.telefono }}</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="text-h6 text-bold">
                        {{
                          pdfModalTitle === 'REPORTE'
                            ? 'REPORTE DE COTIZACION'
                            : 'COMPROBANTE DE COTIZACION'
                        }}
                      </div>
                      <div v-if="pdfModalTitle === 'REPORTE'">
                        Entre
                        <span class="text-bold">{{ cambiarFormatoFecha(fechai) }}</span>
                        Y
                        <span class="text-bold">{{ cambiarFormatoFecha(fechaf) }}</span>
                      </div>
                      <div v-if="comprobanteData.divisa">
                        (Expresado en {{ comprobanteData.divisa }})
                      </div>
                    </div>
                    <div class="col-4 text-right">
                      <img
                        v-if="usuarioInfo.empresa?.logo"
                        :src="`.././em/${usuarioInfo.empresa.logo}`"
                        width="130"
                        height="130"
                      />
                    </div>
                  </div>
                </header>

                <main class="q-mt-lg">
                  <div class="row q-col-gutter-md contacts">
                    <div class="col-6 invoice-to">
                      <div class="text-subtitle1 text-bold">
                        {{
                          pdfModalTitle === 'REPORTE' ? 'DATOS DEL REPORTE:' : 'DATOS DEL CLIENTE:'
                        }}
                      </div>
                      <template v-if="pdfModalTitle === 'REPORTE'">
                        <div>
                          <span class="text-bold">Nombre del almacén:</span>
                          {{ almacenSeleccionadoLabel }}
                        </div>
                        <div>
                          <span class="text-bold">Fecha de Impresión:</span>
                          {{ cambiarFormatoFecha(obtenerFechaActualDato()) }}
                        </div>
                      </template>
                      <template v-else-if="comprobanteData">
                        <div>
                          {{ comprobanteData.cliente }} - {{ comprobanteData.nombrecomercial }} -
                          {{ comprobanteData.sucursal }}
                        </div>
                        <div>{{ comprobanteData.direccion }}</div>
                        <div>{{ comprobanteData.email }}</div>
                        <div>
                          <span class="text-bold">Fecha de Cotización:</span>
                          {{ cambiarFormatoFecha(comprobanteData.fecha) }}
                        </div>
                      </template>
                    </div>
                    <div class="col-6 invoice-details">
                      <div class="text-subtitle1 text-bold">DATOS DEL ENCARGADO:</div>
                      <div>{{ usuarioInfo.nombre }}</div>
                      <div>{{ usuarioInfo.cargo }}</div>
                      <div v-if="comprobanteData.tipopago">
                        Venta a {{ comprobanteData.tipopago }}
                      </div>
                    </div>
                  </div>

                  <q-table
                    :rows="pdfTableRows"
                    :columns="pdfTableColumns"
                    row-key="index"
                    hide-bottom
                    flat
                    bordered
                    class="q-mt-md"
                  >
                    <template v-slot:body-cell-cantidad="props">
                      <q-td :props="props" class="text-right">
                        {{ decimas(props.row.cantidad) }}
                      </q-td>
                    </template>
                    <template v-slot:body-cell-precio_unitario="props">
                      <q-td :props="props" class="text-right">
                        {{ decimas(props.row.precio_unitario) }}
                      </q-td>
                    </template>
                    <template v-slot:body-cell-total="props">
                      <q-td :props="props" class="text-right">
                        {{ decimas(props.row.total) }}
                      </q-td>
                    </template>
                  </q-table>

                  <div class="row q-mt-md" v-if="pdfModalTitle !== 'REPORTE'">
                    <div class="col-6">
                      <div class="text-subtitle1">
                        Son:
                        {{ numeroALetras(comprobanteMontoTotal, comprobanteData.divisa) }}
                      </div>
                    </div>
                    <div class="col-6 text-right">
                      <div class="text-subtitle1">
                        <span class="text-bold">SUBTOTAL:</span>
                        {{ decimas(comprobanteSubtotal) }}
                      </div>
                      <div class="text-subtitle1">
                        <span class="text-bold">DESCUENTO:</span>
                        {{ decimas(comprobanteData.descuento) }}
                      </div>
                      <div class="text-h6 text-bold">
                        <span class="text-bold">MONTO TOTAL:</span>
                        {{ comprobanteMontoTotal }}
                      </div>
                    </div>
                  </div>

                  <div class="row q-mt-md" v-else>
                    <div class="col-12 text-right">
                      <div class="text-subtitle1 text-bold">
                        <span class="text-bold">TOTAL SUMATORIAS:</span>
                        {{ decimas(totalSumatorias) }}
                      </div>
                      <div class="text-subtitle1 text-bold">
                        <span class="text-bold">DESCUENTO:</span>
                        {{ decimas(totalDescuento) }}
                      </div>
                      <div class="text-h6 text-bold">
                        <span class="text-bold">MONTO:</span>
                        {{ decimas(totalMonto) }}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="secondary" v-close-popup />
          <q-btn label="Descargar en PDF" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
