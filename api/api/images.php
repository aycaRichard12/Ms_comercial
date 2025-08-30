<?php
class Images
{

public function __constructor()
{
    echo "Hello Image ";
}
function resizeImageSlide($originalImage,$toWidth,$toHeight)
{   
    // Get the original geometry and calculate scales
    list($width, $height) = getimagesize($originalImage);
    $xscale=$width/$toWidth;
	$yscale=$height/$toHeight;
    
    // Recalculate new size with default ratio
    if ($yscale>$xscale){
		$new_width = $toWidth;
        $new_height = $toHeight;
    }
    else {
		$new_width = $toWidth;
        $new_height = $toHeight;    }

    // Resize the original image
    $imageResized = imagecreatetruecolor($new_width, $new_height);
    $imageTmp     = imagecreatefromjpeg ($originalImage);
	
    imagecopyresampled($imageResized, $imageTmp, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

    return $imageResized;
}

function resizeImage($originalImage,$toWidth,$toHeight)
{   
    // Get the original geometry and calculate scales
    list($width, $height) = getimagesize($originalImage);
    $xscale=$width/$toWidth;
	$yscale=$height/$toHeight;
    
    // Recalculate new size with default ratio
    if ($yscale>$xscale){
		/*$new_width = $toWidth;
        $new_height = $toHeight;*/
        $new_width = round($width * (1/$yscale));
        $new_height = round($height * (1/$yscale));
       
        
    }
    else {
		/*$new_width = $toWidth;
        $new_height = $toHeight;   */
        $new_width = round($width * (1/$yscale));
        $new_height = round($height * (1/$yscale));
           
        
        }

    // Resize the original image
    $imageResized = imagecreatetruecolor($new_width, $new_height);
    $imageTmp     = imagecreatefromjpeg ($originalImage);
	
    imagecopyresampled($imageResized, $imageTmp, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

    return $imageResized;
}

function resizeImagePng($originalImage,$toWidth,$toHeight)
{   
    // Get the original geometry and calculate scales
    list($width, $height) = getimagesize($originalImage);
    $xscale=$width/$toWidth;
	$yscale=$height/$toHeight;
    
    // Recalculate new size with default ratio
    if ($yscale>$xscale){
		/*$new_width = $toWidth;
        $new_height = $toHeight;*/
        $new_width = round($width * (1/$yscale));
        $new_height = round($height * (1/$yscale));
       
        
    }
    else {
		/*$new_width = $toWidth;
        $new_height = $toHeight;   */
        $new_width = round($width * (1/$yscale));
        $new_height = round($height * (1/$yscale));
           
        
        }

    // Resize the original image
    $imageResized = imagecreatetruecolor($new_width, $new_height);
    $imageTmp     = imagecreatefrompng ($originalImage);
	
    imagecopyresampled($imageResized, $imageTmp, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

    return $imageResized;
}

function resizeImagenjpggifpng($ruta, $nombre, $alto, $ancho,$extension){
    $rutaImagenOriginal = $ruta.$nombre;
    if($extension == 'GIF' || $extension == 'gif'){
    $img_original = imagecreatefromgif($rutaImagenOriginal);
    }
    if($extension == 'jpg' || $extension == 'JPG'){
    $img_original = imagecreatefromjpeg($rutaImagenOriginal);
    }
    if($extension == 'png' || $extension == 'PNG'){
    $img_original = imagecreatefrompng($rutaImagenOriginal);
    }
    $max_ancho = $ancho;
    $max_alto = $alto;

    list($ancho,$alto)=getimagesize($rutaImagenOriginal);
    $x_ratio = $max_ancho / $ancho;
    $y_ratio = $max_alto / $alto;

    if( ($ancho <= $max_ancho) && ($alto <= $max_alto) ){//Si ancho 
  	    $ancho_final = $ancho;
		$alto_final = $alto;
        
	} elseif (($x_ratio * $alto) < $max_alto){
		$alto_final = ceil($x_ratio * $alto);
		$ancho_final = $max_ancho;
	} 
    else{
		$ancho_final = ceil($y_ratio * $ancho);
		$alto_final = $max_alto;
	}

    $tmp=imagecreatetruecolor($ancho_final,$alto_final);
    imagecopyresampled($tmp,$img_original,0,0,0,0,$ancho_final, $alto_final,$ancho,$alto);
    imagedestroy($img_original);
    
    
}

}
?>