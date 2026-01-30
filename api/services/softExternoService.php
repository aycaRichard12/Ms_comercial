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
    public function editar( $data) {
        $sql = "UPDATE soft_externo SET nombre=?, slug=?, descripcion=?, documentacion=?, icono=? WHERE id_soft_externo=?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("sssssi", $data['nombre'], $data['slug'], $data['descripcion'], $data['documentacion'], $data['icono'], $data['id']);
        return $stmt->execute();
    }

    /**
     * Borrado lógico
     */
    public function eliminar($id) {
        $sql = "UPDATE soft_externo SET estado = 0 WHERE id_soft_externo = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
    
    public function instalar($data) {
        $id_empresa = $this->verificar->verificarIDEMPRESAMD5($data['idmd5']);

        // Validar que el JSON sea válido
        if (!$this->is_json($data['credenciales'])) {
            throw new Exception("El formato de las credenciales debe ser un JSON válido.");
        }

        $sql = "INSERT INTO empresa_soft_instalado (id_empresa, id_soft_externo, credenciales, activo) VALUES (?, ?, ?, 1)";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("iis", $id_empresa, $data['id_soft_externo'], $data['credenciales']);
        
        if ($stmt->execute()) {
            return $this->cm->getLastInsertId();
        }
        throw new Exception("Error al instalar software.");
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
        return $lista;
    }

    /**
     * Actualiza credenciales o estado
     */
    public function editarInstalacion( $data) {
        if (isset($data['credenciales']) && !$this->is_json($data['credenciales'])) {
            throw new Exception("JSON de credenciales inválido.");
        }

        $sql = "UPDATE empresa_soft_instalado SET credenciales = ?, activo = ? WHERE id_empresa_soft = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("sii", $data['credenciales'], $data['activo'], $data['id']);
        return $stmt->execute();
    }

    private function is_json($string) {
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}
