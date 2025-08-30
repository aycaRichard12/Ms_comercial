<?php
require_once "apiTokens.php";

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Si es JSON, lo uso; si no, uso $_POST encontrada
if (is_array($data) && isset($data['ver'])) {
    $ver = $data['ver'];
} elseif (isset($_POST['ver'])) {
    $ver = $_POST['ver'];
} else {
    $ver = null;
}

if ($ver == "generarTokenJWT") {
    $controlador = new ApiTokens(); 
    $controlador->generarTokenJWT($data['idmd5']);
  
    
}
