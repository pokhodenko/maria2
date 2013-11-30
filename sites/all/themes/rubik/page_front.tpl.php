<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php print $language->language ?>" lang="<?php print $language->language ?>" dir="<?php print $language->dir ?>">
  <head>
    <?php print $head ?>
    <?php print $styles ?>
    <?php print $scripts ?>
    <title><?php print $head_title ?></title>
  </head>
  <body>
    <div id='content'>
      <?php if (!empty($content)): ?>
        <div class='content-wrapper clear-block'><?php print $content ?></div>
      <?php endif; ?>
    </div>
    <div id='footer' class='clear-block'>
      <?php if ($feed_icons): ?>
        <div class='feed-icons clear-block'>
          <label><?php print t('Feeds') ?></label>
          <?php print $feed_icons ?>
        </div>
      <?php endif; ?>
      <?php if ($footer_message): ?><div class='footer-message'><?php print $footer_message ?></div><?php endif; ?>
    </div>

    <?php print $closure ?>

  </body>
</html>