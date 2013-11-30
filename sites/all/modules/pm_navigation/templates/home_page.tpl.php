<?php if (!empty($data)): ?>
  <div id="gallery">
    <div id="list">
          <?php foreach ($data as $item): ?>
            <div class="<?php echo ($item['nid'] == $current['nid']) ? 'item active' : 'item'; ?>">
              <?php
              $preview_image = pm_theme_imagecache('preview_portfolio_image', $item['preview_filepath']);
              ?>
              <?php //echo $preview_image; ?>
              <?php
              echo l(
                $preview_image, 'gallery/' . $item['field_category_value'] . '/' . $item['nid'], array(
                'html' => TRUE,
                'title' => t($item['title']),
                )
              );
              ?>
            </div>
          <?php endforeach; ?>
    </div>
  </div>
<?php endif; ?>
