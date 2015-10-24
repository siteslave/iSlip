var express = require('express');
var router = express.Router();
var _ = require('lodash');
var Q = require('q');

var gulp = require('gulp');
var data = require('gulp-data');
var jade = require('gulp-jade');

var users = require('../models/users');

router.get('/pdf', function(req, res, next) {
  var fs = require('fs');
  var pdf = require('html-pdf');

  var json = {
    fullname: 'นายสถิตย์  เรียนพิศ',
    items: [
      {id: 1, name: 'Apple'},
      {id: 2, name: 'Banana'},
      {id: 3, name: 'Orange'},
    ]
  };

  gulp.task('html', function (cb) {
    return gulp.src('./templates/slip.jade')
      .pipe(data(function () {
        return json;
      }))
      .pipe(jade())
      .pipe(gulp.dest('./templates'));
      cb();
  });

  gulp.task('pdf', ['html'], function () {
    var html = fs.readFileSync('./templates/slip.html', 'utf8')
    var options = {
      format: 'A4'
    };

    pdf.create(html, options).toFile('./public/pdf/slip.pdf', function(err, resp) {
      if (err) return console.log(err);
      res.send({ok: true, file: resp}) // { filename: '/app/businesscard.pdf' }
    });
  });

  gulp.start('pdf');

});

router.get('/templates/slip', function (req, res, next) {
  res.render('templates/slip', { fullname: 'พิชญาภา เรียนพิศ'});
});

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/users/login');
});

/* GET users listing. */
router.get('/admin/login', function(req, res, next) {
  res.render('admin_login');
});

router.post('/admin/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var db = req.db;

  users.authAdmin(db, username, password)
    .then(function(total) {
      if (total) {
        req.session.adminLogged = true;
        req.session.canPrint = true;
        res.redirect('/admin');
      } else {
        res.render('admin_login', {
          error: true,
          message: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง'
        })
      }
    }, function(err) {
      console.log(err);
      res.render('admin_login', {
        error: true,
        message: 'เกิดข้อผิดพลาดฝั่ง Server'
      })
    })
});

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var db = req.db;

  users.authClient(db, username, password)
    .then(function(rows) {
      if (_.size(rows)) {
        req.session.employeeId = rows[0].employee_id;
        req.session.fullname = rows[0].fullname;
        req.session.canPrint = true;
        res.send({
          ok: true,
          user: rows
        });
      } else {
        console.log('Incorrect username or password');
        res.send({
          ok: false,
          msg: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง'
        })
      }
    }, function(err) {
      console.log(err);
      res.send({
        ok: false,
        msg: err
      });
    })
})

module.exports = router;
