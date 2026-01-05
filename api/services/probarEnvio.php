<?php
// 1. Cargar la librería de Pusher (Asegúrate de que la ruta sea correcta)
require __DIR__ . '/../vendor/autoload.php';

// 2. Configuración de tus credenciales
$app_id = '2092889';
$key = '0bc643ef8d66124dac64';
$secret = '97c2543c35b16e66b006';
$cluster = 'sa1';

$options = [
    'cluster' => $cluster,
    'useTLS' => true
];

// 3. Instanciar el cliente de Pusher
$pusher = new Pusher\Pusher($key, $secret, $app_id, $options);

/**
 * 4. CONFIGURACIÓN DEL MENSAJE
 * IMPORTANTE: Cambia 'TU_ID_MD5_AQUÍ' por el valor real que ves 
 * en la consola de tu navegador cuando haces login.
 */
$userIdMd5 = '03afdbd66e7929b125f8597834fa83a4'; 
$canal = "private-user-" . $userIdMd5;
$evento = "nueva-notificacion";

$data = [
    'id' => uniqid(),
    'title' => '¡Conexión Exitosa!',
    'message' => 'Si estás viendo esto, Pusher y Quasar están hablando correctamente.',
    'type' => 'positive', // success en Quasar
    'icon' => 'check_circle',
    'actionPath' => '/dashboard',
    'fecha' => date('Y-m-d H:i:s')
];

echo "<h3>Enviando prueba a Pusher...</h3>";
echo "Canal: <b>$canal</b><br>";
echo "Evento: <b>$evento</b><br><br>";

// 5. Disparar el evento
try {
    $result = $pusher->trigger($canal, $evento, $data);
    
    if ($result) {
        echo "<span style='color: green;'>✅ ¡Evento enviado con éxito!</span><br>";
        echo "Revisa la consola de tu aplicación Quasar.";
    } else {
        echo "<span style='color: red;'>❌ Pusher recibió la petición pero no pudo entregarla.</span>";
    }
} catch (Exception $e) {
    echo "<span style='color: red;'>❌ Error: " . $e->getMessage() . "</span>";
}