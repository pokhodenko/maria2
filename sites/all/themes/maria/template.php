<?php

function maria_preprocess_page(&$vars) {
  $css = $vars['css'];
  unset($css['all']['module']['modules/node/node.css']);
  unset($css['all']['module']['modules/user/user.css']);
  unset($css['all']['module']['modules/system/system.css']);
  unset($css['all']['module']['modules/system/system-menus.css']);
  unset($css['all']['module']['modules/system/defaults.css']);
  unset($css['all']['module']['sites/all/modules/cck/theme/content-module.css']);
  unset($css['all']['module']['sites/all/modules/cck/modules/fieldgroup/fieldgroup.css']);
  unset($css['all']['module']['sites/all/modules/filefield/filefield.css']);
  unset($css['all']['module']['modules/system/defaults.css']);
  unset($css['all']['module']['modules/system/defaults.css']);

  $vars['styles'] = drupal_get_css($css);
}