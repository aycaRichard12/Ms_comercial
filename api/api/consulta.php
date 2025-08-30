<?php
require_once "yofinanciero.php";
$ver=explode("/",$_GET['ver']);
if($ver[0]=="verificar"){
$qwe=new YoFinanciero();
$qwe->verificar();
}else
if($ver[0]=="planesdelicencia"){
$yo=new YoFinanciero();
$yo->planesdelicencia();
}elseif($ver[0]=="eliminarplan"){
$yo=new YoFinanciero();
$yo->eliminarplan($ver[1]);
}elseif($ver[0]=="listaclientes"){
$yo=new YoFinanciero();
$yo->listaclientes();
}elseif($ver[0]=="detalleplanes"){
$qw=new YoFinanciero();
$qw->detalleplanes($ver[1]);
}elseif($ver[0]=="eliminardetalle"){
$qw=new YoFinanciero();
$qw->eliminardetalle($ver[1]);
}elseif($ver[0]=="plandesolicitudes"){
$qw=new YoFinanciero();
$qw->plandesolicitudes();
}elseif($ver[0]=="estadoplan"){
$qw=new YoFinanciero();
$qw->estadoplan($ver[1],$ver[2]);
}elseif($ver[0]=="listalicencia"){
$qwe=new YoFinanciero();
$qwe->listalicencia();
}elseif($ver[0]=="plandepagos"){
$qwe=new YoFinanciero();
$qwe->plandepagos();
}elseif($ver[0]=="plandesolicitudesaprobadas"){
$qwe=new YoFinanciero();
$qwe->plandesolicitudesaprobadas();
}elseif($ver[0]=="eliminarcobro"){
$qwe=new YoFinanciero();
$qwe->eliminarcobro($ver[1]);
}elseif($ver[0]=="tipotransaccion"){
$qwe=new YoFinanciero();
$qwe->tipotransaccion();

}elseif($ver[0]=="eliminartipo"){
$qwe=new YoFinanciero();
$qwe->eliminartipo($ver[1]);
}elseif($ver[0]=="listaimpuesto"){
$qwe=new YoFinanciero();
$qwe->listaimpuesto();
}elseif($ver[0]=="eliminarimpuesto"){
$qwe=new YoFinanciero();
$qwe->eliminarimpuesto($ver[1]);
}elseif($ver[0]=="listatiponegocio"){
$qwe=new YoFinanciero();
$qwe->listatiponegocio();
}elseif($ver[0]=="listaasientos"){
$qwe=new YoFinanciero();
$qwe->listaasientos($ver[1]);
}elseif($ver[0]=="listabono"){
$qwe=new YoFinanciero();
$qwe->listabono();
}elseif($ver[0]=="eliminarbono"){
$qwe=new YoFinanciero();
$qwe->eliminarbono($ver[1]);
}elseif($ver[0]=="listavacaciones"){
$qwe=new YoFinanciero();
$qwe->listavacaciones();
}elseif($ver[0]=="eliminarvacaciones"){
$qwe=new YoFinanciero();
$qwe->eliminarvacaciones($ver[1]);
}elseif($ver[0]=="listasalario"){
$qwe=new YoFinanciero();
$qwe->listasalario();
}elseif($ver[0]=="eliminarsalario"){
$qwe=new YoFinanciero();
$qwe->eliminarsalario($ver[1]);
}elseif($ver[0]=="listausuarios"){
$qwe=new YoFinanciero();
$qwe->listausuarios();
}elseif($ver[0]=="estadousuario"){
$qwe=new YoFinanciero();
$qwe->estadousuario($ver[1],$ver[2]);
}elseif($ver[0]=="getperfil"){
$qwe=new YoFinanciero();
$qwe->getperfil();
}elseif($ver[0]=="empresas"){
    $qwe=new YoFinanciero();
    $qwe->empresas();
}elseif($ver[0]=="eliminarsolicitud"){
$qwe=new YoFinanciero();
$qwe->eliminarsolicitud($ver[1]);
}elseif($ver[0]=="eliminarcliente"){
$qwe=new YoFinanciero();
$qwe->eliminarcliente($ver[1]);
}elseif($ver[0]=="eliminarempresa"){
$qwe=new YoFinanciero();
$qwe->eliminarempresa($ver[1]);
}elseif($ver[0]=="listatransacciones"){
$qwe=new YoFinanciero();
$qwe->listatransacciones();
}elseif($ver[0]=="listalicenciafactura"){
$qwe=new YoFinanciero();
$qwe->listalicenciafactura();
}elseif($ver[0]=="registrardbtoken"){
$qwe=new YoFinanciero();
$qwe->registrardbtoken($ver[1],$ver[2],$ver[3],$ver[4],$ver[5],$ver[6],$ver[7]);
}elseif($ver[0]=="vertoken"){
$qwe=new YoFinanciero();
$qwe->vertoken($ver[1]);
}elseif($ver[0]=="eliminarasiento"){
$qwe=new YoFinanciero();
$qwe->eliminarasiento($ver[1]);
}elseif($ver[0]=="eliminarusuario"){
$qwe=new YoFinanciero();
$qwe->eliminarusuario($ver[1]);
}elseif($ver[0]=="listagrupos"){
$qwe=new YoFinanciero();
$qwe->listagrupos($ver[1],$ver[2]);
}elseif($ver[0]=="listacuentas"){
$qwe=new YoFinanciero();
$qwe->listacuentas($ver[1],$ver[2]);
}elseif($ver[0]=="eliminarlista"){
$qwe=new YoFinanciero();
$qwe->eliminarlista($ver[1]);
}elseif($ver[0]=="eliminargrupo"){
$qwe=new YoFinanciero();
$qwe->eliminargrupo($ver[1],$ver[2]);
}elseif($ver[0]=="previewgrupo"){
$qwe=new YoFinanciero();
$qwe->previewgrupo($ver[1]);
}elseif($ver[0]=="eliminartiponegocio"){
$qwe=new YoFinanciero();
$qwe->eliminartiponegocio($ver[1]);
}elseif($ver[0]=="eliminarlistaasientos"){
$qwe=new YoFinanciero();
$qwe->eliminarlistaasientos($ver[1]);
}elseif($ver[0]=="categoriabienes"){
$qwe=new YoFinanciero();
$qwe->categoriabienes();
}elseif($ver[0]=="funciones"){
$qwe=new YoFinanciero();
$qwe->funciones();
}elseif($ver[0]=="listadetemplates"){

$qwe=new YoFinanciero();
$qwe->listadetemplates($ver[1]);

}elseif($ver[0]=="listabeneficios"){
$qwe=new YoFinanciero();
$qwe->listabeneficios();
}elseif($ver[0]=="eliminarbeneficio"){
$qwe=new YoFinanciero();
$qwe->eliminarbeneficio($ver[1]);
}elseif($ver[0]=="listamodopago"){
$qwe=new YoFinanciero();
$qwe->listamodopago();
}elseif($ver[0]=="eliminarmodopago"){
$qwe=new YoFinanciero();
$qwe->eliminarmodopago($ver[1]);
}elseif($ver[0]=="listareguladores"){
$qwe=new YoFinanciero();
$qwe->listareguladores();
}elseif($ver[0]=="eliminareguladores"){
$qwe=new YoFinanciero();
$qwe->eliminareguladores($ver[1]);
}elseif($ver[0]=="listatipocontrato"){
$qwe=new YoFinanciero();
$qwe->listatipocontrato();
}elseif($ver[0]=="eliminartipocontrato"){
$qwe=new YoFinanciero();
$qwe->eliminartipocontrato($ver[1]);
}elseif($ver[0]=="listatemplate"){
$qwe=new YoFinanciero();
$qwe->listatemplate($ver[1]);
}elseif($ver[0]=="eliminartemplate"){
$qwe=new YoFinanciero();
$qwe->eliminartemplate($ver[1]);

}elseif($ver[0]=="listabonosempresa"){
$qwe=new YoFinanciero();
$qwe->listabonosempresa();
}elseif($ver[0]=="eliminarbonosempresa"){
$qwe=new YoFinanciero();
$qwe->eliminarbonosempresa($ver[1]);
}elseif($ver[0]=="listadeasientomodelo"){
$qwe=new YoFinanciero();
$qwe->listadeasientomodelo($ver[1]);
}

?>