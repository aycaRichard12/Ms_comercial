<?php
// Leer JSON
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Obtener "ver" correctamente
$ver = null;
$controlador = null;
if (is_array($data) && isset($data['ver'])) {
    $ver = $data['ver'];
} elseif (isset($_POST['ver'])) {
    $ver = $_POST['ver'];
}

// Controlador
if ($ver === "prueba") {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "prueba éxito en POST"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($ver == "crearServicio") {
    $controlador = new SoftExternoService();
    $controlador->crearServicio($data);
    exit;
}


if ($controlador === null) {
    // Acción por defecto si no se encuentra una ruta válida producto sendEmail ConfiguracionInicial registroPrueba registrarConfiguracion
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "La acción '$ver' no existe"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}


