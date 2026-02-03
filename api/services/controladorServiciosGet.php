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
if ($apiRoute === 'eliminarServicio') {
    $controlador = new SoftExternoService();
    $controlador->eliminarServicio($segments[2]);
}
if ($apiRoute === 'cambiarEstadoServicio') {
    $controlador = new SoftExternoService();
    $controlador->CambiarEstadoServicio($segments[2], $segments[3]);
}
if ($apiRoute === 'listarSosftwaresCredencialesPorEmpresa') {
    $controlador = new SoftExternoService();
    $controlador->listarPorEmpresa($segments[2]);
}
if ($apiRoute === 'cambiarEstadoCredencialesServicio') {
    $controlador = new SoftExternoService();
    $controlador->cambiarEstadoCredencialesServicio($segments[2], $segments[3]);
}
if ($apiRoute === 'eliminarCredencialesServicio') {
    $controlador = new SoftExternoService();
    $controlador->eliminarCredencialesServicio($segments[2]);
}
if ($apiRoute === 'getCredencialesPusher') {
    $controlador = new SoftwarePusher();
    $controlador->getCredencialesEmpresaPublic($segments[2]);
}


if ($apiRoute === null) {
    // Acción por defecto si no se encuentra una ruta valida reportecotizacion cambiarestadodevolucion
    http_response_code(404);
    echo json_encode([
        "error" => "La ruta web '{$apiRoute}' no existe",
        "segments" => $segments
    ], JSON_UNESCAPED_UNICODE);
}



