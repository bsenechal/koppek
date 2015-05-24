'use strict';

// Configuring the Articles module
angular.module('admin').run(['Menus',
   function(Menus) {
      // Set top bar menu items
      Menus.addMenuItem('topbar', 'Admin', 'admin', 'dropdown', '');
      Menus.addSubMenuItem('topbar', 'admin', 'Admin Deal', 'admin/deals');
      // Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
   }
]);