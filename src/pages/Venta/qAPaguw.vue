<template>
  <q-btn icon="help_outline" color="blue" flat @click="iniciarGuia" />

  <q-page class="grid-container">
    <div class="box green">
      <q-card v-if="venta" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/VENTAS.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Venta</q-item-label>
            <q-item-label caption>{{ venta.titulo || 'Ventas' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>
          <q-item-section id="venta-card">
            <q-btn
              flat
              style="color: black"
              label="Ir"
              @click="cambiarComponente(VentaComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box yellow">
      <q-card v-if="compra" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/PEDIDOS.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Compras</q-item-label>
            <q-item-label caption>{{ compra.titulo || 'Compras' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section id="compra-card">
            <q-btn
              flat
              style="color: black"
              label="Ir"
              @click="cambiarComponente(PedidoComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box coffee">
      <q-card v-if="compra" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/PEDIDOS.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Productos</q-item-label>
            <q-item-label caption>{{ producto.titulo || 'Compras' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section id="producto-card">
            <q-btn
              flat
              style="color: black"
              label="Ir"
              @click="cambiarComponente(CrearProductos)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box red">
      <q-card v-if="dashboard" flat bordered class="col">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="../assets/REPORTES.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Reportes</q-item-label>
            <q-item-label caption>{{ dashboard.titulo || 'Reportes' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section id="reportes-card">
            <q-btn
              flat
              style="color: black"
              label="ir"
              @click="cambiarComponente(ReporteComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box blue" id="venta">
      <component :is="componenteActivo" />
    </div>
    <div class="box purple" id="reportes-hoy">
      <ReporteVentaInicio class="q-pa-md fit" />
    </div>
  </q-page>
</template>

<script setup>
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const driverObj = driver()

const iniciarGuia = () => {
  driverObj.setSteps([])
  driverObj.drive()
}
</script>
