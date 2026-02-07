<?php
require_once __DIR__ . "/../db/conexion.php";

class PermisosVentaSinStock
{
    private $cm;
    private $conexion;
    private $verificar;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->cm = $this->conexion->cm;
        $this->verificar = new Funciones();
    }

    /**
     * Crear una solicitud de permiso para vender sin stock
     */
    public function crearSolicitudPermiso($data)
    {
        $idmd5_usuario = $data['idusuario_md5'] ?? null;
        $id_usuario = $this->verificar->verificarIDUSERMD5($idmd5_usuario);
        $id_admin = $data['id_admin'] ?? null;
        $id_almacen = $data['id_almacen'] ?? null;
        $motivo = $data['motivo'] ?? null;

        // Validaciones
        if (!$id_usuario || !$id_almacen || !$motivo) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Faltan datos obligatorios: id_usuario, id_almacen, motivo"
            ]);
        }

        $sql = "INSERT INTO solicitudes_permiso_almacen 
                (id_usuario, id_almacen, motivo, fecha_solicitud, estado, id_admin) 
                VALUES (?, ?, ?, NOW(), 'PENDIENTE', ?)";

        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("iisi", $id_usuario, $id_almacen, $motivo, $id_admin);
            
            if ($stmt->execute()) {
                $id_solicitud = $this->cm->getLastInsertId();
                return json_encode([
                    "estado" => "success",
                    "mensaje" => "Solicitud creada exitosamente",
                    "id_solicitud" => $id_solicitud
                ]);
            } else {
                return json_encode([
                    "estado" => "error",
                    "mensaje" => "Error al crear la solicitud: " . $stmt->error
                ]);
            }
        } catch (Exception $e) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Excepción al crear solicitud: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Aprobar o rechazar una solicitud de permiso
     */
    public function aprobarRechazarSolicitud($data)
    {
        $idmd5_admin = $data['id_admin_md5'] ?? null;

        $id_solicitud = $data['id_solicitud'] ?? null;
        $id_admin = $this->verificar->verificarIDUSERMD5($idmd5_admin);

        $accion = $data['accion'] ?? null; // 'APROBADO' o 'RECHAZADO'
        $observacion_admin = $data['observacion_admin'] ?? '';
        $fecha_inicio = $data['fecha_inicio'] ?? null;
        $fecha_fin = $data['fecha_fin'] ?? null;

        // Validaciones
        if (!$id_solicitud || !$id_admin || !$accion) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Faltan datos: id_solicitud, id_admin, accion"
            ]);
        }

        if (!in_array($accion, ['APROBADO', 'RECHAZADO'])) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Acción inválida. Debe ser 'APROBADO' o 'RECHAZADO'"
            ]);
        }

        // Si aprueba, debe enviar fechas
        if ($accion === 'APROBADO' && (!$fecha_inicio || !$fecha_fin)) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Para aprobar se requieren fecha_inicio y fecha_fin"
            ]);
        }

        $this->cm->beginTransaction();

        try {
            // Actualizar solicitud
            $sql = "UPDATE solicitudes_permiso_almacen 
                    SET estado = ?, 
                        id_admin = ?, 
                        fecha_respuesta = NOW(), 
                        observacion_admin = ? 
                    WHERE id_solicitud = ? AND estado = 'PENDIENTE'";
            
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("sisi", $accion, $id_admin, $observacion_admin, $id_solicitud);
            $stmt->execute();

            if ($this->cm->affectedRows() === 0) {
                $this->cm->rollbackTransaction();
                return json_encode([
                    "estado" => "error",
                    "mensaje" => "Solicitud no encontrada o ya fue procesada"
                ]);
            }

            // Si se aprueba, generar el permiso
            if ($accion === 'APROBADO') {
                $resultado = $this->generarPermiso($id_solicitud, $fecha_inicio, $fecha_fin);
                $resultadoArray = json_decode($resultado, true);
                
                if ($resultadoArray['estado'] !== 'success') {
                    $this->cm->rollbackTransaction();
                    return $resultado;
                }
            }

            $this->cm->commitTransaction();
            return json_encode([
                "estado" => "success",
                "mensaje" => "Solicitud " . strtolower($accion) . " exitosamente"
            ]);

        } catch (Exception $e) {
            $this->cm->rollbackTransaction();
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al procesar solicitud: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Generar el permiso después de aprobar la solicitud
     */
    private function generarPermiso($id_solicitud, $fecha_inicio, $fecha_fin)
    {
        // Obtener datos de la solicitud
        $sql = "SELECT id_usuario, id_almacen FROM solicitudes_permiso_almacen WHERE id_solicitud = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $id_solicitud);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Solicitud no encontrada"
            ]);
        }

        $solicitud = $result->fetch_assoc();
        $id_usuario = $solicitud['id_usuario'];
        $id_almacen = $solicitud['id_almacen'];

        // Insertar permiso
        $sql = "INSERT INTO permisos_venta_sin_stock_almacen 
                (id_solicitud, id_usuario, id_almacen, fecha_inicio, fecha_fin, usado) 
                VALUES (?, ?, ?, ?, ?, 2)";

        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("iiiss", $id_solicitud, $id_usuario, $id_almacen, $fecha_inicio, $fecha_fin);

        if ($stmt->execute()) {
            $id_permiso = $this->cm->getLastInsertId();
            return json_encode([
                "estado" => "success",
                "mensaje" => "Permiso generado exitosamente",
                "id_permiso" => $id_permiso
            ]);
        } else {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al generar permiso: " . $stmt->error
            ]);
        }
    }

    /**
     * Validar si existe un permiso válido para usuario y almacén
     */
    public function validarPermisoDisponible($data)
    {
        $id_usuario = $data['id_usuario'] ?? null;
        $id_almacen = $data['id_almacen'] ?? null;

        if (!$id_usuario || !$id_almacen) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Faltan datos: id_usuario, id_almacen"
            ]);
        }

        $sql = "SELECT id_permiso, fecha_inicio, fecha_fin 
                FROM permisos_venta_sin_stock_almacen 
                WHERE id_usuario = ? 
                  AND id_almacen = ? 
                  AND usado = 2 
                  AND NOW() BETWEEN fecha_inicio AND fecha_fin 
                ORDER BY fecha_inicio DESC 
                LIMIT 1";

        try {
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("ii", $id_usuario, $id_almacen);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $permiso = $result->fetch_assoc();
                return json_encode([
                    "estado" => "success",
                    "mensaje" => "Permiso válido encontrado",
                    "permiso_disponible" => true,
                    "id_permiso" => $permiso['id_permiso'],
                    "vigencia" => [
                        "inicio" => $permiso['fecha_inicio'],
                        "fin" => $permiso['fecha_fin']
                    ]
                ]);
            } else {
                return json_encode([
                    "estado" => "info",
                    "mensaje" => "No hay permiso válido disponible",
                    "permiso_disponible" => false
                ]);
            }
        } catch (Exception $e) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al validar permiso: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Consumir permiso al realizar una venta
     */
    public function consumirPermiso($data)
    {
        date_default_timezone_set('America/La_Paz');
        $fechaBolivia = date('Y-m-d H:i:s');
        $idmd5_usuario = $data['idusuario_md5'] ?? null;
        $id_usuario = $this->verificar->verificarIDUSERMD5($idmd5_usuario);
        $id_almacen = $data['id_almacen'] ?? null;

        if (!$id_usuario || !$id_almacen) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Faltan datos: id_usuario, id_almacen"
            ]);
        }

        $this->cm->beginTransaction();

        try {
            // Buscar permiso válido
            $sql = "SELECT id_permiso 
                    FROM permisos_venta_sin_stock_almacen 
                    WHERE id_usuario = ? 
                      AND id_almacen = ? 
                      AND usado = 2 
                      AND ? BETWEEN fecha_inicio AND fecha_fin 
                    ORDER BY fecha_inicio DESC 
                    LIMIT 1 
                    FOR UPDATE";

            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("iis", $id_usuario, $id_almacen, $fechaBolivia);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                $this->cm->rollbackTransaction();
                return json_encode([
                    "estado" => "error",
                    "mensaje" => "No hay permiso válido disponible para consumir",
                    "usuario" => $id_usuario,
                    "almacen" => $id_almacen,
                    "sql" => $sql,
                    "fecha" => $fechaBolivia
                ]);
            }

            $permiso = $result->fetch_assoc();
            $id_permiso = $permiso['id_permiso'];

            // Marcar permiso como usado
            $sql = "UPDATE permisos_venta_sin_stock_almacen 
                    SET usado = 1, fecha_uso = NOW() 
                    WHERE id_permiso = ?";

            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $id_permiso);
            $stmt->execute();

            $this->cm->commitTransaction();

            return json_encode([
                "estado" => "success",
                "mensaje" => "Permiso consumido exitosamente",
                "id_permiso_consumido" => $id_permiso
            ]);

        } catch (Exception $e) {
            $this->cm->rollbackTransaction();
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al consumir permiso: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Listar permisos activos (no usados y vigentes)
     */
    public function listarPermisosActivos($data)
    {
        $id_usuario = $data['id_usuario'] ?? null;
        $id_almacen = $data['id_almacen'] ?? null;

        $sql = "SELECT p.*, s.motivo 
                FROM permisos_venta_sin_stock_almacen p
                INNER JOIN solicitudes_permiso_almacen s ON p.id_solicitud = s.id_solicitud
                WHERE p.usado = 2 
                  AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin";

        if ($id_usuario) {
            $sql .= " AND p.id_usuario = " . intval($id_usuario);
        }

        if ($id_almacen) {
            $sql .= " AND p.id_almacen = " . intval($id_almacen);
        }

        $sql .= " ORDER BY p.fecha_inicio DESC";

        try {
            $result = $this->cm->query($sql);
            $permisos = [];

            while ($row = $result->fetch_assoc()) {
                $permisos[] = $row;
            }

            return json_encode([
                "estado" => "success",
                "permisos_activos" => $permisos,
                "total" => count($permisos)
            ]);
        } catch (Exception $e) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al listar permisos activos: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Listar permisos usados
     */
    public function listarPermisosUsados($data)
    {
        $id_usuario = $data['id_usuario'] ?? null;
        $id_almacen = $data['id_almacen'] ?? null;
        $id_empresa_md5 = $data['id_empresa_md5'] ?? null;
        $almacenes = $this->verificar->almacenesEmpresa($id_empresa_md5);

        $sql = "SELECT p.*, s.motivo 
                FROM permisos_venta_sin_stock_almacen p
                INNER JOIN solicitudes_permiso_almacen s ON p.id_solicitud = s.id_solicitud
                WHERE p.usado = 1";

        if ($id_usuario) {
            $sql .= " AND p.id_usuario = " . intval($id_usuario);
        }

        if ($id_almacen) {
            $sql .= " AND p.id_almacen = " . intval($id_almacen);
        }
        if (!empty($almacenes)) {
            $sql .= " AND p.id_almacen IN ($almacenes)";
        }

        $sql .= " ORDER BY p.fecha_uso DESC";

        try {
            $result = $this->cm->query($sql);
            $permisos = [];

            while ($row = $result->fetch_assoc()) {
                $permisos[] = $row;
            }

            return json_encode([
                "estado" => "success",
                "permisos_usados" => $permisos,
                "total" => count($permisos)
            ]);
        } catch (Exception $e) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al listar permisos usados: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Listar permisos vencidos (no usados pero fuera de vigencia)
     */
    public function listarPermisosVencidos($data)
    {
        $id_usuario = $data['id_usuario'] ?? null;
        $id_almacen = $data['id_almacen'] ?? null;
        $id_empresa_md5 = $data['id_empresa_md5'] ?? null;
        $almacenes = $this->verificar->almacenesEmpresa($id_empresa_md5);

        $sql = "SELECT p.*, s.motivo 
                FROM permisos_venta_sin_stock_almacen p
                INNER JOIN solicitudes_permiso_almacen s ON p.id_solicitud = s.id_solicitud
                WHERE p.usado = 2 
                  AND NOW() > p.fecha_fin";

        if ($id_usuario) {
            $sql .= " AND p.id_usuario = " . intval($id_usuario);
        }

        if ($id_almacen) {
            $sql .= " AND p.id_almacen = " . intval($id_almacen);
        }
        if (!empty($almacenes)) {
            $sql .= " AND p.id_almacen IN ($almacenes)";
        }

        $sql .= " ORDER BY p.fecha_fin DESC";

        try {
            $result = $this->cm->query($sql);
            $permisos = [];

            while ($row = $result->fetch_assoc()) {
                $permisos[] = $row;
            }

            return json_encode([
                "estado" => "success",
                "permisos_vencidos" => $permisos,
                "total" => count($permisos)
            ]);
        } catch (Exception $e) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al listar permisos vencidos: " . $e->getMessage()
            ]);
        }
    }

    /**
     * Listar todas las solicitudes (pendientes, aprobadas, rechazadas)
     */
    public function listarSolicitudes($data)
    {
        $estado = $data['estado'] ?? null; // Opcional: filtrar por estado
        $id_usuario = $data['id_usuario'] ?? null;
        $id_empresa_md5 = $data['id_empresa_md5'] ?? null;
        $almacenes = $this->verificar->almacenesEmpresa($id_empresa_md5);
        $sql = "SELECT * FROM solicitudes_permiso_almacen WHERE 1=1";

        if ($estado) {
            $sql .= " AND estado = '" . $this->cm->real_escape_string($estado) . "'";
        }

        if ($id_usuario) {
            $sql .= " AND id_usuario = " . intval($id_usuario);
        }
        if (!empty($almacenes)) {
            $sql .= " AND id_almacen IN ($almacenes)";
        }

        $sql .= " ORDER BY fecha_solicitud DESC";

        try {
            $result = $this->cm->query($sql);
            $solicitudes = [];

            while ($row = $result->fetch_assoc()) {
                $solicitudes[] = $row;
            }

            return json_encode([
                "estado" => "success",
                "solicitudes" => $solicitudes,
                "total" => count($solicitudes)
            ]);
        } catch (Exception $e) {
            return json_encode([
                "estado" => "error",
                "mensaje" => "Error al listar solicitudes: " . $e->getMessage()
            ]);
        }
    }
}
?>