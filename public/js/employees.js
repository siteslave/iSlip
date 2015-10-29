$(function () {
  var employees = {};

  employees.setData = function (data) {
    var $table = $('#tblList > tbody');
    $table.empty();

    if (_.size(data)) {
      _.forEach(data, function (v, i) {
        var html = '<tr>'+
          '<td>'+ (i+1) +'</td>' +
          '<td>'+ v.cid +'</td>' +
          '<td>'+ v.fullname +'</td>' +
          '<td>'+ v.position_name +'</td>' +
          '<td>'+ v.department_name +'</td>' +
          // '<td>'+ v.bank_name +'</td>' +
          '<td><div class="btn-group">' +
          '<button class="btn btn-default btn-xs" data-action="edit" data-id="'+v.employee_id+'" data-position="'+v.position_id+'" data-department="'+v.department_id+'" data-bank="'+v.bank_id+'" data-account="'+v.account_no+'" data-fullname="'+v.fullname+'" data-cid="'+v.cid+'"><i class="fa fa-edit"></i></button>'+
          '<button class="btn btn-danger btn-xs" data-action="remove" data-id="'+v.employee_id+'"><i class="fa fa-trash-o"></i></button>'+
          '</div></td>' +
        '</tr>';

        $table.append(html);
      })
    } else {
      var html = '<tr><td colspan="6">ไม่พบรายการ...</td></tr>';
      $table.append(html);
    }
  };

  employees.all = function () {
    NProgress.start();
    $.ajax('/admin/employees/all')
    .success(function (data) {
      employees.setData(data.rows);
      NProgress.done();
    })
    .error(function (xhr, status, error) {
      console.log(err);
      NProgress.done();
    })
  };

  employees.search = function (query) {
    NProgress.start();
    $.ajax('/admin/employees/search/' + query)
    .success(function (data) {
      employees.setData(data.rows);
      NProgress.done();
    })
    .error(function (xhr, status, error) {
      console.log(err);
      NProgress.done();
    })
  };

  employees.filter = function (department_id) {
    NProgress.start();
    $.ajax('/admin/employees/filter/' + department_id)
    .success(function (data) {
      employees.setData(data.rows);
      NProgress.done();
    })
    .error(function (xhr, status, error) {
      console.log(err);
      NProgress.done();
    })
  };

  $('#slDepartment').on('change', function () {
    var id = $(this).val();
    if (id) {
      employees.filter(id);
    } else {
      employees.all();
    }
  });

  $('#btnRefresh').on('click', function (e) {
    e.preventDefault();
    employees.all();
  });

  $('#btnSearch').on('click', function (e) {
    e.preventDefault();
    var query = $('#txtQuery').val();
    if (query) {
      employees.search(query);
    }
  })

  $('#btnNew').on('click', function (e) {
    e.preventDefault();

    $('#mdlNew').modal({
      backdrop: 'static'
    });

  });

  $('#mdlNew').on('hidden.bs.modal', function(e) {
    $('#txtFullName').val('');
    $('#txtId').val('');
    $('#txtCid').val('');
    $('#txtAccountNo').val('');
    $('#slNewDepartment').val('');
    $('#slBank').val('');
    $('#slPosition').val('');
  });

  $('#btnSave').on('click', function (e) {
    e.preventDefault();

    var data = {};
    data.id = $('#txtId').val();
    data.fullname = $('#txtFullName').val();
    data.cid = $("#txtCid").val();
    data.position = $('#slPosition').val();
    data.department = $('#slNewDepartment').val();
    data.bank = $('#slBank').val();
    data.accountNo = $('#txtAccountNo').val();

    if (!data.cid || !data.fullname || !data.position || !data.department || !data.bank || !data.accountNo) {
      alert('กรุณากรอกข้อมูลให้ครบ');
    } else {
      NProgress.start();
      $.ajax({
        url: '/admin/employees',
        type: 'POST',
        dataType: 'json',
        data: data
      })
      .success(function (data) {
        if (data.ok) {
          $('#mdlNew').modal('hide');
          NProgress.done();
          employees.all();
        } else {
          alert('ไม่สามารถบันทึกข้อมูลได้: ' + JSON.stringify(data.msg));
          NProgress.done();
        }
      })
      .error(function (xhr, status, err) {
        console.log(err);
        alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
      })
    }
  });

  //edit
  $(document).on('click', 'button[data-action="edit"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    var fullname = $(this).data('fullname');
    var department_id = $(this).data('department');
    var position_id = $(this).data('position');
    var bank_id = $(this).data('bank');
    var cid = $(this).data('cid');
    var accountNo = $(this).data('account');

    $('#txtFullName').val(fullname);
    $('#txtId').val(id);
    $('#txtCid').val(cid);
    $('#txtAccountNo').val(accountNo);
    $('#slNewDepartment').val(department_id);
    $('#slBank').val(bank_id);
    $('#slPosition').val(position_id);

    $('#mdlNew').modal({
      backdrop: 'static'
    });

  });
  
  $(document).on('click', 'button[data-action="remove"]', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    
    if (confirm('คุณต้องการลบรายการนี้ ใช่หรือไม่?')) {
      $.ajax({
        url: '/admin/employees/' + id,
        type: 'DELETE'
      })
      .success(function (data) {
        alert('ลบรายการเสร็จเรียบร้อยแล้ว');
        employees.all();
      })
      .error(function (xhr, status, err) {
        alert('ไม่สามารถลบรายการได้: ' + JSON.stringify(err));
      })
    }
  })

  employees.all();

})
