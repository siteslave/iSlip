$(function () {
  var slip = {};

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
          '<button class="btn btn-primary btn-xs" data-action="selected" data-bank="'+v.bank_name+'" data-account="'+v.account_no+'" data-id="'+v.employee_id+'" data-fullname="'+v.fullname+'" data-department="'+v.department_name+'" data-positon="'+v.position_name+'" data-cid="'+v.cid+'"><i class="fa fa-check-circle"></i></button>'+
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
  })
})
