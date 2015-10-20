var express = require('express');
var department = require('../models/department');
var positions = require('../models/positions');
var banks = require('../models/banks');
var items = require('../models/items');
var employees = require('../models/employees');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'หน้าหลัก',
    activeMenu: 0
  });
});

router.get('/slip', function(req, res, next) {
  res.render('slip', {
    title: 'บันทึกเงินเดือน',
    activeMenu: 1
  });
});

router.get('/employees', function(req, res, next) {
  var db = req.db;
  var data = {};

  department.all(db)
    .then(function(rows) {
      data.departments = rows;
      return banks.all(db);
    })
    .then(function (rows) {
      data.banks = rows;
      return positions.all(db);
    })
    .then(function (rows) {
      data.positions = rows;
      res.render('employees', {
        title: 'ข้อมูลพนักงาน',
        activeMenu: 2,
        data: data
      });
    }, function(err) {
      res.send({ok: false, msg: err});
    });

});

router.get('/employees/all', function (req, res, next) {
  var db = req.db;
  employees.all(db)
  .then(function (rows) {
    res.send({ok: true, rows: rows})
  }, function (err) {
    res.send({ok: false, msg: err})
  })
})

router.post('/employees', function (req, res, next) {
  var db = req.db;
  var data = req.body;
  if (data.fullname && data.position && data.bank && data.accountNo && data.department) {
    var employee = {};
    employee.fullname = data.fullname;
    employee.position_id = data.position;
    employee.bank_id = data.bank;
    employee.account_no = data.accountNo;
    employee.department_id = data.department;
    employee.cid = data.cid;

    if (data.id) {
      // update
      employees.checkUpdateDuplicated(db, data.id, data.fullname)
      .then(function (total) {
        if (total) {
          res.send({ok: false, msg: 'ชื่อพนักงานนี้มีแล้วในระบบ'});
        } else {
          employees.update(db, data.id, employee)
          .then(function () {
            res.send({ok: true})
          }, function (err) {
            res.send({ok: false, msg: err})
          });
        }
      })
    } else {
      // insert
      employees.checkDuplicated(db, data.fullname)
      .then(function (total) {
        if (total) {
          res.send({ok: false, msg: 'ชื่อพนักงานนี้มีแล้วในระบบ'});
        } else {
          employees.save(db, employee)
          .then(function () {
            res.send({ok: true})
          }, function (err) {
            res.send({ok: false, msg: err})
          });
        }
      })
    }

  } else {
    res.send({ok: false, msg: 'ข้อมูลไม่สมบูรณ์ กรุณาตรวจสอบ'})
  }
});

router.get('/employees/search/:query', function (req, res, next) {
  var query = req.params.query;
  var db = req.db;

  employees.search(db, query)
  .then(function (rows) {
    res.send({ok: true, rows: rows});
  }, function (err) {
    res.send({ok: false, msg: err});
  })
});

router.get('/employees/filter/:id', function (req, res, next) {
  var depaertment_id = req.params.id;
  var db = req.db;

  employees.filter(db, depaertment_id)
  .then(function (rows) {
    res.send({ok: true, rows: rows});
  }, function (err) {
    res.send({ok: false, msg: err});
  })
});

router.get('/departments', function(req, res, next) {
  res.render('departments', {
    title: 'ข้อมูลแผนก',
    activeMenu: 3
  });
});

router.post('/departments', function(req, res, next) {
  if (req.body.name) {
    var db = req.db;
    console.log(req.body);

    department.checkDuplicated(db, req.body.name)
      .then(function(total) {
        if (total) {
          res.send({
            ok: false,
            msg: 'รายการซ้ำ'
          })
        } else {
          if (req.body.id) {
            console.log('update');
            department.update(db, req.body.id, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          } else {
            department.save(db, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          }

        }
      }, function(err) {
        console.log(err);
        res.send({
          ok: false,
          msg: err
        });
      });
  }

});

router.delete('/departments/:id', function(req, res, nex) {
  var id = req.params.id;

  if (id) {
    department.remove(req.db, id)
      .then(function() {
        res.send({
          ok: true
        });
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        });
      })
  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบรายการ'
    });
  }
});

router.get('/departments/all', function(req, res, next) {
  var db = req.db;
  department.all(db)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/departments/search/:query', function(req, res, next) {
  var db = req.db;
  department.search(db, req.params.query)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/positions', function(req, res, next) {
  res.render('positions', {
    title: 'ข้อมูลตำแหน่ง',
    activeMenu: 4
  });
});

router.post('/positions', function(req, res, next) {
  if (req.body.name) {
    var db = req.db;
    console.log(req.body);
    positions.checkDuplicated(db, req.body.name)
      .then(function(total) {
        if (total) {
          res.send({
            ok: false,
            msg: 'รายการซ้ำ'
          })
        } else {
          if (req.body.id) {
            console.log('update');
            positions.update(db, req.body.id, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          } else {
            positions.save(db, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          }

        }
      }, function(err) {
        console.log(err);
        res.send({
          ok: false,
          msg: err
        });
      });
  } else {
    res.send({ok: false, msg: 'ไม่พบข้อมูล'});
  }

});

router.delete('/positions/:id', function(req, res, nex) {
  var id = req.params.id;

  if (id) {
    positions.remove(req.db, id)
      .then(function() {
        res.send({
          ok: true
        });
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        });
      })
  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบรายการ'
    });
  }
});

router.get('/positions/all', function(req, res, next) {
  var db = req.db;
  positions.all(db)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/positions/search/:query', function(req, res, next) {
  var db = req.db;
  positions.search(db, req.params.query)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/banks', function(req, res, next) {
  res.render('banks', {
    title: 'ข้อมูลธนาคาร',
    activeMenu: 5
  });
});

router.post('/banks', function(req, res, next) {
  if (req.body.name) {
    var db = req.db;
    console.log(req.body);
    banks.checkDuplicated(db, req.body.name)
      .then(function(total) {
        if (total) {
          res.send({
            ok: false,
            msg: 'รายการซ้ำ'
          })
        } else {
          if (req.body.id) {
            console.log('update');
            banks.update(db, req.body.id, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          } else {
            banks.save(db, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          }

        }
      }, function(err) {
        console.log(err);
        res.send({
          ok: false,
          msg: err
        });
      });
  } else {
    res.send({ok: false, msg: 'ไม่พบข้อมูล'});
  }

});

router.delete('/banks/:id', function(req, res, nex) {
  var id = req.params.id;

  if (id) {
    banks.remove(req.db, id)
      .then(function() {
        res.send({
          ok: true
        });
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        });
      })
  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบรายการ'
    });
  }
});

router.get('/banks/all', function(req, res, next) {
  var db = req.db;
  banks.all(db)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/banks/search/:query', function(req, res, next) {
  var db = req.db;
  banks.search(db, req.params.query)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/items/receive', function(req, res, next) {
  res.render('receive_items', {
    title: 'รายได้',
    activeMenu: 6
  });
});

router.post('/items/receive', function(req, res, next) {
  if (req.body.name) {
    var db = req.db;
    items.checkDuplicated(db, req.body.name, 1)
      .then(function(total) {
        if (total) {
          res.send({
            ok: false,
            msg: 'รายการซ้ำ'
          })
        } else {
          if (req.body.id) {
            items.update(db, req.body.id, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          } else {
            item.save(db, req.body.name, 1)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          }

        }
      }, function(err) {
        console.log(err);
        res.send({
          ok: false,
          msg: err
        });
      });
  } else {
    res.send({ok: false, msg: 'ไม่พบข้อมูล'});
  }

});

router.delete('/items/receive/:id', function(req, res, nex) {
  var id = req.params.id;

  if (id) {
    items.remove(req.db, id)
      .then(function() {
        res.send({
          ok: true
        });
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        });
      })
  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบรายการ'
    });
  }
});

router.get('/items/receive/all', function(req, res, next) {
  var db = req.db;
  items.all(db, 1)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/items/receive/search/:query', function(req, res, next) {
  var db = req.db;
  items.search(db, req.params.query, 1)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/items/pay', function(req, res, next) {
  res.render('pay_items', {
    title: 'รายจ่าย',
    activeMenu: 7
  });
});

router.post('/items/pay', function(req, res, next) {
  if (req.body.name) {
    var db = req.db;
    items.checkDuplicated(db, req.body.name, 2)
      .then(function(total) {
        if (total) {
          res.send({
            ok: false,
            msg: 'รายการซ้ำ'
          })
        } else {
          if (req.body.id) {
            items.update(db, req.body.id, req.body.name)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          } else {
            items.save(db, req.body.name, 2)
              .then(function() {
                res.send({
                  ok: true
                });
              }, function(err) {
                console.log(err);
                res.send({
                  ok: false,
                  msg: err
                });
              });
          }

        }
      }, function(err) {
        console.log(err);
        res.send({
          ok: false,
          msg: err
        });
      });
  } else {
    res.send({ok: false, msg: 'ไม่พบข้อมูล'});
  }
});

router.delete('/items/pay/:id', function(req, res, nex) {
  var id = req.params.id;

  if (id) {
    items.remove(req.db, id)
      .then(function() {
        res.send({
          ok: true
        });
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        });
      })
  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบรายการ'
    });
  }
});

router.get('/items/pay/all', function(req, res, next) {
  var db = req.db;
  items.all(db, 2)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

router.get('/items/pay/search/:query', function(req, res, next) {
  var db = req.db;
  items.search(db, req.params.query, 2)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });
});

module.exports = router;
