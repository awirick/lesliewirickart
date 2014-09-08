<?php

/*
 * Enable WordPress menu support uncommenting the line below
 */
add_theme_support('menus');

function register_custom_menus() {
  /*
   * Place here all your register_nav_menu() calls.
   */
   register_nav_menus(array(
		'primary' => 'Primary'
	));
}

add_action('init', 'register_custom_menus');

/*
 * Timber Menus
 */
add_filter('timber_context', 'add_menu_context');
function add_menu_context($data){
  $data['menu'] = new TimberMenu('primary');
  return $data;
}
