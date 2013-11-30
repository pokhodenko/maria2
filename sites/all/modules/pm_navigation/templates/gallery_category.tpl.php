<?php if (!empty($data)): ?>
  <div id="gallery">

    <div id="current">
      <div id="image-info">
        <div class="title">
          <?php echo $current['title']; ?>
        </div>
        <div class="description">
          <?php echo $current['body']; ?>
        </div>
      </div>

      <div class="body">
        <?php echo pm_theme_imagecache('main_portfolio_image', $current['main_filepath']); ?>
        <?php //echo $current['body']; ?>
      </div>
    </div>
    <div id="list">
      <?php foreach ($data['items'] as $page => $items): ?>
        <div id="page-<?php echo $page; ?>" class="page <?php echo ($data['info']['active_page'] == $page) ? 'current' : ''; ?>">
          <?php foreach ($items as $item): ?>
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
      <?php endforeach; ?>
      <?php echo $data['pager']; ?>
    </div>
  </div>
<?php endif; ?>
