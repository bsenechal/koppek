var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Redirige tout vers le contrôleur angular (Marche pas)
.get('*', function(req, res) {
        res.sendfile('./public/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
*/
module.exports = router;
