  <?php ob_start();?>
    <?php if (!empty($header)): ?>
      <div id="header-region">
        <?php print $header; ?>
      </div>
    <?php endif; ?>
    <div id="logo-title">
      <?php $mission = theme_get_setting('mission', false); ?>
      <?php if (!empty($mission)): ?>
        <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home" id="logo">
          <?php echo $mission; ?>
        </a>
      <?php endif; ?>

    </div>
  <?php $header = ob_get_clean(); ?>
<?php echo json_encode(array(
  'header' => $header,
  'content' => $content
  )); ?>