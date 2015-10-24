var express = require('express');
var router = express.Router();

var slips = require('../models/slips');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/list', function (req, res, next) {
  var db = req.db;
  var employeeId = req.session.employeeId;
  slips.getMySlips(db, employeeId)
  .then(function (rows) {
    res.send({ok: true, rows: rows});
  }, function (err) {
    res.send({ok: false, msg: err})
  })
})

module.exports = router;
