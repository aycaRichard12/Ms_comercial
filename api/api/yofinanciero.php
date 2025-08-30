<?php
require_once "../../db/db.php";
header('Content-Type: text/html; charset=UTF-8');

class YoFinanciero extends DB{

    public function verificar(){
        $res="";
        if($_SESSION['yofinanciero']){
            $res=array("success","Bienvenido");
        }else{
            $res=array("danger","Bienvenido");
        }
        echo  json_encode($res);
    }

    public function planesdelicencia(){
        $lista=[];
        $registro=$this->dba->query("select idplanes,orden,nombre,precio,estado,empresas,fecha from planes order by orden asc");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"orden"=>$qwe[1],"nombre"=>$qwe[2],"precio"=>$qwe[3],"estado"=>$qwe[4],"empresas"=>$qwe[5],"fecha"=>$qwe[6]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function registroplanes($orden,$nombre,$precio,$empresas){
    $reporte="";
    $fecha=date("Y-m-d");
    $write=$this->dba->query("insert into planes(idplanes,orden,nombre,precio,estado,empresas,fecha)values(NULL,'$orden','$nombre','$precio','1','$empresas','$fecha')");
    if($write===TRUE){
        $reporte=array("success","Registro Correcto","registroplanes");
    }else{
        $reporte=array("danger","No se pudo registrar");
    }
    echo json_encode($reporte);
    }
    public function registroplanesf5($plan,$orden,$nombre,$precio,$empresas){
        $reporte="";
        $fecha=date("Y-m-d");
        $write=$this->dba->query("update planes set orden='$orden',nombre='$nombre',precio='$precio',empresas='$empresas',fecha='$fecha' where idplanes='$plan'");
        if($write===TRUE){
            $reporte=array("success","Registro Correcto","registroplanes");
        }else{
            $reporte=array("danger","No se pudo registrar");
        }
        echo json_encode($reporte);
        }

    public function eliminarplan($id){
        $res="";
        $otros=$this->dba->query("delete from planesdetalle where idplanes='$id'");
        $registro=$this->dba->query("delete from planes where idplanes='$id'");

        if($registro===TRUE){
            $res=array("success","eliminado");
        }else{
            $res=array("danger","No se elimino");
        }
        echo json_encode($res);
    }

    public function listaclientes(){
        $lista=[];
        $registro=$this->dba->query("SELECT a.idadministrador,a.nombre,a.apellido,a.telefono,a.email,a.estado,a.tipo FROM administrador as a WHERE a.tipo!=1;");
        while($qwe=$this->dba->fetch($registro)){
            $licencia=[];
            $empresas=[];
            
            $plan=$this->dba->query("SELECT
            l.licencia,
            l.fechacontrato
          from
            licencia as l
          WHERE
          l.idadministrador='$qwe[0]'
          ");
            while($asd=$this->dba->fetch($plan)){
                $ril=array("licencia"=>$asd[0],"contrato"=>$asd[1]);
                array_push($licencia,$ril);
            }
            $empa=$this->dbe->query("select o.idorganizacion,o.nombreo from organizacion as o where o.administrador_idadministrador='$qwe[0]' ");
            while($zxc=$this->dbe->fetch($empa)){
                $rew=array("ido"=>$zxc[0],"nombre"=>$zxc[1]);
                array_push($empresas,$rew);
            }
            

            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"apellido"=>$qwe[2],"telefono"=>$qwe[3],"email"=>$qwe[4],"estado"=>$qwe[5],"tipo"=>$qwe[6],"licencia"=>$licencia,"empresa"=>$empresas);
            array_push($lista,$res);
        }
        echo json_encode($lista);

    }

    public function registrodetalle($nombre,$plan){
        $res="";
        $registro=$this->dba->query("insert into planesdetalle(idplanesdetalle,detalle,idplanes)values(NULL,'$nombre','$plan')");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente","registrodetalle",$plan);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }
    public function registrodetallef5($nombre,$plan,$id){
        $res="";
        $registro=$this->dba->query("UPDATE planesdetalle SET detalle='$nombre' WHERE idplanesdetalle='$id'");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente","registrodetalle",$plan);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }
    
    public function detalleplanes($plan){
        $lista=[];
        $registro=$this->dba->query("select idplanesdetalle,detalle from planesdetalle where idplanes='$plan'");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1]);
            array_push($lista,$res);
        }
        echo json_encode($lista);

    }

    public function eliminardetalle($id){
        $res="";
        $registro=$this->dba->query("delete from planesdetalle where idplanesdetalle='$id'");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }

    public function plandesolicitudes(){
        $lista=[];
        $registro=$this->dba->query("SELECT l.idlicencia,l.idplan,l.licencia,l.fechai,l.fechaf,l.empresas,l.fechacontrato,l.estado,l.qr,l.idadministrador,l.tipo FROM `licencia`  as l WHERE l.estado='1';");
        while($qwe=$this->dba->fetch($registro)){
            $plan=$this->dba->query("select * from planes where idplanes='$qwe[1]'");
            $asd=$this->dba->fetch($plan);
            $usuario=$this->dba->query("select * from administrador where idadministrador='$qwe[9]'");
            $zxc=$this->dba->fetch($usuario);
            $empresa=$this->dbe->query("select * from organizacion where idorganizacion='$qwe[5]'");
            $emp=$this->dbe->fetch($empresa);

            $res=array("id"=>$qwe[0],"plan"=>$asd['nombre'],"licencia"=>$qwe[2],"fechai"=>$qwe[3],"fechaf"=>$qwe[4],"idempresa"=>$qwe[5],"empresa"=>$emp['nombreo'],"fecha"=>$qwe[6],"estado"=>$qwe[7],"qr"=>$qwe[8],"tipo"=>$qwe[10],"idcliente"=>$qwe[9],"cliente"=>$zxc['nombre']." ".$zxc['apellido']);
            array_push($lista,$res);
        }
        echo  json_encode($lista);
    }

    public function plandesolicitudesaprobadas(){
        $lista=[];
        $registro=$this->dba->query("SELECT l.idlicencia,l.idplan,l.licencia,l.fechai,l.fechaf,l.empresas,l.fechacobro,l.estado,l.qr,l.idadministrador,l.pago,l.tipopago,l.tipo FROM `licencia`  as l WHERE l.estado='2';");
        while($qwe=$this->dba->fetch($registro)){
            $plan=$this->dba->query("select * from planes where idplanes='$qwe[1]'");
            $asd=$this->dba->fetch($plan);
            $usuario=$this->dba->query("select * from administrador where idadministrador='$qwe[9]'");
            $zxc=$this->dba->fetch($usuario);
            $empresa=$this->dbe->query("select * from organizacion where idorganizacion='$qwe[5]'");
            $emp=$this->dbe->fetch($empresa);
            $res=array("id"=>$qwe[0],"plan"=>$asd['nombre'],"licencia"=>$qwe[2],"fechai"=>$qwe[3],"fechaf"=>$qwe[4],"idempresa"=>$qwe[5],"fechacobro"=>$qwe[6],"estado"=>$qwe[7],"qr"=>$qwe[8],"tipo"=>$qwe[12],"idcliente"=>$qwe[9],"cliente"=>$zxc['nombre']." ".$zxc['apellido'],"pago"=>$qwe[10],"tipopago"=>$qwe[11],"empresa"=>$emp['nombreo']);
            array_push($lista,$res);
        }
        echo  json_encode($lista);
    }

    public function licenciaf5($idlicencia,$licencia,$fechai,$fechaf,$tipo,$pago,$fechacobro,$factura){
        $fecha=date("Y-m-d");
        $res="";//array($idlicencia,$licencia,$fechai,$fechaf,$tipo,$pago,$fechacobro,$factura);
        $registro=$this->dba->query("update licencia set licencia='$licencia',fechai='$fechai',fechaf='$fechaf',fechacontrato='$fecha',estado='2',tipopago='$tipo',pago='$pago',fechacobro='$fechacobro',tipo='$factura' where idlicencia='$idlicencia'");
        if($registro===TRUE){
            $res=array("success","Se Registro la Licencia","licenciaf5");
        }else{
            $res=array("danger","No s epudo Registrar");
        }
        echo json_encode($res);
    }

    public function estadoplan($plan,$estado){
        $res="";
        $registro=$this->dba->query("update planes set estado='$estado' where idplanes='$plan'");

        if($registro===TRUE){
            $res=array("success","Actualizado");
        }else{
            $res=array("danger","No se actualizo");
        }
        echo json_encode($res);
    }

    public function listalicencia(){
        $lista=[];
        $registro=$this->dba->query("SELECT l.idlicencia,l.idplan,l.licencia,l.fechai,l.fechaf,l.empresas,l.fechacontrato,l.estado,l.qr,l.idadministrador FROM `licencia`  as l WHERE l.estado='2';");
        while($qwe=$this->dba->fetch($registro)){
            $plan=$this->dba->query("select * from planes where idplanes='$qwe[1]'");
            $asd=$this->dba->fetch($plan);
            $usuario=$this->dba->query("select * from administrador where idadministrador='$qwe[9]'");
            $zxc=$this->dba->fetch($usuario);

            $res=array("id"=>$qwe[0],"plan"=>$asd['nombre'],"licencia"=>$qwe[2],"fechai"=>$qwe[3],"fechaf"=>$qwe[4],"empresas"=>$qwe[5],"fecha"=>$qwe[6],"estado"=>$qwe[7],"qr"=>$qwe[8],"idcliente"=>$qwe[9],"cliente"=>$zxc['nombre']." ".$zxc['apellido']);
            array_push($lista,$res);
        }
        echo  json_encode($lista);
    }
    public function registrapago($persona,$medio,$fecha,$licencia){
        $res="";
        $licenciaH=$this->dba->query("select * from licencia where idlicencia='$licencia'");
        $qwe=$this->dba->fetch($licenciaH);
        $tipo=$qwe['tipopago'];
        $pago=$qwe['pago'];
        $fechac=$qwe['fechacobro'];

        $pagoslicencia=$this->dba->query("select * from plandepagos where idlicencia='$licencia' order by idplandepagos desc limit 1");
        $veri=$this->dba->rows($pagoslicencia);
        if($veri>0){
        $qq=$this->dba->fetch($pagoslicencia);
        $sigui=$qq['siguiente'];
        $next= date("Y-m-d", strtotime("+$tipo month", strtotime($sigui)));
        $registro=$this->dba->query("insert into plandepagos(idplandepagos,tipopago,pago,persona,medio,fecha,siguiente,idlicencia)values(NULL,'$tipo','$pago','$persona','$medio','$fecha','$next','$licencia')");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente","registropago");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        
        }else{
        
        $next= date("Y-m-d", strtotime("+$tipo month", strtotime($fechac)));
        
        $registro=$this->dba->query("insert into plandepagos(idplandepagos,tipopago,pago,persona,medio,fecha,siguiente,idlicencia)values(NULL,'$tipo','$pago','$persona','$medio','$fecha','$next','$licencia')");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente","registropago");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        }
        echo json_encode($res);
    }

    public function eliminarcobro($idcobro){
        $res="";

        $registro=$this->dba->query("delete from plandepagos where idplandepagos='$idcobro'");
        if($registro){
            $res=array("success","Se elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo json_encode($res);
    }

    public function plandepagos(){
        $lista=[];
        $registro=$this->dba->query("SELECT p.idplandepagos,p.tipopago,p.pago,p.fecha,p.siguiente,p.idlicencia,p.persona,p.medio FROM plandepagos as p 
        ORDER by p.idplandepagos DESC");
        while($qwe=$this->dba->fetch($registro)){
            $licencia=$this->dba->query("SELECT li.licencia,li.fechai,li.fechaf,p.nombre,a.nombre,a.apellido,a.telefono,a.email from licencia as li
            INNER JOIN planes as p ON p.idplanes=li.idplan
            INNER JOIN administrador as a ON a.idadministrador=li.idadministrador
            WHERE li.idlicencia='$qwe[5]';");
            $asd=$this->dba->fetch($licencia);

            $res=array("id"=>$qwe[0],"tipo"=>$qwe[1],"cantidad"=>$qwe[2],"fecha"=>$qwe[3],"siguiente"=>$qwe[4],"licencia"=>$asd[0],"fechai"=>$asd[1],"fechaf"=>$asd[2],"modulo"=>$asd[3],"cliente"=>$asd[4]." ".$asd[5],"telefono"=>$asd[5],"email"=>$asd[6],"persona"=>$qwe[6],"medio"=>$qwe[7]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
        
    }
    public function registrotipotransaccion($nombre,$detalle){
        $res="";
        $registro=$this->dba->query("insert into tipotransaccion(idtipotransaccion,nombre,detalle)values(NULL,'$nombre','$detalle')");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente","tipotransaccion");
        }else{
            $res=array("danger","No se pudo registrar $nombre $detalle");
        }
        echo json_encode($res);
    }
    public function registrotipotransaccionf5($id,$nombre,$detalle){
        $res="";
        $registro=$this->dba->query("update tipotransaccion set nombre='$nombre',detalle='$detalle' where idtipotransaccion='$id'");
        if($registro===TRUE){
            $res=array("success","Se registro correctamente","tipotransaccion");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }
    public function tipotransaccion(){
        $lista=[];
        $registro=$this->dba->query("select t.idtipotransaccion,t.nombre,t.detalle from tipotransaccion as t");
        while($qwe=$this->dba->fetch($registro)){
        $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"detalle"=>$qwe[2]);
        array_push($lista,$res);
        }
        echo  json_encode($lista);
    }
    public function eliminartipo($id){
        $res="";
        $registro=$this->dba->query("delete from tipotransaccion where idtipotransaccion='$id'");
        if($registro===TRUE){
            $res=array("success","Se elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo json_encode($res);
    }

    public function listaimpuesto(){
        $lista=[];
        $registro=$this->dba->query("select t.idimpuesto,t.codigoimpuesto,t.nombreimpuesto,t.tasa,t.descripcion from impuesto as t");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"codigoimpuesto"=>$qwe[1],"nombreimpuesto"=>$qwe[2],"tasa"=>$qwe[3],"descripcion"=>$qwe[4]);
            array_push($lista,$res);
        }
        echo json_encode($lista);

    }
    public function eliminarimpuesto($id){
        $res="";

        $registro=$this->dba->query("delete from impuesto where idimpuesto='$id'");
        if($registro===TRUE){
            $res=array("success","Se elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo json_encode($res);
    }
    public function crearimpuestos($codigo,$nombre,$tasa,$descripcion){
        $res="";
        $registro=$this->dba->query("insert into impuesto(idimpuesto,codigoimpuesto,nombreimpuesto,tasa,descripcion)values(NULL,'$codigo','$nombre','$tasa','$descripcion')");
        if($registro===TRUE){
            $res=array("success","Se creo Correctamente","crearimpuesto");
        }else{
            $res=array("danger","No se pudo crear");
        }
        echo json_encode($res);

    }
    public function crearimpuestosf5($id,$codigo,$nombre,$tasa,$descripcion){
        $res="";
        $registro=$this->dba->query("update impuesto set codigoimpuesto='$codigo',nombreimpuesto='$nombre',tasa='$tasa',descripcion='$descripcion' where idimpuesto='$id'");
        if($registro===TRUE){
            $res=array("success","Se creo Correctamente","crearimpuesto");
        }else{
            $res=array("danger","No se pudo crear");
        }
        echo json_encode($res);

    }
    public function listaclasefactura(){
        $lista=[];
        $registro=$this->dba->query("select t.idclasefactura,t.codigoclasefactura,t.nombreclasefactura,t.descripcion from clasefactura as t");
    }

    public function listatiponegocio(){
        $lista=[];
        $registro=$this->dba->query("select t.idtipobusiness,t.nombreb,t.tipo,t.detalle from tipobusiness as t");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"nombreb"=>$qwe[1],"tipo"=>$qwe[2],"detalle"=>$qwe[3]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function listaasientos($business){
        $lista=[];
        $registro=$this->dba->query("select p.idplancuentasadm,p.numero,p.nombreplan,p.descripcion,p.saldonormal,p.idp from plancuentasadm as p where p.idtipobusiness='$business' order by p.numero asc");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"numero"=>$qwe[1],"nombreplan"=>$qwe[2],"descripcion"=>$qwe[3],"saldonormal"=>$qwe[4],"idp"=>$qwe[5]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function eliminarlistaasientos($business){
        $lista=[];
        $registro=$this->dba->query("delete from plancuentasadm where idtipobusiness='$business'");
        if($registro===TRUE){
            $lista=array("ok"=>"success");
        }
        echo json_encode($lista);
    }
    public function plandecuentasadm(){
        $res="";
        $registro=$this->dba->query("select t.idplancuentasadm,t.numero,t.nombreplan,t.descripcion,t.saldonormal from plancuentasadm as t");
    }

    public function listabono(){
        $lista=[];
        $registro=$this->dba->query("select b.idbonoantiguedad,b.tiempotrabajo,b.bono,b.observacion from bonoantiguedad as b ");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"tiempotrabajo"=>$qwe[1],"bono"=>$qwe[2],"observacion"=>$qwe[3]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function registrobonoantiguedad($tiempo,$bono,$observacion){
        $res="";
        $registro=$this->dba->query("insert into bonoantiguedad(idbonoantiguedad,tiempotrabajo,bono,observacion)values(NULL,'$tiempo','$bono','$observacion')");
        if($registro===TRUE){
            $res=array("success","Se creo Correctamente","crearbonoantiguedad");
        }else{
            $res=array("danger","No se pudo crear");
        }
        echo json_encode($res);
    }

    public function registrobonoantiguedadf5($id,$tiempo,$bono,$observacion){
        $res="";
        $registro=$this->dba->query("update bonoantiguedad set tiempotrabajo='$tiempo',bono='$bono',observacion='$observacion' where idbonoantiguedad='$id'");
        if($registro===TRUE){
            $res=array("success","Se creo Correctamente","crearbonoantiguedad");
        }else{
            $res=array("danger","No se pudo crear");
        }
        echo json_encode($res);
    }
    public function eliminarbono($bono){
        $res="";
        $registro=$this->dba->query("delete from bonoantiguedad where idbonoantiguedad='$bono'");
        if($registro===TRUE){
            $res=array("success","Se elimino Correctamente");
        }else{
            $res=array("danger","No se pudo Eliminar");
        }
        echo json_encode($res);
    }
    public function listavacaciones(){
        $lista=[];
        $registro=$this->dba->query("select v.idvacaciones,v.tiempotrabajo,v.dias,v.observacion from vacaciones as v");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"tiempotrabajo"=>$qwe[1],"dias"=>$qwe[2],"observacion"=>$qwe[3]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function eliminarvacaciones($vaca){
        $res="";
        $registro=$this->dba->query("delete from vacaciones where idvacaciones='$vaca'");
        if($registro===TRUE){
            $res=array("success","Se elimino Correctamente");
        }else{
            $res=array("danger","No se pudo Eliminar");
        }
        echo json_encode($res);
    }
    public function registrovacaciones($tiempo,$dias,$observacion){
        $res="";
        $registro=$this->dba->query("insert into vacaciones(idvacaciones,tiempotrabajo,dias,observacion)values(NULL,'$tiempo','$dias','$observacion')");
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente","registrovacaciones");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registrovacacionesf5($id,$tiempo,$dias,$observacion){
        $res="";
        $registro=$this->dba->query("update vacaciones set tiempotrabajo='$tiempo',dias='$dias',observacion='$observacion' where idvacaciones='$id'");
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente","registrovacaciones");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }
    public function listasalario(){
        $lista=[];
        $registro=$this->dba->query("select s.idsalario,s.anio,s.monto,s.observacion from salario as s");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"anio"=>$qwe[1],"monto"=>$qwe[2],"observacion"=>$qwe[3]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function eliminarsalario($sal){
        $res="";
        $registro=$this->dba->query("delete from salario where idsalario='$sal'");
        if($registro===TRUE){
            $res=array("success","Se Elimino Correctamente");
        }else{
            $res=array("danger","No se pudo Eliminar");
        }
        echo json_encode($res);
    }
    public function registrosalario($anio,$monto,$observacion){
        $res="";
        $registro=$this->dba->query("insert into salario(idsalario,anio,monto,observacion)values(NULL,'$anio','$monto','$observacion')");
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente","registrosalario");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }
    public function registrosalariof5($id,$anio,$monto,$observacion){
        $res="";
        $registro=$this->dba->query("update salario set anio='$anio',monto='$monto',observacion='$observacion' where idsalario='$id'");
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente","registrosalario");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }
    public function listausuarios(){
        $lista=[];
        $registro=$this->dba->query("select a.idadministrador,a.nombre,a.apellido,a.telefono,a.email,a.estado,a.tipo,a.plan,a.fecha from  administrador as a where a.tipo<='5'");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"apellido"=>$qwe[2],"telefono"=>$qwe[3],"email"=>$qwe[4],"estado"=>$qwe[5],"tipo"=>$qwe[6],"plan"=>$qwe[7],"fecha"=>$qwe[8]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function registrousuarios($nombre,$apellido,$telefono,$email,$password,$tipo,$plan){
        $fecha=date("Y-m-d");
        $res="";
        $pass=password_hash($password,PASSWORD_DEFAULT);
        $registro=$this->dba->query("insert into administrador(idadministrador,nombre,apellido,telefono,email,password,estado,tipo,plan,fecha)value(NULL,'$nombre','$apellido','$telefono','$email','$pass','2','$tipo','$plan','$fecha')");
        if($registro===TRUE){
        $res=array("success","Se registro Correctamente","registrousuarios");
        }else{
            $res=array("danger","No se pudo registrar Usuario");
            }
            echo json_encode($res);
    }
    public function estadousuario($idusuario,$estado){
        $res="";
        $registro=$this->dba->query("update administrador set estado='$estado' where idadministrador='$idusuario'");
        if($registro===TRUE){
            $res=array("success","Se actualizo");
        }else{
            $res=array("danger","No se pudo actualizar");
        }
        echo json_encode($res);
    }
    public function getperfil(){
        $id=$_SESSION['yofinanciero'];
        $lista=[];
        $perfil=$this->dba->query("select
        a.idadministrador,
        a.nombre,
        a.apellido,
        a.telefono,
        a.email
      from
        administrador as a
      where
        a.idadministrador = '$id'");
        $qwe=$this->dba->fetch($perfil);
        $lista=array("id"=>$qwe[0],"nombre"=>$qwe[1],"apellido"=>$qwe[2],"telefono"=>$qwe[3],"email"=>$qwe[4]);
        echo json_encode($lista);
    }
    public function perfilf5($nombre,$apellido,$email,$telefono){
        $id=$_SESSION['yofinanciero'];
        $res="";
        $registro=$this->dba->query("update administrador set nombre='$nombre',apellido='$apellido',telefono='$telefono',email='$email' where idadministrador='$id'");
        if($registro===TRUE){
            $res=array("success","Registro Actualizado","registro");
        }else{
            $res=array("danger","Error al Actualizar");
        }
        echo json_encode($res);
    }
    public function cambiarclave($password){
        $id=$_SESSION['yofinanciero'];
        $res="";
        $pass=password_hash($password,PASSWORD_DEFAULT);
        $registro=$this->dba->query("update administrador set password='$pass' where idadministrador='$id'");
        if($registro===TRUE){
            $res=array("success","Clave Actualizada ","registro");
        }else{
            $res=array("danger","Error al Actualizar");
        }
        echo json_encode($res);
    }
    public function registrarqr($licencia,$ima){
        $res="";
        $registro=$this->dba->query("update licencia set qr='$ima' where idlicencia='$licencia'");
        if($registro===TRUE){
            $res=array("success","Registro Actualizado","registroqr");
        }else{
            $res=array("danger","Error al Actualizar");
        }
        echo json_encode($res);
    }

    public function creartiponegocio($nombre,$tipo,$detalle){
        $res="";
        $registro=$this->dba->query("insert into tipobusiness(idtipobusiness,nombreb,tipo,detalle)values(NULL,'$nombre','$tipo','$detalle')");
        if($registro===TRUE){
            $res=array("success","Registro Realizado","registrartiponegocio");
        }else{
            $res=array("danger","Error al Actualizar");
        }
        echo json_encode($res);
    }
    public function creartiponegociof5($id,$nombre,$tipo,$detalle){
        $res="";
        $registro=$this->dba->query("update tipobusiness set nombreb='$nombre',tipo='$tipo',detalle='$detalle' where idtipobusiness='$id'");
        if($registro===TRUE){
            $res=array("success","Registro Actualizado","registrartiponegocio");
        }else{
            $res=array("danger","Error al Actualizar");
        }
        echo json_encode($res);
    }


    public function empresas(){
        $lista=[];
        $registro=$this->dbe->query("
        select
	e.idorganizacion,
  e.nombreo,
  e.nit,
  e.rubroactividad,
  e.pais,
  e.estado,
  e.ciudad,
  e.telefono,
  e.celular,
  e.direccion,
  e.administrador_idadministrador
from
  organizacion as e

        ");
        while($qwe=$this->dbe->fetch($registro)){
            $usas=[];
            $usuarios=$this->dbe->query("select
            u.usuario,
            u.telefono,
            u.organizacion_idorganizacion,
            u.tipo,
            u.idusuarioempresa
          from
            usuarioempresa as u
          where
            u.organizacion_idorganizacion = '$qwe[0]'");
            while($asd=$this->dbe->fetch($usuarios)){
            $res=array("usuario"=>$asd[0],"telefono"=>$asd[1],"empresa"=>$asd[2],"tipo"=>$asd[3],"idusuario"=>$asd[4]);
            array_push($usas,$res);
            }
            $em=array("ide"=>$qwe[0],"nombreo"=>$qwe[1],"nit"=>$qwe[2],"rubroactividad"=>$qwe[3],"pais"=>$qwe[4],"estado"=>$qwe[5],"ciudad"=>$qwe[6],"telefono"=>$qwe[7],"celular"=>$qwe[8],"direccion"=>$qwe[9],"ida"=>$qwe[10],"usuarios"=>$usas);
            array_push($lista,$em);
        }
        echo json_encode($lista);

    }

    public function eliminarsolicitud($id){
        $res="";
        $registro=$this->dba->query("delete from licencia where idlicencia='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se Elimino");
        }
        echo json_encode($res);
    }

    public function eliminarcliente($id){
        $res="";
        $registro=$this->dba->query("delete from administrador where idadministrador='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se Elimino");
        }
        echo json_encode($res);
    }
    public function eliminarempresa($id){
        $res="";
        $detallet=$this->dbe->query("select * from usuarioempresa where organizacion_idorganizacion='$id'");
        $qwe=$this->dbe->rows($detallet);
        if($qwe>1){
            $res=array("danger","No se Puede Eliminar, tiene datos almacenados");
        }else{
        $registro=$this->dbe->query("delete from organizacion where idorganizacion='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se Elimino");
        }
        }
        echo json_encode($res);
    }
    public function listatransacciones(){
        $lista=[];
        $registro=$this->dbe->query("
        select
	e.idorganizacion,
  e.nombreo,
  e.nit,
  e.rubroactividad,
  e.pais,
  e.estado,
  e.ciudad,
  e.telefono,
  e.celular,
  e.direccion
  
from
  organizacion as e

        ");
        while($qwe=$this->dbe->fetch($registro)){
            
            $trans=$this->dbc->query("select count(t.idtransacciones) from transacciones as t where t.organizacion_idorganizacion='$qwe[0]'");
            $tt=$this->dbc->fetch($trans);
            
            $fact=$this->dbc->query("select count(f.idfactura) from factura as f where f.idorganizacion='$qwe[0]'");
            $fat=$this->dbc->fetch($fact);

            $em=array("ide"=>$qwe[0],"nombreo"=>$qwe[1],"nit"=>$qwe[2],"rubroactividad"=>$qwe[3],"pais"=>$qwe[4],"estado"=>$qwe[5],"ciudad"=>$qwe[6],"telefono"=>$qwe[7],"celular"=>$qwe[8],"direccion"=>$qwe[9],"transaccion"=>$tt[0],"facturas"=>$fat[0]);
            array_push($lista,$em);
        }
        echo json_encode($lista);

    }
/**Aqui todo lo que se solicita herramienta de facturacion */
    public function listalicenciafactura(){

        $lista=[];
        $registro=$this->dba->query("select
        f.idfactura,
        f.grand_type,
        f.client_id,
        f.client_secret,
        f.idadministrador,
        l.idlicencia,
        f.idempresa,
        a.nombre,
        a.apellido,
        l.licencia,
        p.nombre
        
      from
        factura as f 
        inner join administrador as a on a.idadministrador = f.idadministrador
        inner join licencia as l on l.idadministrador=f.idadministrador
        inner join planes as p on p.idplanes=l.idplan
        where l.tipo='2'");
        while($qwe=$this->dba->fetch($registro)){
            $empresa=$this->dbe->query("select o.nombreo,o.nit from organizacion as o where o.administrador_idadministrador='$qwe[4]' ");
            $asd=$this->dbe->fetch($empresa);
            
            
            $res=array("id"=>$qwe[0],"grand"=>$qwe[1],"clientid"=>$qwe[2],"clientsecret"=>$qwe[3],"idadministrador"=>$qwe[4],"idlicencia"=>$qwe[5],"idempresa"=>$qwe[6],"cliente"=>$qwe[7]." ".$qwe[8],"licencia"=>$qwe[9],"plan"=>$qwe[10],"empresa"=>$asd[0],"nit"=>$asd[1]);
            array_push($lista,$res);
        }
        //$res=array("holas","lista");
        echo json_encode($lista);

    }

    public function registrardbtoken($id,$client_id,$client_secret,$tokenType,$expiresIn,$accessToken,$tipofactura){
        $res="";
        $factura=$this->dba->query("UPDATE factura SET grand_type='client_credentials',client_id='$client_id',client_secret='$client_secret' where idfactura='$id'");
        if($factura==TRUE){
        $token=$this->dba->query("INSERT INTO `facturatoken` (`idfacturatoken`, `token_type`, `expires_in`, `access_token`, `idfactura`,`tipo`)VALUES(NULL,'$tokenType','$expiresIn','$accessToken','$id','$tipofactura')");
        if($token==TRUE){
            $res=array("success","Se Registro Correctamente");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }

    public function vertoken($id){
        $lista=[];
        $registro=$this->dba->query("select f.idfacturatoken,f.token_type,f.expires_in,f.access_token, f.tipo from facturatoken as f where f.idfactura='$id'");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"tokentype"=>$qwe[1],"expirein"=>$qwe[2],"accesstoken"=>$qwe[3],"tipo"=>$qwe[4]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function registroplandecuentasadm($tipobusiness,$numero,$nombre,$saldonormal,$descripcion,$idp){

        $descripcion=$this->dba->real_escape_string($descripcion);
        $nombre=$this->dba->real_escape_string($nombre);
        //$idpt=md5($idp);
        $res="";
        $registro=$this->dba->query("insert into plancuentasadm(idplancuentasadm,numero,nombreplan,descripcion,saldonormal,idp,idtipobusiness)values(NULL,'$numero','$nombre','$descripcion','$saldonormal','$idp','$tipobusiness')");
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente","registroplandecuentasadm",$tipobusiness);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }
    public function registroplandecuentasadmf5($ida,$id,$numero,$nombre,$saldonormal,$descripcion,$idp){

        $descripcion=$this->dba->real_escape_string($descripcion);
        $nombre=$this->dba->real_escape_string($nombre);

        $res="";
        $registro=$this->dba->query("UPDATE  plancuentasadm SET numero='$numero',nombreplan='$nombre',descripcion='$descripcion',saldonormal='$saldonormal',idp='$idp' WHERE idplancuentasadm='$ida'");
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente","registroplandecuentasadm",$id);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }
    
    public function eliminarasiento($id){
        $res="";
        $registro=$this->dba->query("DELETE from plancuentasadm WHERE idplancuentasadm='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo Eliminar");
        }
        echo json_encode($res);
    }

    public function eliminarusuario($idu){
        $res="";
        $registro=$this->dba->query("DELETE from administrador WHERE idadministrador='$idu' and tipo!='6'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo Eliminar");
        }
        echo json_encode($res);

    }

    public function listagrupos($id,$templates){
        $lista=[];

        $registro=$this->dba->query("SELECT g.idgrupos,g.nombre,g.orden,g.idfuncion,g.idp,g.codigo FROM grupos as g WHERE g.idtipobusiness='$id' AND g.codigotemp='$templates' ORDER BY g.orden ASC");
        while($qwe=$this->dba->fetch($registro)){
           // $revificar=$this->dba->query("SELECT g.idgrupos,g.nombre,g.orden,g.idfuncion FROM grupos as g WHERE g.idgrupos='$qwe[0]'");
            //$ver=$this->dba->fetch($revificar);

            $funciones=$this->dba->query("SELECT f.idfuncion, f.nombre, f.codigo from funcion as f WHERE f.idfuncion='$qwe[3]'");
            $ff=$this->dba->fetch($funciones);
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"orden"=>$qwe[2],"idfuncion"=>$qwe[3],"fnombre"=>$ff[1],"fcodigo"=>$ff[2],"idp"=>$qwe[4],"codigo"=>$qwe[5]);
            array_push($lista,$res);
        }
        echo  json_encode($lista);
    }
    public function registrargrupo($nombre,$idtb,$orden,$funcion,$template,$idp,$idtemplate){
        $idp=strtolower(str_replace(' ', '', $idp));
        $res="";
        $codigo=strtolower(str_replace(' ', '', $nombre)).rand(100,1000);
        $registro=$this->dba->query("insert into grupos(idgrupos,nombre,codigo,idtipobusiness,orden,idp,idfuncion,codigotemp)values(NULL,'$nombre','$codigo','$idtb','$orden','$idp','$funcion','$template')");
        if($registro===TRUE){
            $res=array("success","Se Registro","registrargrupo",$idtb,$idtemplate);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }
    public function registrargrupof5($nombre,$idtb,$orden,$funcion,$template,$idp,$idl,$idtemplate){
        $idp=strtolower(str_replace(' ', '', $idp));
        $codigo=strtolower(str_replace(' ', '', $nombre));
        $res="";
        $registro=$this->dba->query("UPDATE grupos SET nombre='$nombre',orden='$orden',idp='$idp',idfuncion='$funcion' WHERE idgrupos='$idl'");
        if($registro===TRUE){
            $res=array("success","Se Actualizo el Registro","registrargrupo",$idtb,$idtemplate);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }
    



    public function eliminargrupo($id,$codigo){
        $res="";
        //verificar grupos ...
        $registro=$this->dba->query("DELETE FROM grupos WHeRE idgrupos='$id'");
        if($registro==TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res); 
    }

    public function registrolista($grupo,$idt,$cuenta,$orden,$template,$idtemplate){
        $res="";
        $registro=$this->dba->query("insert into gruposadd(idgruposadd,codigogrupos,nplancuenta,orden,idp,template)values(NULL,'$grupo','$cuenta','$orden','0','$template')");
        if($registro==TRUE){
            $res=array("success","Registro exitoso","registrolista",$grupo,$idt,$template,$idtemplate);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo  json_encode($res);

    }


    public function registrolistaf5($grupo,$idt,$cuenta,$orden,$template,$idtemplate,$id){
        $res="";
        $registro=$this->dba->query("UPDATE gruposadd SET nplancuenta='$cuenta',orden='$orden' WHERE idgruposadd='$id'");
        if($registro==TRUE){
            $res=array("success","Registro exitoso","registrolista",$grupo,$idt,$template,$idtemplate);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo  json_encode($res);

    }

    public function listacuentas($idg,$idtb){
        $lista=[];
        $registro=$this->dba->query("SELECT g.idgruposadd,g.nplancuenta,g.orden, p.nombreplan from gruposadd as g 
        inner join plancuentasadm as p on p.numero = g.nplancuenta
        where g.codigogrupos='$idg' and p.idtipobusiness='$idtb' ORDER BY g.orden ASC ");
        while($qwe=$this->dba->fetch($registro)){
            $res=array("id"=>$qwe[0],"cuenta"=>$qwe[1],"orden"=>$qwe[2],"nombre"=>$qwe[3]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function eliminarlista($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM gruposadd WHeRE idgruposadd='$id'");
        if($registro==TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res); 
    }

    public function previewgrupo($id){
        $lista=[];

        $registro=$this->dba->query("SELECT g.idgrupos,g.nombre FROM grupos as g WHERE g.idtipobusiness='$id' ");
        while($qwe=$this->dba->fetch($registro)){
            $grupo=[];
            $registrog=$this->dba->query("select g.idgruposadd,g.nplancuenta,p.nombreplan,g.orden from gruposadd as g, plancuentasadm as p 
            where g.idgrupos='$qwe[0]' and  p.idtipobusiness='$id' and p.numero=g.nplancuenta");
        while($asd=$this->dba->fetch($registrog)){
            
            $resu=array("id"=>$asd[0],"cuenta"=>$asd[1],"nombre"=>$asd[2],"orden"=>$asd[3]);
            array_push($grupo,$resu);
        }
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"grupo"=>$grupo);
            array_push($lista,$res);
        }
        echo  json_encode($lista);

    }

    function utf8(string $s): string {
        $s .= $s;
        $len = \strlen($s);
    
        for ($i = $len >> 1, $j = 0; $i < $len; ++$i, ++$j) {
            switch (true) {
                case $s[$i] < "\x80": $s[$j] = $s[$i]; break;
                case $s[$i] < "\xC0": $s[$j] = "\xC2"; $s[++$j] = $s[$i]; break;
                default: $s[$j] = "\xC3"; $s[++$j] = \chr(\ord($s[$i]) - 64); break;
            }
        }
    
        return substr($s, 0, $j);
    }

    public function registrarexcel($idtb,$numero,$nombre,$tipo,$detalle,$idp) {
        
        $detallea=$this->dba->real_escape_string($detalle);
        $detallea=$this->utf8($detallea);
        $nombre=$this->utf8($nombre);

        $registro=$this->dba->query("INSERT INTO plancuentasadm (idplancuentasadm, numero, nombreplan, descripcion, saldonormal, idp, idtipobusiness) VALUES (NULL,'$numero','$nombre','$detallea','$tipo', '$idp','$idtb')");
    
        
    }
    public function eliminartiponegocio($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM tipobusiness WHERE idtipobusiness='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino correctamente");
        }else{
            $res=array("danger","No se elimino");
        }
        echo  json_encode($res);
    }

    public function categoriabienes(){
        $lista=[];
        $bienes=$this->dba->query("select c.idcategoriabienes, c.categoria, c.aniovidautil, c.coeficiente, c.descripcion from categoriabienes as c ");
        while($qwe=$this->dba->fetch($bienes)){
            $res=array("id"=>$qwe[0],"categoria"=>$qwe[1],"vidautil"=>$qwe[2],"coef"=>$qwe[3],"descripcion"=>$qwe[4]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function funciones(){
        $lista=[];
        $funciones=$this->dba->query("select f.idfuncion, f.nombre, f.codigo from funcion as f ");
        while($qwe=$this->dba->fetch($funciones)){
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"codigo"=>$qwe[2]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function registrobeneficio($nombre,$tipo,$cantidad,$estado,$orden,$descripcion,$destino){

        $res="";
        $registro=$this->dba->query("insert into beneficios(idbeneficios,nombre,descripcion,tipo,cantidad,estado,orden,destino)values(NULL,'$nombre','$descripcion','$tipo','$cantidad','$estado','$orden','$destino')");
        if($registro===TRUE){
            $res=array("success","Se Registro","registrobeneficio",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
        
    }

    public function registrobeneficiof5($nombre,$tipo,$cantidad,$estado,$orden,$descripcion,$id,$destino){

        $res="";
        $registro=$this->dba->query("UPDATE beneficios SET nombre='$nombre',descripcion='$descripcion',tipo='$tipo',cantidad='$cantidad',estado='$estado',orden='$orden',destino='$destino' WHERE idbeneficios='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Registro","registrobeneficio",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
        
    }

    public function registrobonosempresa($nombre,$tipo,$cantidad,$estado,$orden,$descripcion,$destino){

        $res="";
        $registro=$this->dba->query("insert into bonosempresa(idbonosempresa,nombre,descripcion,tipo,cantidad,estado,orden,destino)values(NULL,'$nombre','$descripcion','$tipo','$cantidad','$estado','$orden','$destino')");
        if($registro===TRUE){
            $res=array("success","Se Registro","bonosempresa",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
        
    }

    public function registrobonosempresaf5($nombre,$tipo,$cantidad,$estado,$orden,$descripcion,$id,$destino){

        $res="";
        $registro=$this->dba->query("UPDATE bonosempresa SET nombre='$nombre',descripcion='$descripcion',tipo='$tipo',cantidad='$cantidad',estado='$estado',orden='$orden',destino='$destino' WHERE idbonosempresa='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Registro","bonosempresa",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
        
    }

    public function eliminarbonosempresa($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM bonosempresa WHeRE idbonosempresa='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res);
    }

    

    public function listabonosempresa(){
        $lista=[];
        $registro=$this->dba->query("select b.idbonosempresa, b.nombre, b.descripcion, b.tipo, b.cantidad, b.estado, b.orden, b.destino from bonosempresa as b ");
        while($qwe=$this->dba->fetch($registro)){
            
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"descripcion"=>$qwe[2],"tipo"=>$qwe[3],"cantidad"=>$qwe[4],"estado"=>$qwe[5],"orden"=>$qwe[6],"destino"=>$qwe[7]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
        
    }

    public function listabeneficios(){
        $lista=[];
        $registro=$this->dba->query("select b.idbeneficios, b.nombre, b.descripcion, b.tipo, b.cantidad, b.estado, b.orden, b.destino from beneficios as b ");
        while($qwe=$this->dba->fetch($registro)){
            
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"descripcion"=>$qwe[2],"tipo"=>$qwe[3],"cantidad"=>$qwe[4],"estado"=>$qwe[5],"orden"=>$qwe[6],"destino"=>$qwe[7]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
        
    }

    public function eliminarbeneficio($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM beneficios WHeRE idbeneficios='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res);
    }

    public function registromodopago($nombre,$estado,$descripcion){
        $res="";
        $registro=$this->dba->query("insert into modopago(idmodopago,nombre,descripcion,estado)values(NULL,'$nombre','$descripcion','$estado')");
        if($registro===TRUE){
            $res=array("success","Se Registro","registromodopago",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }


    public function registromodopagof5($nombre,$estado,$descripcion,$id){
        $res="";
        $registro=$this->dba->query("UPDATE modopago SET nombre='$nombre',descripcion='$descripcion',estado='$estado' WHERE idmodopago='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Registro","registromodopago",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }


    public function listamodopago(){
        $lista=[];
        $registro=$this->dba->query("select m.idmodopago, m.nombre, m.descripcion, m.estado from modopago as m ");
        while($qwe=$this->dba->fetch($registro)){
            
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"descripcion"=>$qwe[2],"estado"=>$qwe[3]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
        
    }

    public function eliminarmodopago($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM modopago WHeRE idmodopago='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res);    

    }

    public function registroreguladores($nombre,$porcentaje,$estado,$orden,$descripcion,$monto){
        $res="";

        $registro=$this->dba->query("insert into reguladores(idreguladores,nombre,monto,porcentaje,descripcion,estado,orden)values(NULL,'$nombre','$monto','$porcentaje','$descripcion','$estado','$orden')");
        if($registro===TRUE){
            $res=array("success","Se Registro","registroreguladores",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registroreguladoresf5($nombre,$porcentaje,$estado,$orden,$descripcion,$id,$monto){
        $res="";

        $registro=$this->dba->query("UPDATE reguladores SET nombre='$nombre',monto='$monto',porcentaje='$porcentaje',descripcion='$descripcion',estado='$estado',orden='$orden'  WHERE idreguladores='$id' ");
        if($registro===TRUE){
            $res=array("success","Se Registro","registroreguladores",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }


    public function listareguladores(){
        $lista=[];
        $registro=$this->dba->query("select r.idreguladores, r.nombre, r.porcentaje, r.descripcion, r.estado, r.orden, r.monto from reguladores as r ");
        while($qwe=$this->dba->fetch($registro)){
            
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"porcentaje"=>$qwe[2],"descripcion"=>$qwe[3],"estado"=>$qwe[4],"orden"=>$qwe[5],"monto"=>$qwe[6]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
        
    }

    public function eliminareguladores($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM reguladores WHeRE idreguladores='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res);
    }

    public function registrotipocontrato($nombre, $observacion){
        $res="";
        $registro=$this->dba->query("insert into tipocontrato(idtipocontrato,nombre,observacion)values(NULL,'$nombre','$observacion')");
        if($registro===TRUE){
            $res=array("success","Se Registro","registrotipocontrato",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }

    public function registrotipocontratof5($nombre, $observacion,$id){
        $res="";
        $registro=$this->dba->query("UPDATE tipocontrato SET nombre='$nombre',observacion='$observacion' WHERE idtipocontrato='$id'");
        if($registro===TRUE){
            $res=array("success","Se Registro","registrotipocontrato",$nombre);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }


    public function listatipocontrato(){
        $lista=[];
        $registro=$this->dba->query("select t.idtipocontrato, t.nombre, t.observacion from tipocontrato as t ");
        while($qwe=$this->dba->fetch($registro)){
            
            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"observacion"=>$qwe[2]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
        
    }

    public function eliminartipocontrato($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM tipocontrato WHeRE idtipocontrato='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res);

    }

    public function getidtiponegociomd5($md5){
        $tipo=$this->dba->query("select * from tipobusiness where md5(idtipobusiness)='$md5'");
        $res=$this->dba->fetch($tipo);
        return $res['idtipobusiness'];
    }


    public function listadetemplates($tiponegocio) {
        $idBusiness = $this->getidtiponegociomd5($tiponegocio); //7
        
        $lista = [];
        $templateQuery = $this->dba->query("SELECT idtemplatect, nombre, codigo, estado FROM templatect WHERE idtb='$idBusiness'");
        while ($template = $this->dba->fetch($templateQuery)) {
            $grupos = [];
            
            $grupoQuery = $this->dba->query("SELECT idgrupos, nombre, codigo, idtipobusiness, orden, idp, idfuncion,codigotemp 
                                              FROM grupos 
                                              WHERE idtipobusiness='$idBusiness' AND codigotemp='$template[2]'");
            while ($grupo = $this->dba->fetch($grupoQuery)) {
                $grupoAddList = [];
                //Aqui el problema
                $grupoAddQuery = $this->dba->query("SELECT a.idgruposadd, a.codigogrupos, a.nplancuenta, p.nombreplan, a.orden, a.idp, a.template 
                                                    FROM gruposadd AS a 
                                                    INNER JOIN plancuentasadm AS p ON p.numero = a.nplancuenta 
                                                    WHERE a.codigogrupos='$grupo[2]' AND p.idtipobusiness='$idBusiness'");
                while ($grupoAdd = $this->dba->fetch($grupoAddQuery)) {
                    $grupoAddList[] = [
                        "idg" => $grupoAdd[0],
                        "grupo" => $grupoAdd[1],
                        "nplan" => $grupoAdd[2],
                        "cuenta" => $grupoAdd[3],
                        "orden" => $grupoAdd[4],
                        "idp" => $grupoAdd[5],
                        "template" => $grupoAdd[6]
                    ];
                }
                
                $grupos[] = [
                    "id" => $grupo['idgrupos'],
                    "nombre" => $grupo['nombre'],
                    "codigo" => $grupo['codigo'],
                    "idtipobusiness" => $grupo['idtipobusiness'],
                    "orden" => $grupo['orden'],
                    "idp" => $grupo['idp'],
                    "idfuncion" => $grupo['idfuncion'],
                    "listagrupo" => $grupoAddList
                ];
            }
    
            $lista[] = [
                "id" => $template['idtemplatect'],
                "nombre" => $template['nombre'],
                "codigo" => $template['codigo'],
                "estado" => $template['estado'],
                "grupo" => $grupos
            ];
        }
    
        echo json_encode($lista);
    }
    

    public function listatemplate($idtb){

        $lista=[];
        $registro=$this->dba->query("select idtemplatect,nombre,codigo,estado from templatect where idtb='$idtb'");
        while($qwe=$this->dba->fetch($registro)){

            $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"codigo"=>$qwe[2],"estado"=>$qwe[3]);
            array_push($lista,$res);
        }

        echo json_encode($lista);

    }

    public function registrartemplate($idtb,$nombre){
    
        $codigo=strtolower(str_replace(' ', '', $nombre)).rand(100,1000);
        $res="";
        $registro=$this->dba->query("INSERT INTO templatect (nombre,codigo,estado,idtb) VALUES ('$nombre','$codigo','1','$idtb')");
        if($registro===TRUE){
            $res=array("success","Se registro","registrartemplate",$idtb);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo  json_encode($res);
    }
    public function registrartemplatef5($idtb,$nombre,$id){
    
        $codigo=strtolower(str_replace(' ', '', $nombre));
        $res="";
        $registro=$this->dba->query("UPDATE templatect SET nombre='$nombre' WHERE idtemplatect='$id'");
        
        if($registro===TRUE){
            $res=array("success","Se registro","registrartemplate",$idtb);
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo  json_encode($res);
    }

    public function eliminartemplate($id){
        $res="";
        $registro=$this->dba->query("DELETE FROM templatect WHeRE idtemplatect='$id'");
        if($registro===TRUE){
            $res=array("success","Se Elimino");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo  json_encode($res);
    }

    public function listadeasientomodelo($id) {
        $lista = [];  // Lista principal que contendrá todo
        $registro = $this->dba->query("SELECT * FROM asientotipo WHERE tiponegocio='$id'");
    
        while($qwe = $this->dba->fetch($registro)) {
            $modelo = [];  // Array para cada asientotipo
    
            // Agregamos la información del asientotipo al modelo
            $modelo['idasientotipo'] = $qwe['idasientotipo'];
            $modelo['nombre'] = $qwe['nombre'];  // Ejemplo: agregar campo 'nombre' si existe en la tabla
            $modelo['tipo'] = $qwe['tipo'];  // Agrega más campos según tu tabla
            $modelo['tiponegocio'] = $qwe['tiponegocio'];  // Agrega más campos según tu tabla
    
            // Consultamos los asientos asociados a este asientotipo
            $modelos = $this->dba->query("SELECT * FROM asiento WHERE idasientotipo='$qwe[idasientotipo]'");
            $res = [];  // Array para almacenar los asientos asociados
    
            while($asd = $this->dba->fetch($modelos)) {
                // Agregamos los datos del asiento a un array temporal
                $res[] = [
                    'idasiento' => $asd['idasiento'],
                    'idcuenta' => $asd['idcuenta'],  // Ejemplo: agregar campo 'nombre'
                    'porciento' => $asd['porciento'],    // Ejemplo: agregar campo 'monto'
                    'idasientotipo' => $asd['idasientotipo'],    // Ejemplo: agregar campo 'monto'
                    // Agrega más campos según tu tabla de asiento
                ];
            }
    
            // Añadimos los asientos al modelo de asientotipo
            $modelo['asientos'] = $res;
    
            // Añadimos este modelo completo a la lista principal
            $lista[] = $modelo;
        }
    
        // Convertimos la lista final a JSON
        echo json_encode($lista);
    }
    

    
}
