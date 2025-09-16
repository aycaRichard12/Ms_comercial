<?php

class Nota_Debito_Credito
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $conexion;
    private $verificar;
    private $factura;
    private $logger;
    private $venta;
    private $funcionesVenta;
    private $token;
    private $configuracion;
    private $numceros;

    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const MAX_INTENTOS_NRO_FACTURA = 1000;

    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();
        $this->venta = new UseVEnta();
        $this->funcionesVenta = new ventas();
        $this->configuracion = new configuracion();
        $this->numceros = 4;
        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = null; // Simulado
        $this->em = null; // Simulado
    }

    private function obtenerNumeroNotaDisponible($idempresa, $tipoventa)
    {
        $nroFactura = null;
        $contadorIntentos = 0;

        // Bucle para asegurar que el número de factura no exista
        while ($nroFactura === null) {
            // 1. Contar ventas existentes para proponer un número inicial
            $sqlConteo = "SELECT COUNT(v.id_nota_debito_credito) 
                          FROM nota_debito_credito ndc
                          LEFT JOIN venta v ON ndc.id_venta = v.id_venta
                          LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                          WHERE c.idempresa = ? AND v.tipo_venta = ?";
            $stmtConteo = $this->cm->prepare($sqlConteo);
            $stmtConteo->bind_param("is", $idempresa, $tipoventa);
            $stmtConteo->execute();
            $resultado = $stmtConteo->get_result()->fetch_row();
            $nroFactura = $resultado[0] + 1 + $contadorIntentos;
            $stmtConteo->close();

            // 2. Verificar si el número propuesto ya existe
            $sqlVerificacion = "SELECT ndc.numNota 
                                FROM nota_debito_credito ndc
                                LEFT JOIN venta v ON ndc.id_venta = v.id_venta
                                LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                                WHERE c.idempresa = ? AND v.tipo_venta = ? AND ndc.numNota  = ?";
            $stmtVerificacion = $this->cm->prepare($sqlVerificacion);
            $stmtVerificacion->bind_param("isi", $idempresa, $tipoventa, $nroFactura);
            $stmtVerificacion->execute();
            $stmtVerificacion->store_result();

            if ($stmtVerificacion->num_rows > 0) {
                $nroFactura = null; // El número existe, se reinicia para probar el siguiente
                $contadorIntentos++;
            }
            $stmtVerificacion->close();

            // 3. Salvaguarda contra bucles infinitos
            if ($contadorIntentos > self::MAX_INTENTOS_NRO_FACTURA) {
                throw new Exception("No se pudo encontrar un número de nota disponible después de " . self::MAX_INTENTOS_NRO_FACTURA . " intentos.");
            }
        }

        return $nroFactura;
    }

    // =================================================================
    // ==                  SECCIÓN DE GESTIÓN NOTAS                 ==
    // =================================================================
    public function registrarCompraCredito($data){
         echo $this->CrearNota($data['numNota'], $data['id_punto_venta'], $data['id_cliente'], $data['id_leyenda'], $data['id_usuario'], $data['monto_total_devuelto'], $data['monto_descuento_credito_debito'], $data['monto_efectivo_credito_debito'], $data['id_venta'],$data['detalle'],$data['jsonEmizor']);
    }
    /**
     * Crea un nuevo registro de pago a crédito y genera sus cuotas.
     */
    public function CrearNota($numNota, $id_punto_venta, $id_cliente, $id_leyenda, $id_usuario, $monto_total_devuelto, $monto_descuento_credito_debito, $monto_efectivo_credito_debito, $id_venta, $detalle, $jsonEmizor )
    {
        // Validación básica
        if (
            empty($numNota) || empty($id_punto_venta) || empty($id_cliente) || 
            empty($id_leyenda) || empty($id_usuario) || 
            !isset($monto_total_devuelto) || !isset($monto_descuento_credito_debito) || 
            !isset($monto_efectivo_credito_debito) || empty($id_venta)
        ) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Todos los campos son obligatorios y deben tener el formato correcto."
            ]);
        }

        
        $sql = "INSERT INTO nota_debito_credito (numNota, id_punto_venta, id_cliente, id_leyenda, id_usuario, monto_total_devuelto, monto_descuento_credito_debito, monto_efectivo_credito_debito, id_venta) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $this->cm->begin_transaction();

            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta de pago: " . $this->cm->error);
            }

            $stmt->bind_param("iiiiidddi", $numNota, $id_punto_venta, $id_cliente, $id_leyenda, $id_usuario, $monto_total_devuelto, $monto_descuento_credito_debito, $monto_efectivo_credito_debito, $id_venta);

            if ($stmt->execute()) {
                $id_nota = $this->cm->insert_id;
                 //Generar las cuotas asociadas a este pago
                $this->registrarDetalleNota($detalle,$id_nota);
                $this->cm->commit();
                return json_encode(["estado" => "exito", "mensaje" => "Pago creado y cuotas generadas correctamente.", "id_pago" => $id_nota]);
            } else {
                throw new Exception("No se pudo registrar el pago.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            // $this->logger->log($e->getMessage()); // Opcional: registrar el error
            return json_encode(["estado" => "error", "mensaje" => "Error al crear el pago: " . $e->getMessage()]);
        }
    }
    private function registrarDetalleNota($detalle,$id_nota){

        $sql = "INSERT INTO detalle_nota_debito_credito (productos_almacen_id_productos_almacen, cantidad, precio_unitario, sub_total, monto_descuento,id_nota_debito_credito) VALUES (?, ?, ?, ?, ?,?)";
        try {
            $stmt = $this->cm->prepare($sql);
           
            foreach($detalle as $item){
                $stmt->bind_param("iidddi", $item['id_producto'], $item['cantidad'],$item['precio_unitario'],$item['sub_total'],$item['monto_descuento'],$id_nota);
                $stmt->execute();
            }
            return true;
        } catch (Exception $e) {
            // Si falla, la transacción principal en `crearPago` hará rollback
            throw new Exception("Error al generar las cuotas: " . $e->getMessage());
        }
    }

}