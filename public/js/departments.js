$(function() {

  $('[data-toggle="tooltip"]').tooltip();

  var departments = {};

  departments.setData = function(data) {
    $table = $('#tblList > tbody');
    $table.empty();
    if (_.size(data)) {
      _.forEach(data, function(v, i) {
        var html = '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + v.department_name + '</td>' +
          '<td style="text-align: right;"><div class="btn-group btn-group-sm">' +
          '<button class="btn btn-default btn-md" data-action="edit" data-name="' + v.department_name + '" data-id="' + v.department_id + '"><i class="fa fa-edit"></i></button>' +
          '<button class="btn btn-danger btn-md" data-action="remove" data-id="' + v.department_id + '"><i class="fa fa-trash-o"></i></button>' +
          '</div></td>' +
          ' </tr>';
        $table.append(html);
      });
      $('[data-toggle="tooltip"]').tooltip();
    } else {
      var html = '<tr><td colspan="3">ไม่พบรายการ...</td> </tr>';
      $table.append(html);
    }

  };

  departments.all = function() {
    NProgress.start();
    $.get('/admin/departments/all')
      .success(function(data) {
        departments.setData(data.rows);
        NProgress.done();
      })
      .error(function(xhr, status, error) {
        NProgress.done();
        console.log(error);
      })
  };

  $('#btnRefresh').on('click', function(e) {
    e.preventDefault();
    departments.all();
  });

  $('#btnNew').on('click', function(e) {
    e.preventDefault();
    $('#mdlNew').modal({
      backdrop: 'static'
    })
  });

  $('#btnSave').on('click', function(e) {
    e.preventDefault();

    NProgress.start();

    var departmentName = $('#txtDepartmentName').val();
    var departmentId = $('#txtDepartmentId').val();

    if (!departmentName) {
      alert('กรุณาระบุชื่อแผนก');
    } else {
      var data = {};
      data.name = departmentName;
      data.id = departmentId;

      $.ajax({
          url: '/admin/departments',
          type: 'POST',
          dataType: 'json',
          data: data
        })
        .success(function(data) {
          NProgress.done();
          if (data.ok) {
            alert('บันทึกรายการเสร็จเรียบร้อยแล้ว');
            $('#mdlNew').modal('hide');
            departments.all();
          } else {
            console.log(data.msg);
            alert('ไม่สามารถบันทึกรายได้ได้ : ' + JSON.stringify(data.msg));
          }

        })
        .error(function(xhr, status, error) {
          NProgress.done();
          alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
          console.log('Status: ' + status + ', ' + error);
        })
    }
  });

  $('#mdlNew').on('hidden.bs.modal', function(e) {
    $('#txtDepartmentName').val('');
    $('#txtDepartmentId').val('');
  });

  $(document).on('click', 'button[data-action="edit"]', function(e) {
    e.preventDefault();

    var id = $(this).data('id');
    var name = $(this).data('name');

    $('#txtDepartmentName').val(name);
    $('#txtDepartmentId').val(id);

    $('#mdlNew').modal({
      backdrop: 'static'
    });
  });

  $(document).on('click', 'button[data-action="remove"]', function(e) {
    e.preventDefault();

    var id = $(this).data('id');
    if (confirm('คุณต้องการลบรายการนี้ ใช่หรือไม่?')) {
      $.ajax({
          url: '/admin/departments/' + id,
          type: 'DELETE'
        })
        .success(function(data) {
          if (data.ok) {
            departments.all();
          } else {
            alert('ไม่สามารถลบรายการได้: ' + JSON.stringify(data.msg));
          }
        })
        .error(function(xhr, status, error) {
          alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
        })
    }
  });

  $('#btnSearch').on('click', function(e) {
    e.preventDefault();
    var query = $('#txtQuery').val();

    if (query) {
      $.ajax('/admin/departments/search/' + query)
        .success(function(data) {
          if (data.ok) {
            departments.setData(data.rows);
          } else {
            alert('เกิดข้อผิดพลาด: ' + JSON.stringify(data.msg));
          }
        })
        .error(function(xhr, status, error) {
          alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
        })
    }
  });

  departments.all();


});
