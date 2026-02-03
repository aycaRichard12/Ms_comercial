<?php
require __DIR__ . '/../vendor/autoload.php';

use Pusher\Pusher;

class SoftwarePusher
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
 

    public function enviarNotificacionPusher($id_empresa, $id_soft_externo, $canal, $evento, $mensaje) {
        // 1. Recuperar las credenciales de la base de datos
        $sql = "SELECT credenciales FROM empresa_soft_instalado 
                WHERE id_empresa = ? AND id_soft_externo = ? AND activo = 1 LIMIT 1";
        
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("ii", $id_empresa, $id_soft_externo);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $fila = $resultado->fetch_assoc();

        if (!$fila) {
            throw new Exception("No se encontraron credenciales activas para este servicio.");
        }

        // 2. Decodificar el JSON que guardamos antes
        $creds = json_decode($fila['credenciales'], true);

        // 3. Configurar Pusher con los datos recuperados
        $pusher = new Pusher(
            $creds['key'],
            $creds['secret'],
            $creds['app_id'],
            [
                'cluster' => $creds['cluster'],
                'useTLS' => true
            ]
        );

        // 4. Mandar la notificación
        $pusher->trigger($canal, $evento, ['message' => $mensaje]);
        
        return true;
    }
    private function getCredencialesEmpresa($idmd5) {

        $id_empresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $sql = "SELECT esi.credenciales 
                FROM empresa_soft_instalado esi
                LEFT JOIN soft_externo se ON esi.id_soft_externo = se.id_soft_externo
                WHERE esi.id_empresa = ? AND se.nombre = 'Pusher' AND esi.estado = 1 LIMIT 1";
        
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("i", $id_empresa);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $fila = $resultado->fetch_assoc();

        if (!$fila) {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "No se encontraron credenciales activas para Pusher en esta empresa."
            ], JSON_UNESCAPED_UNICODE);
            return null;
        }

        $creds = json_decode($fila['credenciales'], true);
        if (!$this->is_json($fila['credenciales'])) {
           echo json_encode([
                "estado" => "error",
                "mensaje" => "Las credenciales almacenadas no tienen un formato válido."
            ], JSON_UNESCAPED_UNICODE);
            return null;
        }

        return $creds;
    }

    public function getCredencialesEmpresaPublic($idmd5) {
        
        $credenciales = $this->getCredencialesEmpresa($idmd5);
        if (!$credenciales) {
            echo json_encode([
                "estado" => "error",
                "mensaje" => "No se encontraron credenciales activas para Pusher en esta empresa."
            ], JSON_UNESCAPED_UNICODE);
        }else{
            echo json_encode([
                "estado" => "exito",
                "credenciales" => $credenciales
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    //$idmd5, $id_usuario, $mensaje,
    public function enviarNotificacionUsuario( $data) {
        
        $idmd5 = $data['idmd5'];
        $id_usuario = $data['id_usuario'];
        $mensaje = $data['mensaje'];

        // 1. Buscas las credenciales de ESA empresa específica
        $creds = $this->getCredencialesEmpresa($idmd5); 

        $pusher = new Pusher(
            $creds['key'],
            $creds['secret'],
            $creds['app_id'],
            ['cluster' => $creds['cluster'], 'useTLS' => true]
        );

        // 2. El CANAL es único para ese usuario
        // Ejemplo: 'private-user-99' o 'user-5e10...'
        $canal = "user-channel-" . $id_usuario; 
        
        $pusher->trigger($canal, 'notificacion-interna', [
            'texto' => $mensaje,
            'fecha' => date('Y-m-d H:i:s')
        ]);
    }
    

    private function is_json($string) {
        if (is_array($string) || is_object($string)) return true; // Si ya está decodificado, es válido
        if (!is_string($string)) return false;
        
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}
