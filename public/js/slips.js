$(function() {
  var slip = {};
  // initial year, month
  var year = parseInt(moment().format('YYYY')) + 543;
  var month = moment().format('MM');

  $('#slYear').val(year);
  $('#slMonth').val(month);

  slip.setData = function(data) {
    var $table = $('#tblList > tbody');
    $table.empty();

    if (_.size(data)) {
      _.forEach(data, function(v, i) {
        var ptotal = v.payment_total ? parseFloat(v.payment_total) : 0;
        var rtotal = v.receive_total ? parseFloat(v.receive_total) : 0;
        var btotal = rtotal - ptotal;

        ptotal = numeral(ptotal).format('0,0.00');
        rtotal = numeral(rtotal).format('0,0.00');
        var stotal = btotal ? numeral(btotal).format('0,0.00') : '0.00';

        var html = '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + v.fullname + '</td>' +
          '<td>' + v.position_name + '</td>' +
          '<td style="text-align: right;">' + rtotal + '</td>' +
          '<td style="text-align: right;">' + ptotal + '</td>' +
          '<td style="text-align: right;">' + stotal + '</td>' +
          '<td style="text-align: center;"><div class="btn-group btn-group-sm">'+
          '<a href="#" class="btn btn-warning"><i class="fa fa-reorder"></i></a>' +
          '<a href="#" data-target="#" class="btn btn-warning dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a>' +
          '<ul class="dropdown-menu dropdown-menu-right">' +
          '<li><a href="/admin/slip/edit/'+v.id+'"><i class="fa fa-fw fa-edit"></i> แก้ไขรายการ</a></li>' +
          '<li><a href="javascript:void(0)" data-action="btnRemove" data-id="'+v.id+'"><i class="fa fa-fw fa-trash-o"></i> ลบรายการ</a></li>' +
          '<li class="divider"></li>' +
          '<li><a href="javascript:void(0)" data-action="btnPrint" data-id="'+v.id+'"><i class="fa fa-fw fa-print"></i> พิมพ์สลิปเงินเดือน</a></li>' +
          '</ul>' +
          '</div></td>' +
          '</tr>';
          $table.append(html);
      })
    } else {
      $table.append('<tr><td colspan="7"><span class="text-muted">ไม่พบรายการ</span></td></tr>')
    }
  };

  // Print slip
  $(document).on('click', 'a[data-action="btnPrint"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');

    window.open('/prints/' + id, '_blank');
  });

  slip.all = function() {

    var smonth = $('#slMonth').val();
    var syear = $('#slYear').val();

    NProgress.start();

    $.ajax('/admin/slip/all/' + syear + '/' + smonth)
      .success(function(data) {
        slip.setData(data.rows);
        NProgress.done();
      })
      .error(function(xhr, status, error) {
        console.log(err);
        NProgress.done();
      })
  };

  $('#btnSearch').on('click', function (e) {
    e.preventDefault();
    slip.all();
  });

  $(document).on('click', 'a[data-action="btnRemove"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');

    if (confirm('คุณต้องการลบรายการนี้ ใช่หรือไม่?')) {
      NProgress.start();
      $.ajax({
        url: '/admin/slip/' + id,
        type: 'DELETE'
      })
      .success(function (data) {
        if (data.ok) {
          NProgress.done();
          slip.all();
        } else {
          alert('เกิดข้อผิดพลาด ไม่สามารถลบรายการได้: ' + JSON.stringify(data.msg))
        }
      })
    }
  });

  slip.all();

});
