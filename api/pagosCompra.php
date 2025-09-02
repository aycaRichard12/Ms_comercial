<?php

class PagosCompra
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

    // =================================================================
    // ==                  SECCIÓN DE GESTIÓN DE PAGOS                  ==
    // =================================================================
    public function registrarCompraCredito($data){
        echo $this->crearPago($data['compra_id'],$data['monto_total'],$data['nro_cuotas'],$data['fecha_inicio'],$data['pago_cada_ciertos_dias']);
    }
    /**
     * Crea un nuevo registro de pago a crédito y genera sus cuotas.
     */
    public function crearPago($compra_id, $monto_total, $nro_cuotas, $fecha_inicio, $pago_cada_ciertos_dias)
    {
        // Validación básica
        if (empty($compra_id) || !is_numeric($monto_total) || !is_numeric($nro_cuotas) || empty($fecha_inicio) || !is_numeric($pago_cada_ciertos_dias)) {
            return json_encode(["estado" => "error", "mensaje" => "Todos los campos son obligatorios y deben tener el formato correcto."]);
        }
        
        $fecha_fin_estimada = date('Y-m-d', strtotime($fecha_inicio . ' + ' . (($nro_cuotas -1) * $pago_cada_ciertos_dias) . ' days'));
        $estado = 1; // 1: Activo, 0: Cancelado, 2: Finalizado
        
        $sql = "INSERT INTO pagos (compra_id, monto_total, saldo_actual, nro_cuotas, fecha_inicio, pago_cada_ciertos_dias, fecha_fin_estimada, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $this->cm->begin_transaction();

            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta de pago: " . $this->cm->error);
            }

            $stmt->bind_param("iddsisss", $compra_id, $monto_total, $monto_total, $nro_cuotas, $fecha_inicio, $pago_cada_ciertos_dias, $fecha_fin_estimada, $estado);

            if ($stmt->execute()) {
                $id_pago = $this->cm->insert_id;
                // Generar las cuotas asociadas a este pago
                $this->generarCuotas($id_pago, $nro_cuotas, $monto_total, $fecha_inicio, $pago_cada_ciertos_dias);
                $this->cm->commit();
                return json_encode(["estado" => "exito", "mensaje" => "Pago creado y cuotas generadas correctamente.", "id_pago" => $id_pago]);
            } else {
                throw new Exception("No se pudo registrar el pago.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            // $this->logger->log($e->getMessage()); // Opcional: registrar el error
            return json_encode(["estado" => "error", "mensaje" => "Error al crear el pago: " . $e->getMessage()]);
        }
    }

    /**
     * Edita los datos de un pago existente.
     */
    public function editarPago($id_pago, $data)
    {
        // Construcción dinámica de la consulta
        $fields = [];
        $params = [];
        $types = "";

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $params[] = $value;
            // Asume tipos de datos (mejora según tu lógica)
            $types .= is_int($value) ? 'i' : (is_float($value) ? 'd' : 's');
        }
        $params[] = $id_pago;
        $types .= 'i';

        $sql = "UPDATE pagos SET " . implode(", ", $fields) . " WHERE id_pago = ?";

        try {
            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta de edición: " . $this->cm->error);
            }
            
            $stmt->bind_param($types, ...$params);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    return json_encode(["estado" => "exito", "mensaje" => "Pago actualizado correctamente."]);
                }
                return json_encode(["estado" => "info", "mensaje" => "No se realizaron cambios."]);
            } else {
                throw new Exception("No se pudo actualizar el pago.");
            }
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => "Error al actualizar el pago: " . $e->getMessage()]);
        }
    }

    /**
     * Elimina un pago y sus cuotas y transacciones asociadas (eliminado lógico).
     */
    public function eliminarPago($id_pago)
    {
        $sql = "UPDATE pagos SET estado = 0 WHERE id_pago = ?"; // 0: Anulado/Cancelado
        
        try {
            $this->cm->begin_transaction();
            
            // Inactivar el pago principal
            $stmtPago = $this->cm->prepare($sql);
            $stmtPago->bind_param("i", $id_pago);
            $stmtPago->execute();

            // Inactivar cuotas asociadas
            $stmtCuotas = $this->cm->prepare("UPDATE cuotas SET estado = 0 WHERE pago_id = ?");
            $stmtCuotas->bind_param("i", $id_pago);
            $stmtCuotas->execute();

            $this->cm->commit();
            return json_encode(["estado" => "exito", "mensaje" => "Pago y sus cuotas han sido anulados."]);

        } catch (Exception $e) {
            $this->cm->rollback();
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => "Error al anular el pago: " . $e->getMessage()]);
        }
    }

    /**
     * Obtiene una lista de todos los pagos.
     */
    public function obtenerPagos()
    {
        $sql = "SELECT * FROM pagos ORDER BY fecha_inicio DESC";
        try {
            $result = $this->cm->query($sql);
            if ($result) {
                return json_encode($result->fetch_all(MYSQLI_ASSOC));
            }
            return json_encode([]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    
    /**
     * Obtiene un pago específico por su ID.
     */
    public function obtenerPagoPorId($id_pago)
    {
        $sql = "SELECT * FROM pagos WHERE id_pago = ?";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_pago);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                return json_encode($result->fetch_assoc());
            }
            return json_encode(["estado" => "info", "mensaje" => "Pago no encontrado."]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    // =================================================================
    // ==                  SECCIÓN DE GESTIÓN DE CUOTAS                 ==
    // =================================================================

    /**
     * Genera las cuotas para un pago recién creado.
     */
    public function generarCuotas($id_pago, $nro_cuotas, $monto_total, $fecha_inicio, $pago_cada_ciertos_dias)
    {
        $monto_cuota = round($monto_total / $nro_cuotas, 2);
        // Ajuste para la última cuota por si hay decimales
        $monto_ultima_cuota = $monto_total - ($monto_cuota * ($nro_cuotas - 1));

        $sql = "INSERT INTO cuotas (pago_id, nro_cuota, monto_cuota, fecha_vencimiento, estado) VALUES (?, ?, ?, ?, ?)";
        
        try {
            $stmt = $this->cm->prepare($sql);
            $fecha_vencimiento = $fecha_inicio;
            $estado = 1; // 1: Pendiente, 2: Pagada, 0: Anulada

            for ($i = 1; $i <= $nro_cuotas; $i++) {
                $monto_a_insertar = ($i == $nro_cuotas) ? $monto_ultima_cuota : $monto_cuota;
                
                if($i > 1) {
                    $fecha_vencimiento = date('Y-m-d', strtotime($fecha_vencimiento . " + $pago_cada_ciertos_dias days"));
                }
                
                $stmt->bind_param("iidss", $id_pago, $i, $monto_a_insertar, $fecha_vencimiento, $estado);
                $stmt->execute();
            }
            return true;
        } catch (Exception $e) {
            // Si falla, la transacción principal en `crearPago` hará rollback
            throw new Exception("Error al generar las cuotas: " . $e->getMessage());
        }
    }

    /**
     * Registra el pago de una cuota y actualiza los saldos.
     */
    public function registrarPagoCuota($id_cuota, $monto_pagado, $referencia, $usuario_id, $observaciones, $comprobante_path = null)
    {
        try {
            $this->cm->begin_transaction();

            // 1. Obtener datos de la cuota
            $cuota_info = $this->cm->query("SELECT * FROM cuotas WHERE id_cuota = $id_cuota")->fetch_assoc();
            if (!$cuota_info) {
                throw new Exception("La cuota no existe.");
            }

            $id_pago = $cuota_info['pago_id'];
            $monto_cuota_actual = $cuota_info['monto_cuota'];
            $monto_ya_pagado = $cuota_info['monto_pagado'];
            $saldo_cuota = $monto_cuota_actual - $monto_ya_pagado;
            
            if($monto_pagado > $saldo_cuota) {
                throw new Exception("El monto a pagar excede el saldo de la cuota.");
            }

            // 2. Insertar la transacción
            $this->insertarTransaccion($id_cuota, $monto_pagado, $referencia, $usuario_id, $observaciones, $comprobante_path);
            
            // 3. Actualizar la cuota
            $nuevo_monto_pagado = $monto_ya_pagado + $monto_pagado;
            $nuevo_estado_cuota = ($nuevo_monto_pagado >= $monto_cuota_actual) ? 2 : 1; // 2: Pagada, 1: Pendiente (pago parcial)

            $sql_update_cuota = "UPDATE cuotas SET monto_pagado = ?, fecha_pago = CURDATE(), estado = ? WHERE id_cuota = ?";
            $stmt_cuota = $this->cm->prepare($sql_update_cuota);
            $stmt_cuota->bind_param("dii", $nuevo_monto_pagado, $nuevo_estado_cuota, $id_cuota);
            $stmt_cuota->execute();

            // 4. Actualizar el saldo del pago principal
            $sql_update_pago = "UPDATE pagos SET saldo_actual = saldo_actual - ? WHERE id_pago = ?";
            $stmt_pago = $this->cm->prepare($sql_update_pago);
            $stmt_pago->bind_param("di", $monto_pagado, $id_pago);
            $stmt_pago->execute();
            
            // 5. Verificar si el pago general está completado
            $pago_info = $this->cm->query("SELECT saldo_actual FROM pagos WHERE id_pago = $id_pago")->fetch_assoc();
            if($pago_info['saldo_actual'] <= 0) {
                 $this->cm->query("UPDATE pagos SET estado = 2 WHERE id_pago = $id_pago"); // 2: Finalizado
            }

            $this->cm->commit();
            return json_encode(["estado" => "exito", "mensaje" => "Pago de cuota registrado correctamente."]);

        } catch (Exception $e) {
            $this->cm->rollback();
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => "Error al registrar el pago de la cuota: " . $e->getMessage()]);
        }
    }
    
    /**
     * Obtiene todas las cuotas asociadas a un ID de pago.
     */
    public function obtenerCuotasPorPago($id_pago)
    {
        $sql = "SELECT * FROM cuotas WHERE pago_id = ? ORDER BY nro_cuota ASC";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_pago);
            $stmt->execute();
            $result = $stmt->get_result();
            return json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    
    /**
     * Actualiza el estado de las cuotas vencidas (ej: de Pendiente a Vencida).
     */
    public function actualizarEstadoCuotas()
    {
        // 3: Vencido
        $sql = "UPDATE cuotas SET estado = 3 WHERE fecha_vencimiento < CURDATE() AND estado = 1";
        try {
            $this->cm->query($sql);
            $filas_afectadas = $this->cm->affected_rows;
            return json_encode(["estado" => "exito", "mensaje" => "$filas_afectadas cuotas actualizadas a 'Vencida'."]);
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    // =================================================================
    // ==               SECCIÓN DE GESTIÓN DE TRANSACCIONES             ==
    // =================================================================

    /**
     * Inserta un registro de transacción de pago.
     */
    public function insertarTransaccion($id_cuota, $monto, $referencia, $usuario_id, $observaciones, $comprobante_path = null)
    {
        $sql = "INSERT INTO transacciones_pago (cuota_id, monto, referencia, comprobante_path, estado, usuario_id, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $estado = 1; // 1: Completada, 0: Anulada

        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("idssiis", $id_cuota, $monto, $referencia, $comprobante_path, $estado, $usuario_id, $observaciones);
            
            if (!$stmt->execute()) {
                throw new Exception("No se pudo insertar la transacción: " . $stmt->error);
            }
            return $this->cm->insert_id;
        } catch (Exception $e) {
            throw new Exception("Error en la inserción de transacción: " . $e->getMessage());
        }
    }

    /**
     * Obtiene todas las transacciones de una cuota específica.
     */
    public function obtenerTransaccionesPorCuota($id_cuota)
    {
        $sql = "SELECT * FROM transacciones_pago WHERE cuota_id = ? ORDER BY fecha_pago DESC";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_cuota);
            $stmt->execute();
            $result = $stmt->get_result();
            return json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    /**
     * Obtiene todas las transacciones de un pago general (a través de sus cuotas).
     */
    public function obtenerTransaccionesPorPago($id_pago)
    {
        $sql = "SELECT tp.* FROM transacciones_pago tp
                JOIN cuotas c ON tp.cuota_id = c.id_cuota
                WHERE c.pago_id = ? 
                ORDER BY tp.fecha_pago DESC";
        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_pago);
            $stmt->execute();
            $result = $stmt->get_result();
            return json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }
    
    // =================================================================
    // ==                      SECCIÓN DE REPORTES                    ==
    // =================================================================

    /**
     * Genera un reporte consolidado de pagos, cuotas y transacciones.
     */
    public function generarReportePagos($filtros = [])
    {
        $sql = "SELECT 
                    p.id_pago, p.compra_id, p.monto_total, p.saldo_actual, p.nro_cuotas, p.fecha_inicio, p.fecha_fin_estimada, p.estado AS estado_pago,
                    c.id_cuota, c.nro_cuota, c.monto_cuota, c.fecha_vencimiento, c.fecha_pago, c.monto_pagado, c.estado AS estado_cuota,
                    tp.id_transaccion, tp.fecha_pago AS fecha_transaccion, tp.monto AS monto_transaccion, tp.referencia
                FROM pagos p
                LEFT JOIN cuotas c ON p.id_pago = c.pago_id
                LEFT JOIN transacciones_pago tp ON c.id_cuota = tp.cuota_id";

        // Lógica de filtros (ejemplo)
        $where = [];
        $params = [];
        $types = "";
        if (!empty($filtros['fecha_desde'])) {
            $where[] = "p.fecha_inicio >= ?";
            $params[] = $filtros['fecha_desde'];
            $types .= 's';
        }
        if (!empty($filtros['fecha_hasta'])) {
            $where[] = "p.fecha_inicio <= ?";
            $params[] = $filtros['fecha_hasta'];
            $types .= 's';
        }
        if (isset($filtros['estado_pago'])) {
            $where[] = "p.estado = ?";
            $params[] = $filtros['estado_pago'];
            $types .= 'i';
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY p.id_pago, c.nro_cuota";

        try {
            $stmt = $this->cm->prepare($sql);
            if (!empty($params)) {
                 $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            return json_encode($result->fetch_all(MYSQLI_ASSOC));
        } catch (Exception $e) {
            // $this->logger->log($e->getMessage());
            return json_encode(["estado" => "error", "mensaje" => "Error al generar el reporte: " . $e->getMessage()]);
        }
    }
}