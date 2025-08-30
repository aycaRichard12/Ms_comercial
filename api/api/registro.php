<?php
require_once "yofinanciero.php";
require_once "images.php";
$fecha=date("Y-m-d");
$ver=$_POST['ver'];
if($ver=="registroplanes")
{   $yo=new YoFinanciero();
    $yo->registroplanes($_POST['orden'],$_POST['nombre'],$_POST['precio'],$_POST['empresas']);

}elseif($ver=="registroplanesf5"){
$qw=new YoFinanciero();
$qw->registroplanesf5($_POST['idp'],$_POST['orden'],$_POST['nombre'],$_POST['precio'],$_POST['empresas']);
}elseif($ver=="registrodetalle"){
$qw=new YoFinanciero();
$qw->registrodetalle($_POST['nombre'],$_POST['plan']);
}elseif($ver=="registrodetallef5"){
    $qw=new YoFinanciero();
    $qw->registrodetallef5($_POST['nombre'],$_POST['plan'],$_POST['id']);
}elseif($ver=="licenciaf5"){
$qw=new YoFinanciero();
$qw->licenciaf5($_POST['idlicencia'],$_POST['licencia'],$_POST['fechai'],$_POST['fechaf'],$_POST['tipo'],$_POST['pago'],$_POST['fechac'],$_POST['factura']);
}elseif($ver=="registrapago"){
$qw=new YoFinanciero();
$qw->registrapago($_POST['persona'],$_POST['medio'],$_POST['fecha'],$_POST['licencia']);
}elseif($ver=="registrotipotransaccion"){
$qw=new YoFinanciero();
$qw->registrotipotransaccion($_POST['nombre'],$_POST['detalle']);
}elseif($ver=="registrotipotransaccionf5"){
    $qw=new YoFinanciero();
    $qw->registrotipotransaccionf5($_POST['id'],$_POST['nombre'],$_POST['detalle']);
}elseif($ver=="crearimpuestos"){
$qw=new YoFinanciero();
$qw->crearimpuestos($_POST['codigo'],$_POST['nombre'],$_POST['tasa'],$_POST['descripcion']);
}elseif($ver=="crearimpuestosf5"){
    $qw=new YoFinanciero();
    $qw->crearimpuestosf5($_POST['id'],$_POST['codigo'],$_POST['nombre'],$_POST['tasa'],$_POST['descripcion']);
}elseif($ver=="registrobonoantiguedad"){
$qw=new YoFinanciero();
$qw->registrobonoantiguedad($_POST['tiempo'],$_POST['bono'],$_POST['observacion']);
}elseif($ver=="registrobonoantiguedadf5"){
    $qw=new YoFinanciero();
    $qw->registrobonoantiguedadf5($_POST['idbono'],$_POST['tiempo'],$_POST['bono'],$_POST['observacion']);
}elseif($ver=="registrovacaciones"){
$qw=new YoFinanciero();
$qw->registrovacaciones($_POST['tiempo'],$_POST['dias'],$_POST['observacion']);
}elseif($ver=="registrovacacionesf5"){
    $qw=new YoFinanciero();
    $qw->registrovacacionesf5($_POST['id'],$_POST['tiempo'],$_POST['dias'],$_POST['observacion']);
}elseif($ver=="registrosalario"){
$qw=new YoFinanciero();
$qw->registrosalario($_POST['anio'],$_POST['monto'],$_POST['observacion']);
}elseif($ver=="registrosalariof5"){
    $qw=new YoFinanciero();
    $qw->registrosalariof5($_POST['id'],$_POST['anio'],$_POST['monto'],$_POST['observacion']);
}elseif($ver=="registrousuarios"){
$qw=new YoFinanciero();
$qw->registrousuarios($_POST['nombre'],$_POST['apellido'],$_POST['telefono'],$_POST['email'],$_POST['password'],$_POST['tipo'],$_POST['plan']);
}elseif($ver=="perfilf5"){
$we=new YoFinanciero();
$we->perfilf5($_POST['nombre'],$_POST['apellido'],$_POST['email'],$_POST['telefono']);
}elseif($ver=="cambiarclave"){
$qwe=new YoFinanciero();
$qwe->cambiarclave($_POST['password']);
}elseif($ver=="registrarqr"){
    $qwe=new YoFinanciero();
    $ima=new Images();
    $subir="../images/";
        $fijar="images/";
        
        $allowedExts = array("jpg", "jpeg", "gif", "png", "JPG", "GIF", "PNG");
        echo $_POST['licencia'];
    /*
        $extension = end(explode(".", $_FILES["file"]["name"]));
        if ((($_FILES["file"]["type"] == "image/gif")
                || ($_FILES["file"]["type"] == "image/jpeg")
                || ($_FILES["file"]["type"] == "image/png")
                || ($_FILES["file"]["type"] == "image/pjpeg"))
                && in_array($extension, $allowedExts)) {
            // el archivo es un JPG/GIF/PNG, entonces...
            
            $extension = end(explode('.', $_FILES['file']['name']));
            $foto ="yf-qr_".substr(md5(uniqid(rand())),0,10).".".$extension;
            move_uploaded_file($_FILES['file']['tmp_name'], $subir.$foto);
            if($extension=="jpeg" || $extension=="jpg" || $extension=="JPG" || $extension=="JPEG")
            {
            $my= $ima->resizeImage($subir.$foto,800,600);
            imagejpeg($my,$subir.$foto,80);
            }
            if($extension=="PNG" || $extension=="png")
            {
            $my= $ima->resizeImagePng($subir.$foto,800,600);
            imagepng($my,$subir.$foto);
            }
            imagejpeg($my,$subir.$foto,80);
            $imagen=$fijar.$foto;
            $licencia=$_POST['licencia'];
        $qwe->registrarqr($licencia,$imagen);
        
        }*/

}elseif($ver=="creartiponegocio"){
$qwe=new YoFinanciero();
$qwe->creartiponegocio($_POST['nombre'],$_POST['tipo'],$_POST['detalle']);
}elseif($ver=="creartiponegociof5"){
    $qwe=new YoFinanciero();
    $qwe->creartiponegociof5($_POST['id'],$_POST['nombre'],$_POST['tipo'],$_POST['detalle']);
}elseif($ver=="registroplandecuentasadm"){
$qwe=new YoFinanciero();
$qwe->registroplandecuentasadm($_POST['tipobusiness'],$_POST['numero'],$_POST['nombre'],$_POST['saldonormal'],$_POST['descripcion'],$_POST['plandecuenta']);
}elseif($ver=="registroplandecuentasadmf5"){
$qwe=new YoFinanciero();
$qwe->registroplandecuentasadmf5($_POST['ida'],$_POST['id'],$_POST['numero'],$_POST['nombre'],$_POST['saldonormal'],$_POST['descripcion'],$_POST['plandecuenta']);
}elseif($ver=="registrargrupo"){
$qwe=new YoFinanciero();
$qwe->registrargrupo($_POST['nombre'],$_POST['idtb'],$_POST['orden'],$_POST['funcion'],$_POST['template'],$_POST['idp'],$_POST['idtemplate']);
}elseif($ver=="registrargrupof5"){
    $qwe=new YoFinanciero();
    $qwe->registrargrupof5($_POST['nombre'],$_POST['idtb'],$_POST['orden'],$_POST['funcion'],$_POST['template'],$_POST['idp'],$_POST['idl'],$_POST['idtemplate']);
    }elseif($ver=="registrolista"){
$qwe=new YoFinanciero();
$qwe->registrolista($_POST['grupo'],$_POST['idt'],$_POST['plandecuenta'],$_POST['orden'],$_POST['template'],$_POST['idtemplate']);
}elseif($ver=="registrolistaf5"){
    $qwe=new YoFinanciero();
    $qwe->registrolistaf5($_POST['grupo'],$_POST['idt'],$_POST['plandecuenta'],$_POST['orden'],$_POST['template'],$_POST['idtemplate'],$_POST['id']);
    }elseif($ver=="registrarexcel"){
$qwe=new YoFinanciero();
$lista=[];
//$qwe->registrarexcel($_POST['idtb'],$_FILES['file']['name'],$_FILES['file']['tmp_name']);
$archivo_temporal = $_FILES['file']['tmp_name'];
  // Procesar el archivo CSV
  $handle = fopen($archivo_temporal, "r");

  while (($data = fgetcsv($handle, 1000, ",")) !== false) {
      // Insertar los datos en la base de datos (ajusta la consulta según tu tabla)
      $qwe->registrarexcel($_POST['idtb'],$data[0], $data[1], $data[2], $data[3],$data[4]);
  }

  // Cerrar el archivo CSV y la conexión a la base de datos
  fclose($handle);

  $lista = ["success", "Datos Registrados", "registrarexcel",$_POST['idtb']];
  echo json_encode($lista);

}elseif($ver=="registrobeneficio"){
$qwe=new YoFinanciero();
$qwe->registrobeneficio($_POST['nombre'],$_POST['tipo'],$_POST['cantidad'],$_POST['estado'],$_POST['orden'],$_POST['descripcion'],$_POST['destino']);
}elseif($ver=="registrobeneficiof5"){
    $qwe=new YoFinanciero();
    $qwe->registrobeneficiof5($_POST['nombre'],$_POST['tipo'],$_POST['cantidad'],$_POST['estado'],$_POST['orden'],$_POST['descripcion'],$_POST['id'],$_POST['destino']);
}elseif($ver=="registrobonosempresa"){
    $qwe=new YoFinanciero();
    $qwe->registrobonosempresa($_POST['nombre'],$_POST['tipo'],$_POST['cantidad'],$_POST['estado'],$_POST['orden'],$_POST['descripcion'],$_POST['destino']);
    }elseif($ver=="registrobonosempresaf5"){
        $qwe=new YoFinanciero();
        $qwe->registrobonosempresaf5($_POST['nombre'],$_POST['tipo'],$_POST['cantidad'],$_POST['estado'],$_POST['orden'],$_POST['descripcion'],$_POST['id'],$_POST['destino']);
    }elseif($ver=="registromodopago"){
$qwe=new YoFinanciero();
$qwe->registromodopago($_POST['nombre'],$_POST['estado'],$_POST['descripcion']);
}elseif($ver=="registromodopagof5"){
    $qwe=new YoFinanciero();
    $qwe->registromodopagof5($_POST['nombre'],$_POST['estado'],$_POST['descripcion'],$_POST['id']);
    }elseif($ver=="registroreguladores"){
$qwe=new YoFinanciero();
$qwe->registroreguladores($_POST['nombre'],$_POST['porcentaje'],$_POST['estado'],$_POST['orden'],$_POST['descripcion'],$_POST['monto']);
}elseif($ver=="registroreguladoresf5"){
    $qwe=new YoFinanciero();
    $qwe->registroreguladoresf5($_POST['nombre'],$_POST['porcentaje'],$_POST['estado'],$_POST['orden'],$_POST['descripcion'],$_POST['id'],$_POST['monto']);
    }elseif($ver=="registrotipocontrato"){
$qwe=new YoFinanciero();
$qwe->registrotipocontrato($_POST['nombre'],$_POST['observacion']);
}elseif($ver=="registrotipocontratof5"){
    $qwe=new YoFinanciero();
    $qwe->registrotipocontratof5($_POST['nombre'],$_POST['observacion'],$_POST['id']);
    }elseif($ver=="registrartemplate"){
$qwe=new YoFinanciero();
$qwe->registrartemplate($_POST['idtb'],$_POST['nombre']);
}elseif($ver=="registrartemplatef5"){
    $qwe=new YoFinanciero();
    $qwe->registrartemplatef5($_POST['idtb'],$_POST['nombre'],$_POST['id']);
}



?>