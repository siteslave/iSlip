var express = require('express');
var router = express.Router();
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var numeral = require('numeral');
var pdf = require('html-pdf');
var moment = require('moment');
var fse = require('fs-extra');

var gulp = require('gulp');
var data = require('gulp-data');
var jade = require('gulp-jade');
var rimraf = require('rimraf');

var slips = require('../models/slips');

router.get('/:id', function (req, res, next) {
  var db = req.db;
  var json = {};
  var id = req.params.id;

  slips.getMainDetail(db, id)
  .then(function (rows) {
    json.detail = rows[0];

    var strMonth = null;
    if (json.detail.smonth == '01') strMonth = 'มกราคม';
    if (json.detail.smonth == '02') strMonth = 'กุมภาพันธุ์';
    if (json.detail.smonth == '03') strMonth = 'มีนาคม';
    if (json.detail.smonth == '04') strMonth = 'เมษายน';
    if (json.detail.smonth == '05') strMonth = 'พฤษภาคม';
    if (json.detail.smonth == '06') strMonth = 'มิถุนายน';
    if (json.detail.smonth == '07') strMonth = 'กรกฎาคม';
    if (json.detail.smonth == '08') strMonth = 'สิงหาคม';
    if (json.detail.smonth == '09') strMonth = 'กันยายน';
    if (json.detail.smonth == '10') strMonth = 'ตุลาคม';
    if (json.detail.smonth == '11') strMonth = 'พฤศจิกายน';
    if (json.detail.smonth == '12') strMonth = 'ธันวาคม';

    json.month = strMonth;
    json.year = json.detail.syear;

    return slips.getItemsDetail(db, id);
  })
  .then(function (rows) {
    json.items = [];
    var totalReceive = 0;
    var totalPayment = 0;
    var totalBalance = 0;

    _.forEach(rows, function (v) {
      var obj = {};
      obj.name = v.item_name;
      obj.item_type = v.item_type;
      obj.money = numeral(v.money).format('0,0.00');
      json.items.push(obj);

      if (v.item_type == "1") totalReceive += parseFloat(v.money);
      if (v.item_type == "2") totalPayment += parseFloat(v.money);
    });

    totalBalance = totalReceive - totalPayment;

    json.totalBalance = numeral(totalBalance).format('0,0.00');
    json.totalReceive = numeral(totalReceive).format('0,0.00');
    json.totalPayment = numeral(totalPayment).format('0,0.00');

    // ensure directory
    fse.ensureDirSync('./templates/html');
    fse.ensureDirSync('./templates/pdf');

    var destPath = './templates/html/' + moment().format('x');
    fse.ensureDirSync(destPath);

    json.img = './img/sign.png';
    // Create pdf
    gulp.task('html', function (cb) {
      return gulp.src('./templates/slip.jade')
        .pipe(data(function () {
          return json;
        }))
        .pipe(jade())
        .pipe(gulp.dest(destPath));
        cb();
    });

    gulp.task('pdf', ['html'], function () {
      var html = fs.readFileSync(destPath + '/slip.html', 'utf8')
      var options = {
        format: 'A4',
        footer: {
          height: "15mm",
          contents: '<span style="color: #444;"><small>Printed: '+ new Date() +'</small></span>'
        }
      };

      var pdfName = './templates/pdf/slip-' + moment().format('x') + '.pdf';

      pdf.create(html, options).toFile(pdfName, function(err, resp) {
        if (err) {
          res.send({ok: false, msg: err});
        } else {
          res.download(pdfName, function () {
            rimraf.sync(destPath);
            fse.removeSync(pdfName);
          });
        }
      });
    });
    // Convert html to pdf
    gulp.start('pdf');

  })
});

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



module.exports = router;
