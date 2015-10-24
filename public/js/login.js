$(function () {
  var login = {};

  login.doLogin = function (username, password) {
    NProgress.start();
    if (username && password) {
      $.ajax({
        url: '/users/login',
        type: 'post',
        data: {
          username: username,
          password: password
        }
      })
      .success(function (data) {
        console.log(data);
        if (data.ok) {
          window.location.href = '/';
        } else {
          $('#divAlert').fadeIn('slow');
          $('#txtMessage').text('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }

        NProgress.done();
      })
      .error(function (xhr, status, error) {
        NProgress.done();
        console.log(error);
        $('#divAlert').fadeIn('slow');
        $('#txtMessage').text('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server');
      })
    } else {
      NProgress.done();
      alert('กรุณาระบุชื่อผู้ใช้งาน และ รหัสผ่าน')
    }
  };

  $('#frmLogin').on('submit', function (e) {
    e.preventDefault();
    $('#divAlert').fadeOut();
    var username = $('#txtUsername').val();
    var password = $('#txtPassword').val();

    login.doLogin(username, password);
  });

  $('#btnHelp').on('click', function (e) {
    e.preventDefault();
    $('#mdlHelp').modal()
  })
})
