'use strict';

// Configuring the Deals module
angular.module('deals').run(['Menus',
   function(Menus) {
      // Set top bar menu items
      Menus.addMenuItem('topbar', 'Deals', 'deals', 'dropdown', '/deals(/create)?');
      Menus.addSubMenuItem('topbar', 'deals', 'Liste des deals', 'deals');
      Menus.addSubMenuItem('topbar', 'deals', 'Ajouter un deal', 'deals/create');
   }
]);