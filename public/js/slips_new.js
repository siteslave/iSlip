$(function () {

  var slip = {};
  slip.itemType = 1; // 1 = Receive, 2 = Payment
  slip.items = {};
  slip.items.receives = [];
  slip.items.payments = [];
  slip.totalPrice = 0;


  // initial year, month
  var year = parseInt(moment().format('YYYY')) + 543;
  var month = moment().format('MM');

  $('#slYear').val(year);
  $('#slMonth').val(month);

  slip.searchPerson = function (query) {
    NProgress.start();
    $.ajax('/admin/employees/search/' + query)
    .success(function (data) {
      slip.setData(data.rows);
      NProgress.done();
    })
    .error(function (xhr, status, error) {
      console.log(err);
      NProgress.done();
    })
  };

  $('#btnShowReceiveItems').on('click', function (e) {
    e.preventDefault();
    $('#divReceiveItems').fadeIn();
    $('#divPayItems').fadeOut();
    slip.itemType = 1;
    $('#txtActionName').text('เลือกรายการรายได้');

    $('#mdlItems').modal({
      backdrop: 'static'
    });
  });

  $('#btnShowPayItems').on('click', function (e) {
    e.preventDefault();
    $('#divReceiveItems').fadeOut();
    $('#divPayItems').fadeIn();
    slip.itemType = 2;
    $('#txtActionName').text('เลือกรายการรายจ่าย');

    $('#mdlItems').modal({
      backdrop: 'static'
    });
  });

  slip.setData = function (data) {
    var $table = $('#tblList > tbody');
    $table.empty();

    if (_.size(data)) {
      _.forEach(data, function (v, i) {
        var html = '<tr>'+
          '<td>'+ v.fullname +'</td>' +
          '<td>'+ v.position_name +'</td>' +
          '<td>'+ v.department_name +'</td>' +
          '<td><div class="btn-group">' +
          '<button class="btn btn-primary btn-xs" data-action="selected" data-bank="'+v.bank_name+'" data-account="'+v.account_no+'" data-id="'+v.employee_id+'" data-fullname="'+v.fullname+'" data-department="'+v.department_name+'" data-position="'+v.position_name+'" data-cid="'+v.cid+'"><i class="fa fa-check-circle"></i></button>'+
          '</div></td>' +
        '</tr>';

        $table.append(html);
      })
    } else {
      var html = '<tr><td colspan="4">ไม่พบรายการ...</td></tr>';
      $table.append(html);
    }
  };

  $('#btnSearch').on('click', function (e) {
    e.preventDefault();
    var query = $('#txtQueryEmployee').val();

    if (query) {
      slip.searchPerson(query);
    }
  });

  $('#mdlSearch').on('hidden.bs.modal', function(e) {
    $('#txtQueryEmployee').val('');
    $('#tblList > tbody').empty();
  });

  $(document).on('click', 'button[data-action="selected"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    var cid = $(this).data('cid');
    var fullname = $(this).data('fullname');
    var position = $(this).data('position');
    var department = $(this).data('department');
    var bank = $(this).data('bank');
    var accountNo = $(this).data('account');

    $('#txtCid').text(cid);
    $('#txtFullname').text(fullname);
    $('#txtPosition').text(position);
    $('#txtDepartment').text(department);
    $('#txtBank').text(bank);
    $('#txtAccount').text(accountNo);
    $('#txtId').val(id);

    $('#mdlSearch').modal('hide');
  });

  $('#btnAddItem').on('click', function (e) {
    e.preventDefault();
    var items = {};

    items.money = parseFloat($('#txtMoney').val());
    if (!items.money || items.money <= 0) {
      alert('กรุณาระบุจำนวนเงิน');
    } else {
      if (slip.itemType == 1) {
        items.id = parseInt($('#slReceiveItems').val());
        if (!items.id) {
          alert('กรุณาเลือกรายการ');
        } else {
          items.name = $('#slReceiveItems > option:selected').text();
          items.type = 1;
          slip.items.receives.push(items);
          $('#mdlItems').modal('hide');
        }
      } else {
        items.id = $('#slPayItems').val();
        if (!items.id) {
          alert('กรุณาเลือกรายการ');
        } else {
          items.name = $('#slPayItems > option:selected').text();
          items.type = 2;
          slip.items.payments.push(items);
          $('#mdlItems').modal('hide');
        }
      }
    }

    
  });

  $('#txtTotalReceive').text('0.00');
  $('#txtTotalPayment').text('0.00');
  $('#txtTotalBalance').text('0.00');

  slip.processItems = function() {
    $tableReceive = $('#tblReceive > tbody');
    $tablePayment = $('#tblPayment > tbody');

    $tableReceive.empty();
    $tablePayment.empty();

    var totalReceive = 0;
    var totalPayment = 0;
    var totalBalance = 0;

    if (_.size(slip.items.receives)) {
      _.forEach(slip.items.receives, function (v, i) {
        var total = v.money ? numeral(v.money).format('0,0.00') : '0.00';
        var html = '<tr>'+
        '<td>'+ (i+1) +'</td>' +
        '<td>'+ v.name +'</td>' +
        '<td style="text-align: right;">'+ total +'</td>' +
        '<td style="text-align: center;"><button class="btn btn-danger btn-xs" data-id="'+ v.id +'" data-action="btnReceiveRemove"><i class="fa fa-trash-o"></i></button></td>' +
        '</tr>';
        totalReceive += parseFloat(v.money);
        $tableReceive.append(html);
      });
    } else {
      var html = '<tr><td colspan="4"><span class="text-muted">ไม่พบรายการ</span></td></tr>';
      $tableReceive.append(html);
    }

    if (_.size(slip.items.payments)) {
      _.forEach(slip.items.payments, function (v, i) {
        var total = v.money ? numeral(v.money).format('0,0.00') : '0.00';
        var html = '<tr>'+
        '<td>'+ (i+1) +'</td>' +
        '<td>'+ v.name +'</td>' +
        '<td style="text-align: center;">'+ total +'</td>' +
        '<td style="text-align: center;"><button class="btn btn-danger btn-xs" data-id="'+ v.id +'" data-action="btnPaymentRemove"><i class="fa fa-trash-o"></i></button></td>' +
        '</tr>';
        totalPayment += parseFloat(v.money);
        $tablePayment.append(html);
      });
    } else {
      var html = '<tr><td colspan="4"><span class="text-muted">ไม่พบรายการ</span></td></tr>';
      $tablePayment.append(html);
    }

    totalBalance = totalReceive - totalPayment;

    $('#txtTotalReceive').text(numeral(totalReceive).format('0,0.00'));
    $('#txtTotalPayment').text(numeral(totalPayment).format('0,0.00'));
    $('#txtTotalBalance').text(numeral(totalBalance).format('0,0.00'))
  };

  // Remove item
  $(document).on('click', 'button[data-action="btnReceiveRemove"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    var idx = _.findIndex(slip.items.receives, {id: id});
    
    if (idx >= 0) {
      slip.items.receives.splice(idx, 1);
      slip.processItems();
    }
  });

  // Remove item
  $(document).on('click', 'button[data-action="btnPaymentRemove"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    
    var idx = _.findIndex(slip.items.payments, {id: id});
    
    if (idx >= 0) {
      slip.items.payments.splice(idx, 1);
      slip.processItems();
    }
  });


  $('#mdlItems').on('hidden.bs.modal', function (e) {
    slip.processItems();

    $("#txtMoney").val('');
    $('#slReceiveItems').val('');
    $('#slPayItems').val('');
  });

  $('#btnSaveSlip').on('click', function (e) {
    e.preventDefault();
    var employee_id = $('#txtId').val();
    var year = $('#slYear').val();
    var month = $('#slMonth').val();

    if (!employee_id) {
      alert('กรุณาระบุรายละเอียดพนักงาน/เจ้าหน้าที่');
    } else if (!year || !month) {
      alert('กรุณาระบุเดือน/ปี');
    } else {
      var items = [];

      _.forEach(slip.items.receives, function (v) {
        var obj = {};
        obj.id = v.id;
        obj.money = v.money;
        items.push(obj);
      });

      _.forEach(slip.items.payments, function (v) {
        var obj = {};
        obj.id = v.id;
        obj.money = v.money;
        items.push(obj);
      });

      if (confirm('คุณต้องการบันทึกข้อมูล ใช่หรือไม่?')) {
        $.ajax({
          url: '/admin/slip',
          type: 'post',
          dataType: 'json',
          data: {
            employee_id: employee_id,
            month: month,
            year: year,
            items: JSON.stringify(items)
          }
        })
        .success(function (data) {
          if (data.ok) {
            location.href = '/admin/slip';
          } else {
            alert('เกิดข้อผิดพลาด: ' + JSON.stringify(data.msg));
          }
        })
        .error(function (xhr, status, error) {
          console.log(error);
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server');
        })
      }
    }
  });

});
