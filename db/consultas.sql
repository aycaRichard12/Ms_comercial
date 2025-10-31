
select 
  ctz.id_cotizacion,
  a.nombre, 
  ctz.fecha_venta, 
  c.nombre , 
  c.nombrecomercial, 
  c.ciudad, 
  ctz.tipo_venta, 
  ctz.tipo_pago, 
  ctz.monto_total, 
  ctz.nfactura, 
  ctz.descuento, 
  pa.almacen_id_almacen, 
  ctz.cliente_id_cliente1, 
  s.nombre, 
  ctz.estado, 
  ca.canal, 
  "" as cuf, 
  "" as fechaEmission, 
  "" as shortLink, 
  "" as urlSin 
from cotizacion ctz 
left join cliente c on ctz.cliente_id_cliente=c.id_cliente
left join detalle_cotizacion dctz on ctz.id_cotizacion=dctz.cotizacion_id_cotizacion
left join sucursal s on ctz.idsucursal=s.id_sucursal
left join productos_almacen pa on dctz.productos_almacen_id_productos_almacen=pa.id_productos_almacen
left join almacen a on pa.almacen_id_almacen=a.id_almacen
left join canalventa ca on ctz.idcanal=ca.idcanalventa
where c.idempresa = 50
group by ctz.id_cotizacion
order by ctz.fecha_cotizacion desc, ctz.id_cotizacion desc



select a.idanulaciones, 
v.fecha_venta, 
c.nombre, 
c.nombrecomercial, 
c.ciudad, 
a.fecha, 
a.motivo, 
a.venta_id_venta, 
a.idusuario, 
v.nfactura, 
s.nombre, 
vf.cuf, 
vf.shortLink, 
vf.urlSin, 
v.tipo_venta, 
pa.almacen_id_almacen 

from anulaciones a 
        left join cotizacion ctz  on a.venta_id_venta=v.id_venta
        left join detalle_venta dv on v.id_venta=dv.venta_id_venta
        left join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        left join cliente c on v.cliente_id_cliente1=c.id_cliente
        left join sucursal s on v.idsucursal=s.id_sucursal
        left join ventas_facturadas vf on v.id_venta=vf.venta_id_venta
		where c.idempresa='$idempresa'
        group by a.idanulaciones
        order by a.fecha desc, a.idanulaciones desc



select 
  a.idanulaciones as id,
  ctz.fecha_cotizacion as fechaventa, 
  c.nombre as cliente, 
  c.nombrecomercial as nombrecomercial, 
  c.ciudad as ciudad, 
  a.fecha, 
  a.motivo, 
  a.venta_id_venta, 
  a.idusuario, 
  ctz.num as nfactura,   
  s.nombre as sucursal, 
  ctz.estado as estado, 
  '' as cuf , 
  '' as shortLink as shortlink, 
  '' as urlSin  as urlsin
  -1 as tipo_venta, 
  pa.almacen_id_almacen 
from anulaciones a 
left join cotizacion ctz  on a.venta_id_venta = ctz.id_cotizacion
left join detalle_cotizacion dctz on ctz.id_cotizacion=dctz.cotizacion_id_cotizacion
left join productos_almacen pa on dctz.productos_almacen_id_productos_almacen=pa.id_productos_almacen
left join cliente c on ctz.cliente_id_cliente=c.id_cliente
left join sucursal s on ctz.idsucursal=s.id_sucursal
where c.idempresa = 50 a.tipo_venta = 'COTIZACION'
group by ctz.id_cotizacion
order by ctz.fecha_cotizacion desc, ctz.id_cotizacion desc;