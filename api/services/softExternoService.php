<?php


class SoftExternoService
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    
    private $conexion;
    private $verificar;
    


    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
       
        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        
        
    }
    public function crearServicio($data) {
        header('Content-Type: application/json');
        try {
            // 1. Validaciones básicas antes de insertar
            if (empty($data['nombre']) || empty($data['slug'])) {
                throw new Exception("El nombre y el slug son campos obligatorios.");
            }

            // 2. Preparar la consulta SQL
            $sql = "INSERT INTO soft_externo (nombre, slug, descripcion, documentacion, icono) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $this->cm->prepare($sql);
            
            // Asignación de parámetros (s = string)
            $stmt->bind_param("sssss", 
                $data['nombre'], 
                $data['slug'], 
                $data['descripcion'], 
                $data['documentacion'], 
                $data['icono']
            );

            // 3. Ejecución y respuesta
            if ($stmt->execute()) {
                $idGenerado = $this->cm->insert_id;

                $respuesta = array(
                    "estado" => "success",
                    "mensaje" => "Software externo registrado correctamente",
                    "id" => $idGenerado
                );
                echo json_encode($respuesta);
            }

        } catch (Exception $e) {
            // Manejo de errores consistente con tus otros métodos
            $error = array(
                "estado" => "error", 
                "mensaje" => $e->getMessage()
            );
            echo json_encode($error);
        }
    }

    /**
     * Lista todo el software disponible (estado 1)
     */
    public function listarServicios() {
        try {
            $lista = [];
            // Consulta SQL clara y específica
            $sql = "SELECT id_soft_externo, nombre, slug, descripcion, documentacion, icono, estado FROM soft_externo WHERE estado = 1 ORDER BY id_soft_externo DESC";
            $res_query = $this->cm->query($sql);

            while ($row = $this->cm->fetch($res_query)) {
                // Mapeo manual para asegurar la estructura del JSON
                $item = array(
                    "id"          => $row['id_soft_externo'],
                    "nombre"      => $row['nombre'],
                    "slug" => $row['slug'],
                    "descripcion" => $row['descripcion'],
                    "documentacion" => $row['documentacion'],
                    "icono"      => $row['icono'],
                    "estado"      => $row['estado']
                );

                array_push($lista, $item);
            }

            // Establecer cabecera para que el navegador entienda que es JSON
            header('Content-Type: application/json');
            echo json_encode($lista);

        } catch (Exception $e) {

            // Manejo de errores consistente con tu ejemplo
            header('Content-Type: application/json');
            $error = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($error);
        }
    }

    /**
     * Obtiene un registro por ID o por Slug
     */
    public function obtenerServicio($identificador, $porSlug = false) {
        try {
            // Determinamos el tipo de dato y el campo de búsqueda
            $campo = $porSlug ? "slug" : "id_soft_externo";
            $tipo = $porSlug ? "s" : "i";

            // Consulta específica (evitamos SELECT *)
            $sql = "SELECT id_soft_externo, nombre, slug, descripcion, documentacion, icono, estado 
                    FROM soft_externo 
                    WHERE $campo = ? LIMIT 1";

            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param($tipo, $identificador);
            $stmt->execute();
            $resultado = $stmt->get_result()->fetch_assoc();

            if ($resultado) {
                // Mapeo manual similar a tu ejemplo de Clientes
                $res = array(
                    "id"             => $resultado['id_soft_externo'],
                    "nombre"         => $resultado['nombre'],
                    "slug"           => $resultado['slug'],
                    "descripcion"    => $resultado['descripcion'],
                    "documentacion"    => $resultado['documentacion'],
                    "estado"         => $resultado['estado'],
                    "icono"          => $resultado['icono']
                );
                
                header('Content-Type: application/json');
                echo json_encode($res);
            } else {
                // Respuesta si no existe el registro
                header('Content-Type: application/json');
                echo json_encode(array("estado" => "vacio", "mensaje" => "Servicio no encontrado"));
            }

        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode(array("estado" => "error", "mensaje" => $e->getMessage()));
        }
    }

    /**
     * Actualiza la información del software
     */
    public function editarServicio($data) {
        $sql = "UPDATE soft_externo SET nombre=?, slug=?, descripcion=?, documentacion=?, icono=? WHERE id_soft_externo=?";
        $stmt = $this->cm->prepare($sql);
        
        // Verificamos si la preparación falló
        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error en SQL: " . $this->cm->error]);
            return;
        }

        $stmt->bind_param("sssssi", $data['nombre'], $data['slug'], $data['descripcion'], $data['documentacion'], $data['icono'], $data['id']);
        
        if ($stmt->execute()) {
            // execute() devuelve true si la consulta corrió sin errores de sintaxis o conexión
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Proceso completado",
                "cambios" => $stmt->affected_rows > 0 ? "Datos actualizados" : "No hubo cambios en los valores"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al ejecutar la actualización"
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Borrado lógico
     */
    public function eliminarServicio($id) {
        $sql = "UPDATE soft_externo SET estado = 0 WHERE id_soft_externo = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Software eliminado lógicamente"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al eliminar el software"
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    public function CambiarEstadoServicio($id, $nuevoEstado) {
        $sql = "UPDATE soft_externo SET estado = ? WHERE id_soft_externo = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("ii", $nuevoEstado, $id);
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Estado del software actualizado correctamente"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al actualizar el estado del software"
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    
    public function registrarCredencialesServicio($data) {
        $id_empresa = $this->verificar->verificarIDEMPRESAMD5($data['idmd5']);

        // Si Postman envía un objeto, $data['credenciales'] ya es un array.
        // Lo convertimos a string para validarlo y guardarlo.
        $credencialesRaw = is_array($data['credenciales']) 
            ? json_encode($data['credenciales']) 
            : $data['credenciales'];

        // Ahora is_json recibirá un string y no dará error
        if (!$this->is_json($credencialesRaw)) {
            throw new Exception("El formato de las credenciales debe ser un JSON válido.");
        }

        $sql = "INSERT INTO empresa_soft_instalado (id_empresa, id_soft_externo, credenciales, estado) VALUES (?, ?, ?, 1)";
        $stmt = $this->cm->prepare($sql);
        
        // Pasamos el string convertido
        $stmt->bind_param("iis", $id_empresa, $data['id_soft_externo'], $credencialesRaw);
        
        if ($stmt->execute()) {
            // Nota: Asegúrate de que getLastInsertId() exista en tu clase, 
            // de lo contrario usa $this->cm->insert_id
            $id= $this->cm->insert_id; 
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Software credenciales registrados  correctamente",
                "id" => $id
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al registrar las credenciales"
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Obtiene la lista de software instalados de una empresa
     */
    public function listarPorEmpresa($idmd5) {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $sql = "SELECT esi.*, se.nombre as software_nombre, se.slug 
                FROM empresa_soft_instalado esi
                JOIN soft_externo se ON esi.id_soft_externo = se.id_soft_externo
                WHERE esi.id_empresa = ?";

        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $res = $stmt->get_result();
        $lista = [];
        while($row = $res->fetch_assoc()) {
            $row['credenciales'] = json_decode($row['credenciales']);
            $lista[] = $row;
        }
        echo json_encode($lista, JSON_UNESCAPED_UNICODE);
    }

    /**
     * Actualiza credenciales o estado
     */
    public function editarCredencialesServicio( $data) {
          $credencialesRaw = is_array($data['credenciales']) 
            ? json_encode($data['credenciales']) 
            : $data['credenciales'];

        // Ahora is_json recibirá un string y no dará error
        if (!$this->is_json($credencialesRaw)) {
            throw new Exception("El formato de las credenciales debe ser un JSON válido.");
        }

        $sql = "UPDATE empresa_soft_instalado SET credenciales = ? ,  id_soft_externo = ?  WHERE id_empresa_soft = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("sii", $credencialesRaw,$data['id_soft_externo'], $data['id']);
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Credenciales actualizadas correctamente"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al actualizar las credenciales"
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function cambiarEstadoCredencialesServicio($id, $nuevoEstado) {
        $sql = "UPDATE empresa_soft_instalado SET estado = ? WHERE id_empresa_soft = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("ii", $nuevoEstado, $id);
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Estado de las credenciales actualizado correctamente"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al actualizar el estado de las credenciales"
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function eliminarCredencialesServicio($id) {
        $sql = "DELETE FROM empresa_soft_instalado WHERE id_empresa_soft = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => "exito",
                "mensaje" => "Credenciales eliminadas correctamente"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "Error al eliminar las credenciales"
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    private function is_json($string) {
        if (is_array($string) || is_object($string)) return true; // Si ya está decodificado, es válido
        if (!is_string($string)) return false;
        
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}
