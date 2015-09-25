'use strict';

// Configuring the Articles module
angular.module('admin').run(['Menus',
   function(Menus) {
      // Set top bar menu items
      Menus.addMenuItem('topbar', 'Admin', 'admin', 'dropdown', '', false, ['admin']);
      Menus.addSubMenuItem('topbar', 'admin', 'Admin Deal', 'admin/deals', false,  'admin/deals', ['admin']);
      // Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
   }
]);