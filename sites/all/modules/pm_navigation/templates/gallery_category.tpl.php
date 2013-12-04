<?php if (!empty($data)): ?>
  <div id="gallery">
    <div id="current">
      <div id="image-info">
        <?php if (!empty($current['title'])): ?>
          <div class="title">
            <?php echo $current['title']; ?>
          </div>
        <?php endif; ?>
        <?php if (!empty($current['description'])): ?>
          <div class="description">
            <?php echo $current['description']; ?>
          </div>
        <?php endif; ?>
      </div>

      <div class="body">
        <?php echo pm_theme_imagecache('main_portfolio_image', $current['main_filepath']); ?>
      </div>
    </div>
    <div id="list">
      <?php foreach ($data['items'] as $page => $items): ?>
        <div id="page-<?php echo $page; ?>" class="page <?php echo ($data['info']['active_page'] == $page) ? 'current' : ''; ?>">
          <?php foreach ($items as $item): ?>
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
      <?php endforeach; ?>
      <?php echo $data['pager']; ?>
    </div>
  </div>
<?php endif; ?>
