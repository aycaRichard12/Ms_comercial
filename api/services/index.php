<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Content-Type: application/json; charset=UTF-8");

    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];
    $rutas = array_filter(explode("/",$uri));
    require_once "softExternoService.php";
   
    require_once __DIR__ . "/../../db/conexion.php";
    require_once __DIR__ . "/../funciones.php";
 
    if($method == "GET"){
        
            require_once "controladorServiciosGet.php";
            return;
        
    }

    if($method == "POST"){
        
            require_once  "controladorServiciosPost.php";
            return;
        
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
        "method" => $method,
        "rutas" => $rutas
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>
   






