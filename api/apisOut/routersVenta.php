<?php
   
    
    $method = $_SERVER['REQUEST_METHOD'];

    if($method == "POST"){
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        $controlador = new outVenta(); 
         
        $controlador->registrarVenta($data);

        if ($controlador === null) {
            // Acción por defecto si no se encuentra una ruta válida producto sendEmail editaralmacen registroProducto use
            echo json_encode("El formulario ".$_POST['ver']." no existe");
        }
        return;
    }
    if($method == "GET"){
        require_once "venta/routersGet.php";
        return;     
    }


    
    echo json_encode($response, http_response_code($response["status"]));
?>
   
