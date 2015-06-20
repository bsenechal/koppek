'use strict';

// Configuring the Deals module
angular.module('deals').run(['Menus',
   function(Menus) {
      // Set top bar menu items
      Menus.addMenuItem('topbar', 'Deals', 'deals', 'dropdown', '/deals(/create)?');
      Menus.addSubMenuItem('topbar', 'deals', 'List deals', 'deals');
      Menus.addSubMenuItem('topbar', 'deals', 'New Deal', 'deals/create');
   }
]);