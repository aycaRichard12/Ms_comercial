<?php
require 'vendor/autoload.php';

class SocketPusher{
    private $pusher;
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    
    public function __construct() {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        $this->em = $this->conexion->em;
        $options = [
            'cluster' => 'sa1', // Cambia según tu región
            'useTLS' => true
        ];
        $this->pusher = new Pusher\Pusher(
            '0bc643ef8d66124dac64',
            '97c2543c35b16e66b006',
            '2092889',
            $options
        );
    }
    public function authPusher($channel_name, $socket_id, $id_usuario_md5) {
        if ($channel_name !== "private-user-" . $id_usuario_md5) {
            http_response_code(403);
            return json_encode(['error' => 'Canal no coincide']);
        }
        // Esto ya devuelve un string tipo {"auth":"..."}
        return $this->pusher->socket_auth($channel_name, $socket_id);
    }
    public function sendRealTimeNotification($userId, $title, $message, $actionPath, $data = [], $type = 'info') {
        $payload = [
            'id' => uniqid(),
            'title' => $title,
            'message' => $message,
            'actionPath' => $actionPath,
            'data' => $data,
            'type' => $type,
            'fecha' => date('Y-m-d H:i:s'),
            'icon' => $this->getIconByType($type)
        ];

        
        $this->pusher->trigger("private-user-{$userId}", 'nueva-notificacion', $payload);
    }

    private function getIconByType($type) {
        $icons = ['success' => 'check_circle', 'warning' => 'warning', 'error' => 'error', 'info' => 'info'];
        return $icons[$type] ?? 'notifications';
    }

    function crearAppEnPusher($nombreEmpresa, $idEmpresaInterno) {
        // 1. CONFIGURACIÓN
        $token = "TU_PERSONAL_ACCESS_TOKEN"; // El que sacaste en el paso 1
        $accountId = "TU_ACCOUNT_ID"; // Lo ves en la URL de tu panel de Pusher
        
        $url = "https://api.pusher.com/accounts/$accountId/apps";

        // 2. DATOS DE LA NUEVA APP
        $data = [
            "name" => "ERP_Empresa_" . $idEmpresaInterno . "_" . $nombreEmpresa,
            "cluster" => "sa1", // El cluster para Sudamérica
        ];

        // 3. LLAMADA CURL (PETICIÓN AL SERVIDOR DE PUSHER)
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $token",
            "Content-Type: application/json"
        ]);

        $response = curl_exec($ch);
        $info = curl_getinfo($ch);
        curl_close($ch);

        if ($info['http_code'] == 201) {
            $appCreada = json_decode($response, true);
            
            // Retornamos los datos para guardarlos en la DB
            return [
                'status' => 'success',
                'app_id' => $appCreada['id'],
                'key'    => $appCreada['key'],
                'secret' => $appCreada['secret'],
                'cluster'=> $appCreada['cluster']
            ];
        } else {
            return ['status' => 'error', 'message' => $response];
        }
    }
}