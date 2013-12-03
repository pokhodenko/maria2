<div id="page">
  <div id="header">
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
  </div>
  <div class="clearfix"></div>
  <div id="container" class="clear-block">

    <div id="content">
      <?php print $content; ?>
    </div>
    <div id="animation-placeholder"></div>
    <div id="render-placeholder"></div>
  </div>
</div>