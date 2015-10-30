$(function () {
  var client = {};

  client.all = function () {
    NProgress.start();
    $.ajax('/list')
    .success(function (data) {
      if (data.ok) {
        var $table = $('#tblList > tbody');
        $table.empty();

        if (_.size(data.rows)) {

        } else {
          $table.append('<tr><td colspan="6"><p class="text-muted">ไม่พบรายการ..</p></td></tr>')
        }
        _.forEach(data.rows, function (v, i) {
          //{"ok":true,"rows":[{"id":23,"syear":"2558","smonth":"10","updated_at":"2015-10-21T17:16:01.000Z","receive_total":40000,"payment_total":25450}]}
          var pMoney = parseFloat(v.payment_total);
          var rMoney = parseFloat(v.receive_total);
          var bMoney = rMoney - pMoney;
          var bMoney2 = rMoney - pMoney;

          pMoney = pMoney ? numeral(pMoney).format('0,0.00') : '0.00';
          rMoney = rMoney ? numeral(rMoney).format('0,0.00') : '0.00';
          bMoney = bMoney ? numeral(bMoney).format('0,0.00') : '0.00';

          var strMonth = null;
          if (v.smonth == '01') strMonth = 'มกราคม';
          if (v.smonth == '02') strMonth = 'กุมภาพันธุ์';
          if (v.smonth == '03') strMonth = 'มีนาคม';
          if (v.smonth == '04') strMonth = 'เมษายน';
          if (v.smonth == '05') strMonth = 'พฤษภาคม';
          if (v.smonth == '06') strMonth = 'มิถุนายน';
          if (v.smonth == '07') strMonth = 'กรกฎาคม';
          if (v.smonth == '08') strMonth = 'สิงหาคม';
          if (v.smonth == '09') strMonth = 'กันยายน';
          if (v.smonth == '10') strMonth = 'ตุลาคม';
          if (v.smonth == '11') strMonth = 'พฤศจิกายน';
          if (v.smonth == '12') strMonth = 'ธันวาคม';

          var html = '<tr>'+
          '<td>'+ v.syear +'</td>' +
          '<td>'+ strMonth +'</td>' +
          '<td style="text-align: right;" style="text-align: right;" class="hidden-xs">'+ rMoney +'</td>' +
          '<td style="text-align: right;" class="hidden-xs">'+ pMoney +'</td>';
          if (bMoney2 <= 0) {
            html += '<td style="text-align: right;"><span class="text-danger"><strong>'+ bMoney +'<strong></span></td>';
          } else {
            html += '<td style="text-align: right;"><span class="text-success"><strong>'+ bMoney +'<strong></span></td>';
          }

          html += '<td style="text-align: center;"><a href="/prints/'+v.id+'" class="btn btn-default btn-raised btn-sm"><i class="fa fa-print"></i></a></td></tr>';

          $table.append(html);
        })
      } else {
        $table.append('<tr><td colspan="6"><p class="text-muted">ไม่พบรายการ..</p></td></tr>');
      }

      NProgress.done();
    })
    .error(function (xhr, status, error) {
      $table.append('<tr><td colspan="6"><p class="text-muted">ไม่พบรายการ..</p></td></tr>');
      console.log(err);
      NProgress.done();
    })
  };

  client.all();

})
