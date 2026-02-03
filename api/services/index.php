<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-Pusher-Socket-ID");

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../../db/conexion.php";
require_once __DIR__ . "/../funciones.php";
require_once "softExternoService.php";
require_once "softwarePusher.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
    require_once "controladorServiciosGet.php";
    return;
}

if ($method === "POST") {
    require_once "controladorServiciosPost.php";
    return;
}

http_response_code(404);
echo json_encode([
    "status" => 404,
    "message" => "Método no soportado",
    "method" => $method
]);
?>  






