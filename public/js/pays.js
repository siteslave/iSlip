$(function() {

  $('[data-toggle="tooltip"]').tooltip();

  var items = {};

  items.setData = function(data) {
    $table = $('#tblList > tbody');
    $table.empty();
    if (_.size(data)) {
      _.forEach(data, function(v, i) {
        var html = '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + v.item_name + '</td>' +
          '<td style="text-align: right;"><div class="btn-group btn-group-sm">' +
          '<button class="btn btn-default btn-md" data-action="edit" data-name="' + v.item_name + '" data-id="' + v.item_id + '"><i class="fa fa-edit"></i></button>' +
          '<button class="btn btn-danger btn-md" data-action="remove" data-id="' + v.item_id + '"><i class="fa fa-trash-o"></i></button>' +
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

  items.all = function() {
    NProgress.start();
    $.get('/admin/items/pay/all')
      .success(function(data) {
        items.setData(data.rows);
        NProgress.done();
      })
      .error(function(xhr, status, error) {
        NProgress.done();
        console.log(error);
      })
  };

  $('#btnRefresh').on('click', function(e) {
    e.preventDefault();
    items.all();
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

    var itemName = $('#txtItemName').val();
    var itemId = $('#txtItemId').val();

    if (!itemName) {
      alert('กรุณาระบุชื่อรายจ่าย');
    } else {
      var data = {};
      data.name = itemName;
      data.id = itemId;

      $.ajax({
          url: '/admin/items/pay',
          type: 'POST',
          dataType: 'json',
          data: data
        })
        .success(function(data) {
          NProgress.done();
          if (data.ok) {
            alert('บันทึกรายการเสร็จเรียบร้อยแล้ว');
            $('#mdlNew').modal('hide');
            items.all();
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
    $('#txtItemName').val('');
    $('#txtItemId').val('');
  });

  $(document).on('click', 'button[data-action="edit"]', function(e) {
    e.preventDefault();

    var id = $(this).data('id');
    var name = $(this).data('name');

    $('#txtItemName').val(name);
    $('#txtItemId').val(id);

    $('#mdlNew').modal({
      backdrop: 'static'
    });
  });

  $(document).on('click', 'button[data-action="remove"]', function(e) {
    e.preventDefault();

    var id = $(this).data('id');
    if (confirm('คุณต้องการลบรายการนี้ ใช่หรือไม่?')) {
      $.ajax({
          url: '/admin/items/pay/' + id,
          type: 'DELETE'
        })
        .success(function(data) {
          if (data.ok) {
            items.all();
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
      $.ajax('/admin/items/pay/search/' + query)
        .success(function(data) {
          if (data.ok) {
            items.setData(data.rows);
          } else {
            alert('เกิดข้อผิดพลาด: ' + JSON.stringify(data.msg));
          }
        })
        .error(function(xhr, status, error) {
          alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
        })
    }
  });

  items.all();

});
