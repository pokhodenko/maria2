<?php
/**
 * @file Helper functions for the alpha action for imagecache
 * 
 * @author dan http://coders.co.nz
 */
 
 
/**
 * Implementation of imagecache_hook_form()
 * 
 * Settings for alpha actions.
 * 
 * @param $action array of settings for this action
 * @return a form definition
 */
function imagecache_alpha_form($action) {
  $defaults = array(
    'flatten' => FALSE,
    'RGB' => array('HEX' => '#000000'),
  );
  $action = array_merge($defaults, (array)$action);
  
  $form = array();
  $form['description'] = array('#value' => t(
    "<p>Alpha toning is an advanced method of greyscaling or colorizing. 
      It works using transparency, not colour matching. 
      The results of this filter are excellent for using as watermarks, 
      and for 'sepia' type imprints on coloured or textured backgrounds. 
      It converts dark areas of the image to opaque, light to transparent.</p> 
      <p>Note that if you are working with JPEGs, this alpha effect will not last into the final image 
      <em>unless</em> you either <strong>flatten</strong> this image against a background color 
      or image in a later process or <strong>convert</strong> it to a PNG before saving 
      using available imagecache actions.</p>"
    ));

  $form['RGB'] = imagecache_rgb_form($action['RGB']);
  $form['RGB']['#type'] = 'fieldset'; 
  $form['RGB']['#title'] = t('Fill Color'); 
  $form['RGB']['HEX']['#description'] = t("
    Although this image will end up as an alpha transparency mask, 
    it still has to have some colour to be visible. 
    Black is safe. Dark Sepia #704214 is good too. 
    If it's not set, the colors will be left as they were, but will unsaturate unevenly.
    ");
  

  $form['flatten'] = array( 
    '#type' => 'checkbox', 
    '#title' => t('Flatten Transparency'), 
    '#default_value' => $action['flatten'],
    '#return_value' => TRUE,
    '#description' => t("The opposite of adding alpha transparency, 'flatten' will place the given colour solidly behind the image. Use this if you can't trust IE, or you really do want the image filled in with a solid colour.")
  );
  return $form;
}


/**
 * Implementation of theme_hook() for imagecache_ui.module
 */
function theme_imagecache_alpha($element) {
  return  ($element['#value']['flatten'] ? t("Flatten") : t("Transparent")) 
    ." : ". theme_imagecacheactions_rgb($element['#value']['RGB']);
}


 /**
  * Given an image, manipulate the transparancy behaviour.
  * 
  * implementation of hook_image()
  * 
  * Either convert light parts of an image to see-through, or place a solid
  * colour behind areas that would otherwise be see-though
  * 
  * An imagecache_action_hook() . Handle a pipelined image transformation.
  *
  * To save a partially transparent image, the image resource must be switched to PNG.
  * REMEMBER TO SWITCH IT BACK if needed
  * 
  * @param $image handle on the image definition, including a gd image resource
  * to act upon
  * @param $data settings for this process.
  * @return bool success
  */
function imagecache_alpha_image(&$image, $data = array()) {
  if (! $data['flatten']) {
    // given an image, convert dark areas to opaque, 
    // light to transparent,
    return png_color2alpha($image, $data['RGB']['HEX']);
  } 
  else {
    // Do the opposite, flatten the transparency ONTO the given colour
    $info = $image->info;
    
    if (!$info) { 
      watchdog("imagecache", "Problem converting image to fill behind. Source image returned no info");
      #dsm($source);
      return; // error
    }

    $base_image = imagecreatetruecolor($info['width'], $info['height']) ;
    imagesavealpha($base_image, TRUE);
    imagealphablending($base_image, FALSE); 
 
    // Start with a solid colour
    $background_rgb = hex_to_rgb($data['RGB']['HEX']) ;

   // Setting the background colour here solid is what flattens the image
   $background_color = @imagecolorallocatealpha($base_image, $background_rgb['red'], $background_rgb['green'], $background_rgb['blue'], 0) ;

   // But what I really want to do is set it
   // coloured rgb AND 100% transparent, in the hope that
   // a failure to render transparency would instead render
   // THAT colour.
    $background_color = @imagecolorallocatealpha($base_image, $background_rgb['red'], $background_rgb['green'], $background_rgb['blue'], 0) ;
   // But that still doesn't work.
   // Yet somehow I've seen transparent images that fallback to white, not silver.

   imagefill( $base_image, 0, 0, $background_color );

   // And set the overlay behaviour back again
   imagealphablending($base_image, TRUE); 
 
    // Place the current image over it
    $foreground = $image->resource;
    $success = imagecopy($base_image, $image->resource, 0, 0, 0, 0, $info['width'], $info['height']);

    $image->resource = $base_image;
    return TRUE;
  }
}

/**
 * This achives a tonal effect by converting the images combined tone and
 * existing transparency into one shade value. This is then used as the ALPHA
 * transparency for that pixel, while the whole thing is coloured the same
 * shade. Images 'greytoned' in this manner should sit smoothly on any
 * background.
 * 
 * With no color set, use the existing hue.
 * 
 * To save a partially transparent image, the image resource must be switched to PNG.
 * ... or maybe not. Just flatten it yourself, or switch the format yourself.
 * This hack would produce side effects otherwise.
 * 
 * This algorithm runs maths per-pixel, and therefore is incredibly much more
 * inefficient than any native routine. Will kill the server on large images.
 */
function png_color2alpha(&$image, $color) {
  #$image->info['extension'] = 'png';
  #$image->info['mime_type'] = 'image/png';
  $info = $image->info;
  if (!$info) return FALSE;
  $im1 = $image->resource;
  
  imagesavealpha($im1, TRUE);
  imagealphablending($im1, FALSE);

  if ($color) $background = hex_to_rgb($color);
  $width = imagesx($im1);
  $height = imagesy($im1);

  if (($width*$height) > (600*600)) {
    watchdog('imagecache_actions', __FUNCTION__ . " on {$image->source}. Image is TOO BIG to run the per-pixel algorithm. Aborting.");  
    return TRUE;
  }

  for ($i = 0; $i < $height; $i++) { //this loop traverses each row in the image
    for ($j = 0; $j < $width; $j++) { //this loop traverses each pixel of each row

      // Get the color & alpha info of the current pixel.
      $retrieved_color = imagecolorat($im1, $j, $i); // an index
      $rgba_array = imagecolorsforindex($im1, $retrieved_color);

      // Calculate the total shade value of this pixel.
      $lightness = ( $rgba_array['red'] + $rgba_array['green'] + $rgba_array['blue'] ) /3;
      // Need to flip the numbers around before doing maths.
      #$opacity = 1-($rgba_array['alpha']/127);
      #$darkness = 1-($lightness/256); // 0 is white, 1 is black
      #$visibility = $darkness * $opacity;
      #$alpha = (1-$visibility) * 127;

      $alpha = (1- ((1-($lightness/256)) * (1-($rgba_array['alpha']/127)))) * 127;
      if (!$color) $background=$rgba_array;
      // Paint the pixel.
      $color_to_paint = imagecolorallocatealpha($image->resource, $background['red'], $background['green'], $background['blue'], $alpha);
      imagesetpixel($image->resource, $j, $i, $color_to_paint);  
    }
  }
  return TRUE;
}

