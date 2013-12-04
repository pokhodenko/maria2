<?php if (!empty($data)): ?>
  <div id="gallery">
    <div id="list">
      <?php foreach ($data as $item): ?>
        <div class="<?php echo ($item['nid'] == $current['nid']) ? 'item active' : 'item'; ?>">
          <?php ob_start(); ?>
          <div class="onhover">
            <?php echo pm_theme_imagecache('preview_portfolio_image', $item['preview_filepath'], $item['title']); ?>
          </div>
          <div class="onblur">
            <?php echo pm_theme_imagecache('preview_portfolio_image_grey', $item['preview_filepath'], $item['title']); ?>
          </div>
          <?php $preview_image = ob_get_clean(); ?>
          <?php
          echo l(
            $preview_image, 'gallery/' . $item['field_category_value'] . '/' . $item['nid'], array(
            'html' => TRUE,
            )
          );
          ?>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
<?php endif; ?>
