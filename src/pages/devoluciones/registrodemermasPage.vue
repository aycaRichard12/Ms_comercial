<template>
  <q-page>
    <!-- Formulario Principal -->
    <div>
      <q-card-section>
        <!-- Filtros -->
        <div class="row">
          <q-btn
            color="primary"
            :label="collapseVisible ? 'Cancelar Registro' : 'Nuevo Registro'"
            @click="toggleCollapse"
          />
        </div>
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 col-md-3">
            <label for="almacen">Seleccione un Almacén</label>
            <q-select
              v-model="selectedWarehouse"
              :options="almacenOptions"
              id="almacen"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-6 col-md-4 flex justify-start">
            <q-btn
              color="info"
              @click="generatePDF"
              :disable="!tableData.length"
              class="btn-res q-mt-lg"
            >
              <q-icon name="picture_as_pdf" class="icono" />
              <span class="texto">Vista Previa PDF</span>
            </q-btn>
            <q-btn color="primary" class="btn-res q-mt-lg q-ml-md" @click="showReportForm">
              <q-icon name="assignment" class="icono" />
              <span class="texto">Reporte</span>
            </q-btn>
          </div>
          <div class="col-6 col-md-5 flex justify-end">
            <div>
              <label for="buscar">Buscar...</label>
              <q-input v-model="filter" dense debounce="300" placeholder="Buscar" class="q-mr-sm">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Tabla de Mermas -->
        <q-table
          title="Registro de Mermas"
          :rows="filteredTableData"
          :columns="columns"
          row-key="id"
          :filter="filter"
          :loading="loading"
          :pagination="pagination"
          dense
        >
          <template v-slot:top-right> </template>
          <template v-slot:body-cell-autorizacion="props">
            <q-td :props="props">
              <q-badge
                color="green"
                v-if="Number(props.row.autorizacion) === 1"
                label="Autorizado"
                outline
              />
              <q-badge color="red" v-else label="No Autorizado" outline />
            </q-td>
          </template>
          <template v-slot:body-cell-detalle="props">
            <q-td :props="props">
              <q-btn
                dense
                color="primary"
                icon="list"
                label="Productos"
                size="10px"
                @click="showDetails(props.row.id, props.row.idalmacen, props.row.autorizacion)"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                v-if="Number(props.row.autorizacion) === 2 && editar"
                dense
                color="primary"
                icon="edit"
                class="q-mr-xs"
                @click="editItem(props.row.id)"
              />
              <q-btn
                v-if="Number(props.row.autorizacion) === 2 && eliminar"
                dense
                color="negative"
                icon="delete"
                class="q-mr-xs"
                @click="deleteItem(props.row.id)"
              />

              <q-btn
                v-if="Number(props.row.autorizacion) === 1"
                dense
                color="info"
                icon="picture_as_pdf"
                @click="showComprobante(props.row)"
              />
              <q-btn
                v-if="Number(props.row.autorizacion) === 2 && editar"
                :icon="Number(props.row.autorizacion) === 1 ? 'toggle_on' : 'toggle_off'"
                dense
                flat
                :color="Number(props.row.autorizacion) === 1 ? 'green' : 'grey'"
                @click="togglestatus(props.row)"
              />
            </q-td>
          </template>
        </q-table>
        <q-dialog v-model="collapseVisible" persistent>
          <q-card class="responsive-dialog">
            <q-card-section class="bg-primary text-h6 text-white flex justify-between">
              <div>{{ editMode ? 'Editar Registro' : 'Nuevo Registro' }}</div>
              <q-btn icon="close" @click="collapseVisible = false" flat dense round />
            </q-card-section>
            <q-card-section>
              <q-form @submit="submitForm" class="row q-col-gutter-x-md">
                <input type="hidden" name="id" v-model="formData.id" />
                <input
                  type="hidden"
                  name="ver"
                  :value="editMode ? 'editarmerma' : 'registrarmerma'"
                />
                <div class="col-12 col-md-4">
                  <label for="fecha">Fecha</label>
                  <q-input
                    v-model="formData.fecha"
                    id="fecha"
                    name="fecha"
                    type="date"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-4">
                  <label for="almacen">Almacén</label>

                  <q-select
                    v-model="formData.almacen"
                    :options="almacenOptions"
                    dense
                    outlined
                    id="almacen"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-4">
                  <label for="descripcion">Descripción</label>
                  <q-input v-model="formData.descripcion" dense outlined id="descripcion" />
                </div>

                <div class="q-mt-md">
                  <q-btn
                    type="submit"
                    color="primary"
                    :label="editMode ? 'Actualizar' : 'Guardar'"
                  />
                  <q-btn
                    type="reset"
                    color="negative"
                    label="Cancelar"
                    class="q-ml-sm"
                    @click="resetForm"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Formulario Colapsable -->
      </q-card-section>
    </div>

    <!-- Formulario de Detalle -->

    <q-dialog v-model="showMainForm">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Detalle Mermas</div>
          <q-btn dense round flat icon="close" @click="showMainForm = false" />
        </q-card-section>
        <q-card-section v-if="Number(currentDetailStatus) === 2 && eliminar">
          <q-btn color="negative" icon="delete_sweep" label="Eliminar" @click="backToMainForm" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitDetailForm" v-if="Number(currentDetailStatus) === 2 && escritura">
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-6">
                <label for="producto">Producto</label>

                <q-select
                  v-model="detailForm.idproductoalmacen"
                  :options="availableProducts"
                  dense
                  outlined
                  id="producto"
                  option-value="idproductoalmacen"
                  option-label="label"
                  emit-value
                  map-options
                  use-input
                  clearable
                  @update:model-value="selectProduct"
                  @filter="filtrarProductos"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay productos disponibles
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-6 col-md-2">
                <label for="stock">Stock</label>
                <q-input
                  v-model.number="detailForm.stock"
                  type="number"
                  id="stock"
                  dense
                  outlined
                  readonly
                />
              </div>
              <div class="col-6 col-md-2">
                <label for="cantidad">Cantidad</label>
                <q-input
                  v-model.number="detailForm.cantidad"
                  id="cantidad"
                  type="number"
                  min="0"
                  dense
                  outlined
                  required
                  @update:model-value="validateQuantity"
                />
              </div>
              <div class="col-md-2">
                <q-btn type="submit" color="primary" class="btn-res q-mt-lg">
                  <q-icon name="save" class="icono" />
                  <span class="texto">{{ detailEditMode ? 'Actualizar' : 'Agregar' }}</span>
                </q-btn>
              </div>
            </div>
          </q-form>
          <q-table
            :rows="detailData"
            :columns="detailColumns"
            row-key="id"
            class="q-mt-md"
            :loading="detailLoading"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  v-if="Number(currentDetailStatus) === 2 && editar"
                  dense
                  color="primary"
                  icon="edit"
                  class="q-mr-xs"
                  @click="editDetailItem(props.row.id)"
                />
                <q-btn
                  v-if="Number(currentDetailStatus) === 2 && eliminar"
                  dense
                  color="negative"
                  icon="delete"
                  @click="deleteDetailItem(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de PDF -->
    <q-dialog v-model="mostrarModal" persistent full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
// import { useMenuStore } from 'src/layouts/permitidos'
import { useMenuStore } from 'src/stores/permitidos'
import {
  cambiarFormatoFecha,
  obtenerFechaActualDato,
  obtenerPermisosPagina,
} from 'src/composables/FuncionesG'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { PDFreporteMermas } from 'src/utils/pdfReportGenerator'
import { PDFComprovanteMerma } from 'src/utils/pdfReportGenerator'
const [lectura, escritura, editar, eliminar] = obtenerPermisosPagina()
console.log(lectura, escritura, editar, eliminar)
const pdfData = ref(null)
const mostrarModal = ref(false)
const warehouses = useAlmacenStore()
const productosDisponibles = ref([])
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()
const menuStore = useMenuStore()
const permisosMap = menuStore.obtenerMenuPrincipal
console.log(permisosMap['registrarventa-eb160de1de89d9058fcb0b968dbbbd68']) // "1111"

// Estado del componente78
const showMainForm = ref(false)
const collapseVisible = ref(false)
const editMode = ref(false)
const detailEditMode = ref(false)
const loading = ref(false)
const detailLoading = ref(false)
const idmd5 = ref('')

// Datos del usuario
const userData = ref({})

// Datos de formularios
const formData = ref({
  id: '',
  fecha: obtenerFechaActualDato(),
  almacen: '',
  descripcion: '',
})

const detailForm = ref({
  id: '',
  idmerma: '',
  idproductoalmacen: '',
  cantidad: 0,
  stock: 0,
  idalmacen: 0,
})

// Datos de tablas
const tableData = ref([])
const detailData = ref([])
const comprobanteDetails = ref([])
const currentDetailStatus = ref(0)
const currentComprobante = ref({})

// Filtros y selecciones
const filter = ref('')
const selectedWarehouse = ref('')
const availableProducts = ref([])

// Configuración de tablas
const columns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => tableData.value.indexOf(row) + 1,
    align: 'right',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row) => cambiarFormatoFecha(row.fecha),
    align: 'center',
  },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  {
    name: 'autorizacion',
    label: 'Estado',
    field: 'autorizacion',
    align: 'left',
  },
  {
    name: 'detalle',
    label: 'Detalle',
    field: 'detalle',
    align: 'center',
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const detailColumns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => detailData.value.indexOf(row) + 1,
    align: 'right',
  },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const pagination = ref({
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 10,
})

// Computed properties
const filteredTableData = computed(() => {
  if (!selectedWarehouse.value) return tableData.value
  console.log(selectedWarehouse.value)
  const almacen = selectedWarehouse.value
  console.log(almacen)
  if (almacen) {
    if (almacen.value == 0) {
      console.log(almacen)
      return tableData.value.filter((camp) => camp.idalmacen == 0)
    } else {
      return tableData.value.filter((camp) => camp.idalmacen == almacen)
    }
  } else {
    return []
  }
})

// Métodos
const loadUserData = async () => {
  try {
    const response = await api.get('userData')
    userData.value = response.data
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos del usuario',
    })
  }
}

// const loadWarehouses = async () => {
//   try {
//     const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
//     warehouses.value = response.data.map((warehouse) => ({
//       value: warehouse.idalmacen,
//       label: warehouse.almacen,
//     }))
//   } catch (error) {
//     console.error('Error al cargar almacenes:', error)
//     $q.notify({
//       type: 'negative',
//       message: 'Error al cargar almacenes',
//     })
//   }
// }
const almacenOptions = computed(() => {
  const options = [{ label: 'Todos los almacenes', value: 0 }]
  warehouses.almacenes.forEach((almacen) => {
    options.push({ label: almacen.almacen, value: Number(almacen.idalmacen) })
  })
  return options
})

watch(
  almacenOptions,
  (nuevasOpciones) => {
    console.log(nuevasOpciones)
    if (nuevasOpciones.length > 0 && !selectedWarehouse.value) {
      selectedWarehouse.value = nuevasOpciones[0]
    }
  },
  { immediate: true },
)
const loadTableData = async () => {
  loading.value = true
  try {
    const response = await api.get(`listamerma/${idempresa}`)
    tableData.value = response.data
    console.log(response.data)
  } catch (error) {
    console.error('Error al cargar datos de mermas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos de mermas',
    })
  } finally {
    loading.value = false
  }
}

const loadDetailData = async (idMerma) => {
  detailLoading.value = true
  try {
    const response = await api.get(`listaDetallemerma/${idMerma}`)
    detailData.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de merma:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalles de merma',
    })
  } finally {
    detailLoading.value = false
  }
}

const loadAvailableProducts = async (idMerma, idAlmacen) => {
  try {
    const response = await api.get(`ListaProductosmerma/${idMerma}/${idAlmacen}`)
    availableProducts.value = response.data.map((product) => ({
      idproductoalmacen: Number(product.idproductoalmacen),
      label: `${product.codigo} - ${product.descripcion}`,
      stock: product.stock,
    }))

    productosDisponibles.value = [...availableProducts.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar productos disponibles',
    })
  }
}
const filtrarProductos = (val, update) => {
  update(() => {
    if (val === '') {
      availableProducts.value = productosDisponibles.value
    } else {
      const needle = val.toLowerCase()
      availableProducts.value = availableProducts.value.filter(
        (p) => p.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}
const toggleCollapse = () => {
  collapseVisible.value = !collapseVisible.value

  resetForm()
}

const resetForm = () => {
  formData.value = {
    id: '',
    fecha: obtenerFechaActualDato(),
    almacen: '',
    descripcion: '',
  }
  editMode.value = false
}

const resetDetailForm = () => {
  detailForm.value = {
    id: '',
    idmerma: '',
    idproductoalmacen: '',
    cantidad: 0,
    stock: 0,
    idalmacen: 0,
  }
  detailEditMode.value = false
}

const submitForm = async () => {
  try {
    //const endpoint = editMode.value ? 'actualizarmerma' : 'registrarmerma'

    const formulario = objectToFormData(formData.value)
    if (editMode.value) {
      formulario.append('ver', 'actualizarmerma')
    } else {
      formulario.append('ver', 'registrarmerma')
      formulario.append('idusuario', idusuario)
    }
    for (let [v, k] of formulario.entries()) {
      console.log(`${v}:${k}`)
    }
    const response = await api.post('', formulario)
    console.log(response.data)
    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })

    selectedWarehouse.value = response.data.almacenorigen
    loadTableData()
    resetForm()
    collapseVisible.value = false
  } catch (error) {
    console.error('Error al guardar merma:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al guardar merma',
    })
  }
}

const submitDetailForm = async () => {
  try {
    //const endpoint = detailEditMode.value ? 'actualizarDetallemerma' : 'registrarDetallemerma'
    const formulario = objectToFormData(detailForm.value)

    if (detailEditMode.value) {
      formulario.append('ver', 'editarDetallemerma')
    } else {
      formulario.append('ver', 'registrarDetallemerma')
    }
    for (let [v, k] of formulario.entries()) {
      console.log(`${v}:${k}`)
    }
    const response = await api.post('', formulario)
    console.log(response.data)

    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })
    console.log(detailForm.value.idmerma, detailForm.value.idalmacen)

    loadAvailableProducts(detailForm.value.idmerma, detailForm.value.idalmacen)
    loadDetailData(detailForm.value.idmerma)
    resetDetailForm()
  } catch (error) {
    console.error('Error al guardar detalle:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al guardar detalle',
    })
  }
}

const editItem = async (id) => {
  try {
    const response = await api.get(`verificarExistenciamerma/${id}`)
    console.log(response.data)

    if (response.data.estado === 'exito') {
      formData.value = {
        id: response.data.datos.id,
        fecha: response.data.datos.fecha,
        almacen: Number(response.data.datos.idalmacen),
        descripcion: response.data.datos.descripcion,
      }
      console.log(formData.value)
      editMode.value = true
      if (!collapseVisible.value) {
        collapseVisible.value = true
      }
    }
  } catch (error) {
    console.error('Error al cargar merma para editar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar merma para editar',
    })
  }
}

const deleteItem = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro que desea eliminar este registro? No podrá recuperarlo.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarmerma/${id}`)

      $q.notify({
        type: 'positive',
        message: response.data.mensaje,
      })

      loadTableData()
    } catch (error) {
      console.error('Error al eliminar merma:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al eliminar merma',
      })
    }
  })
}

// const changeStatus = (id, estado) => {
//   $q.dialog({
//     title: 'Confirmar',
//     message: '¿Está seguro que desea cambiar el estado? No podrá revertir esta acción.',
//     cancel: true,
//     persistent: true,
//   }).onOk(async () => {
//     try {
//       const response = await api.get(`actualizarEstadomerma/${id}/${estado}`)

//       $q.notify({
//         type: 'positive',
//         message: response.data.mensaje,
//       })

//       loadTableData()
//     } catch (error) {
//       console.error('Error al cambiar estado:', error)
//       $q.notify({
//         type: 'negative',
//         message: error.response?.data?.mensaje || 'Error al cambiar estado',
//       })
//     }
//   })
// }

const showDetails = (id, idAlmacen, estado) => {
  currentDetailStatus.value = estado
  console.log(id, idAlmacen, estado)
  detailForm.value.idmerma = id
  detailForm.value.idalmacen = idAlmacen

  if (estado === 1) {
    // Deshabilitar botones si está autorizado
  }

  loadDetailData(id)
  loadAvailableProducts(id, idAlmacen)
  showMainForm.value = true
}

const backToMainForm = () => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro? Esta acción eliminará todos los productos añadidos en la merma.',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        const response = await api.get(`cancelarMerma/${detailForm.value.idmerma}`)

        if (response.data.estado !== 101) {
          $q.notify({
            type: 'info',
            message: response.data.mensaje,
          })
        }

        showMainForm.value = false
        resetDetailForm()
        detailData.value = []
      } catch (error) {
        console.error('Error al cancelar merma:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cancelar merma',
        })
      }
    })
    .onCancel(() => {
      // El usuario canceló la acción
    })
}

const selectProduct = (id) => {
  const product = availableProducts.value.find((p) => p.idproductoalmacen == id)
  if (product) {
    detailForm.value.stock = product.stock
  }
}

const validateQuantity = () => {
  if (detailForm.value.cantidad > detailForm.value.stock) {
    $q.notify({
      type: 'warning',
      message: 'La cantidad ingresada sobrepasa al stock actual',
    })
    detailForm.value.cantidad = 0
  }
}

const editDetailItem = async (id) => {
  try {
    const response = await api.get(`verificarExistenciaDetalleMerma/${id}`)

    if (response.data.estado === 'exito') {
      detailForm.value = {
        id: response.data.datos.id,
        idmerma: detailForm.value.idmerma,
        idproductoalmacen: {
          idproductoalmacen: response.data.datos.idproductoalmacen,
          label: `${response.data.datos.codigo} - ${response.data.datos.descripcion}`,
        },
        cantidad: response.data.datos.cantidad,
        stock: response.data.datos.stock,
      }

      // Buscar el producto seleccionado para mostrarlo en el select

      //  idproductoalmacen: Number(product.idproductoalmacen),
      // label: `${product.codigo} - ${product.descripcion}`,
      // stock: product.stock,
      const product = availableProducts.value.find(
        (p) => p.idproductoalmacen == response.data.datos.idproductoalmacen,
      )

      if (product) {
        detailForm.value.productLabel = product.label
      }

      detailEditMode.value = true
    }
  } catch (error) {
    console.error('Error al cargar detalle para editar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalle para editar',
    })
  }
}

const deleteDetailItem = async (id) => {
  try {
    const response = await api.get(`eliminarDetallemerma/${id}`)

    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })

    loadAvailableProducts(detailForm.value.idmerma, userData.value.almacen.idalmacen)
    loadDetailData(detailForm.value.idmerma)
  } catch (error) {
    console.error('Error al eliminar detalle:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al eliminar detalle',
    })
  }
}

const generatePDF = () => {
  console.log(filteredTableData.value)
  // const doc = PDFreporteMermas(filteredTableData)
  // console.log(doc)
  const doc = PDFreporteMermas(filteredTableData)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

const showComprobante = async (item) => {
  currentComprobante.value = item
  console.log(item)
  try {
    const response = await api.get(`listaDetallemerma/${item.id}`)
    comprobanteDetails.value = response.data
    console.log(response.data)
    const doc = PDFComprovanteMerma(response.data)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } catch (error) {
    console.error('Error al cargar comprobante:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar comprobante',
    })
  }
}

const showReportForm = () => {
  // Implementar lógica para mostrar formulario de reporte
  // Similar a la función boton_reporte() en el código original
}

const togglestatus = (row) => {
  console.log(row)

  $q.dialog({
    title: 'Confirmar',
    message: '¿Esta Seguro? No podra revertir esta acción',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const point = `actualizarEstadomerma/${row.id}/1`
      const response = await api.get(point) // Cambia a tu ruta real
      console.log(response.data)
      if (response.data[0] === 'success') {
        await loadTableData()

        $q.notify({
          type: 'positive',
          message: response.data[1],
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.data[1],
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}
function handleKeydown(e) {
  if (e.key === 'Escape') {
    collapseVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// Inicialización
onMounted(async () => {
  await loadUserData()
  await loadTableData()

  // Establecer fecha actual por defecto

  const storedMd5 = idusuario_md5()
  if (storedMd5) {
    idmd5.value = storedMd5
    warehouses.listaAlmacenes()
  } else {
    $q.notify({
      type: 'negative',
      message: 'ID MD5 no encontrado. Asegúrate de iniciar sesión correctamente.',
      timeout: 5000,
    })
  }
})
</script>

<style scoped>
/* Estilos personalizados pueden ir aquí */
.resaltar-fila {
  background-color: #ffeb3b;
  transition: background-color 1.5s;
}

.table-topper {
  margin-bottom: 20px;
}
</style>
