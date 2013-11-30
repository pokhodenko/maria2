<div class="pager">
    <?php
    foreach ($data['items'] as $page => $items):
      $first = array_shift($items);
      $class = ($data['info']['active_page'] == $page) ? 'current' : '';
      $link = 'gallery/' . $first['field_category_value'] . '/' . $first['nid'];
      echo l('*', $link, array('attributes' => array(
          'id' => 'pager-' . $page,
          'class' => $class,
      )));
    endforeach;
    ?>
</div>