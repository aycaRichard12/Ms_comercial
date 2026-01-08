<?php

$ver = $_GET['ver'] ?? '';

$segments = $ver !== '' ? array_filter(explode("/", $ver)) : [];
$apiRoute = $segments[1] ?? null;

if ($apiRoute === 'prueba') {
    echo json_encode(["success" => "prueba exito en GET"], JSON_UNESCAPED_UNICODE);
}
if ($apiRoute === 'listar') {
    $controlador = new SoftExternoService();
    $controlador->listarServicios();
}
if ($apiRoute === 'obtenerServicio') {
    $controlador = new SoftExternoService();
    $controlador->obtenerServicio($segments[2]);
}

 
else {
    http_response_code(404);
    echo json_encode([
        "error" => "La ruta web '{$apiRoute}' no existe",
        "segments" => $segments
    ], JSON_UNESCAPED_UNICODE);
}


