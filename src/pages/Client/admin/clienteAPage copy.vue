<template>
  <q-page class="q-pa-md">
    <!-- Primary Interface -->
    <div v-if="!showSecondaryInterface">
      <q-card>
        <q-card-section>
          <div class="row">
            <!-- Form Section -->
            <div class="col-12">
              <q-form @submit="registerClient" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <!-- Hidden Fields -->
                  <div class="col-md-12" style="display: none">
                    <q-input v-model="formData.ver" type="hidden" />
                    <q-input v-model="formData.idempresa" type="hidden" />
                  </div>

                  <!-- Visible Fields -->
                  <div class="col-md-3">
                    <q-input v-model="formData.nombre" label="Razón Social*" outlined required />
                  </div>

                  <div class="col-md-3">
                    <q-input
                      v-model="formData.nombrecomercial"
                      label="Nombre Comercial*"
                      outlined
                      required
                    />
                  </div>

                  <div class="col-md-3">
                    <q-select
                      v-model="formData.tipocliente"
                      :options="clientTypes"
                      label="Tipo de Cliente*"
                      outlined
                      required
                    />
                  </div>

                  <div class="col-md-3">
                    <q-select
                      v-model="formData.canalventa"
                      :options="salesChannels"
                      label="Canal de venta*"
                      outlined
                      required
                    />
                  </div>

                  <div class="col-md-3">
                    <q-select
                      v-model="formData.tipodocumento"
                      :options="documentTypes"
                      label="Tipo de Documento*"
                      outlined
                      required
                    />
                  </div>

                  <div class="col-md-3">
                    <q-input
                      v-model="formData.nrodocumento"
                      label="Nro De Documento*"
                      outlined
                      required
                    />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.email" label="Email" type="email" outlined />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.direccion" label="Dirección" outlined />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.telefono" label="Telefono" outlined />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.movil" label="Movil*" outlined required />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.pais" label="Pais*" outlined required />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.ciudad" label="Ciudad*" outlined required />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.zona" label="Zona" outlined />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.web" label="Pagina Web" outlined />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.contacto" label="Contacto" outlined />
                  </div>

                  <div class="col-md-3">
                    <q-input v-model="formData.detalle" label="Detalle" outlined />
                  </div>

                  <div class="col-12 text-center">
                    <q-btn type="submit" color="primary" label="Registrar" />
                  </div>
                </div>
              </q-form>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Filters and Table -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col-auto">
              <q-btn color="primary" label="Cancelar Registro" @click="toggleForm" />
              <q-btn color="primary" icon="file_excel" label="Importar de Excel" class="q-ml-md" />
            </div>

            <div class="col">
              <div class="row q-col-gutter-sm">
                <div class="col-md-3">
                  <q-select
                    v-model="filters.tipocliente"
                    :options="clientTypesWithAll"
                    label="Todos (Tipo Cliente)"
                    outlined
                  />
                </div>

                <div class="col-md-3">
                  <q-select
                    v-model="filters.canalventa"
                    :options="salesChannelsWithAll"
                    label="Todos (Canal Venta)"
                    outlined
                  />
                </div>

                <div class="col-md-3">
                  <q-select
                    v-model="filters.tipodocumento"
                    :options="documentTypesWithAll"
                    label="Todos (Tipo Doc.)"
                    outlined
                  />
                </div>

                <div class="col-md-3">
                  <q-btn color="info" label="Exportar a Excel" />
                </div>
              </div>
            </div>

            <div class="col-auto">
              <q-input v-model="search" placeholder="Buscar" outlined dense>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Clients Table -->
          <q-table
            :rows="filteredClients"
            :columns="columns"
            row-key="id"
            :filter="search"
            v-model:pagination="pagination"
            class="sticky-header-table"
            style="max-height: 500px"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props" class="text-nowrap">
                <q-btn icon="edit" color="primary" dense flat @click="editClient(props.row)" />
                <q-btn icon="delete" color="negative" dense flat @click="deleteClient(props.row)" />
                <q-btn
                  icon="bookmark_add"
                  color="primary"
                  dense
                  flat
                  @click="showBranches(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Secondary Interface (Branches) -->
    <div v-else>
      <q-card>
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col-auto">
              <q-btn
                color="primary"
                icon="arrow_back"
                label="Volver"
                @click="showSecondaryInterface = false"
              />
            </div>
            <div class="col text-center">
              <h4>Sucursales</h4>
            </div>
          </div>

          <!-- Branch Form -->
          <q-form @submit="addBranch" class="q-gutter-md q-mb-md">
            <div class="row q-col-gutter-md">
              <div class="col-md-12" style="display: none">
                <q-input v-model="branchForm.ver" type="hidden" />
                <q-input v-model="branchForm.idcliente" type="hidden" />
              </div>

              <div class="col-md-4">
                <q-input v-model="branchForm.nombre" label="Nombre*" outlined required />
              </div>

              <div class="col-md-2">
                <q-input v-model="branchForm.telefono" label="Telefono" outlined />
              </div>

              <div class="col-md-4">
                <q-input v-model="branchForm.direccion" label="Dirección" outlined />
              </div>

              <div class="col-md-2 flex items-center">
                <q-btn type="submit" color="primary" label="Añadir" />
              </div>
            </div>
          </q-form>

          <!-- Branches Table -->
          <q-table
            :rows="branches"
            :columns="branchColumns"
            row-key="id"
            v-model:pagination="branchPagination"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props" class="text-nowrap">
                <q-btn icon="edit" color="primary" dense flat @click="editBranch(props.row)" />
                <q-btn icon="delete" color="negative" dense flat @click="deleteBranch(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style>
.sticky-header-table thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
}
</style>
<script setup></script>
