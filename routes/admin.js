var express = require('express');
var _ = require('lodash');
var numeral = require('numeral');

var department = require('../models/department');
var positions = require('../models/positions');
var banks = require('../models/banks');
var items = require('../models/items');
var employees = require('../models/employees');
var slips = require('../models/slips');
var users = require('../models/users');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index_admin', {
    title: 'หน้าหลัก',
    activeMenu: 0
  });
});

router.get('/slip', function(req, res, next) {
  res.render('slip', {
    title: 'รายการสลิปย้อนหลัง',
    activeMenu: 1
  });
});

router.get('/slip/all/:y/:m', function(req, res, next) {
  var db = req.db;
  var smonth = req.params.m;
  var syear = req.params.y;
  console.log(req.params);
  slips.all(db, syear, smonth)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      })
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      })
    })
});

router.delete('/slip/:id', function(req, res, next) {
  var id = req.params.id;
  var db = req.db;

  if (!id) {
    res.send({
      ok: false,
      msg: 'กรุณาระบุรายการที่ต้องการลบ'
    })
  } else {
    slips.removeSlip(db, id)
      .then(function() {
        return slips.removeSlipDetail(db, id);
      })
      .then(function() {
        res.send({
          ok: true
        })
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        })
      })
  }
});

router.get('/slip/edit/:id', function(req, res, next) {
  var db = req.db;
  var data = {};
  var id = req.params.id;

  if (id) {
    items.all(db, 1)
      .then(function(rows) {
        data.receive_items = rows;
        return items.all(db, 2);
      })
      .then(function(rows) {
        data.pay_items = rows;
        return slips.getMainDetail(db, id)
      })
      .then(function(rows) {
        if (_.size(rows)) {
          data.detail = rows[0];
          data.id = id;

          res.render('slip_edit', {
            title: 'บันทึกสลิปเงินเดือน',
            activeMenu: 1,
            data: data
          });
        } else {
          res.send({ok: false, msg: 'ไม่พบรายการ'})
        }
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        });
      });
  } else {
    res.send({
      ok: false,
      msg: 'กรุณาเลือกรายการที่ต้องการแก้ไข'
    })
  }

});

router.get('/slip/items/detail/:id', function(req, res, next) {
  var db = req.db;
  var id = req.params.id;

  if (id) {
    slips.getItemsDetail(db, id)
      .then(function(rows) {
        var items = {};
        items.receives = [];
        items.payments = [];

        _.forEach(rows, function(v) {
          if (v.item_type == 1) {
            var obj = {};
            obj.id = v.item_id;
            obj.type = v.item_type;
            obj.name = v.item_name;
            obj.money = parseFloat(v.money);
            items.receives.push(obj);
          }
          if (v.item_type == 2) {
            var obj = {};
            obj.id = v.item_id;
            obj.type = v.item_type;
            obj.name = v.item_name;
            obj.money = parseFloat(v.money);
            items.payments.push(obj);
          }
        });

        res.send({
          ok: true,
          rows: items
        })
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        })
      });
  } else {
    res.send({
      ok: false,
      msg: 'กรุณาระบุรหัส slip'
    })
  }
});

router.get('/slip/new', function(req, res, next) {
  var db = req.db;
  var data = {};

  items.all(db, 1)
    .then(function(rows) {
      data.receive_items = rows;
      return items.all(db, 2);
    })
    .then(function(rows) {
      data.pay_items = rows;
      res.render('slip_new', {
        title: 'บันทึกสลิปเงินเดือน',
        activeMenu: 1,
        data: data
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });

});

router.put('/slip', function(req, res, next) {
  var db = req.db;
  var data = req.body;
  var slipItems = JSON.parse(data.items);

  if (data.id && _.size(items)) {
    slips.removeOldDetail(db, data.id)
      .then(function() {
        var items = [];
        _.forEach(slipItems, function(v) {
          var obj = {};
          obj.slip_id = data.id;
          obj.item_id = parseInt(v.id);
          obj.money = parseFloat(v.money);
          items.push(obj);
        });
        // // Save detail
        slips.saveDetail(db, items)
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

      }, function(err) {
        res.send({
          ok: false,
          msg: err
        })
      })
  } else {
    res.send({
      ok: false,
      msg: 'ข้อมูลไม่สมบูรณ์ กรุณาตรวจสอบ'
    })
  }
});

router.post('/slip', function(req, res, next) {
  var db = req.db;
  var data = req.body;

  if (data.employee_id && data.month && data.year && _.size(data.items)) {
    // check duplicated
    slips.checkDuplicated(db, data.employee_id, data.year, data.month)
      .then(function(total) {
        if (total > 0) {
          res.send({
            ok: false,
            msg: 'รายการนี้ซ้ำ ไม่สามารถบันทึกได้'
          });
        } else {
          slips.save(db, data.employee_id, data.year, data.month)
            .then(function(rows) {
              var slip_id = rows[0];
              var slipItems = JSON.parse(data.items);
              var items = [];
              _.forEach(slipItems, function(v) {
                var obj = {};
                obj.slip_id = slip_id;
                obj.item_id = parseInt(v.id);
                obj.money = parseFloat(v.money);
                items.push(obj);
              });
              // // Save detail
              slips.saveDetail(db, items)
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

            }, function(err) {
              console.log(err);
              res.send({
                ok: false,
                msg: err
              });
            })
        }
      }, function(err) {
        res.send({
          ok: false,
          msg: err
        })
      });

  } else {
    res.send({
      ok: false,
      msg: 'ข้อมูลไม่สมบูรณ์'
    })
  }
});

router.get('/employees', function(req, res, next) {
  var db = req.db;
  var data = {};

  department.all(db)
    .then(function(rows) {
      data.departments = rows;
      return banks.all(db);
    })
    .then(function(rows) {
      data.banks = rows;
      return positions.all(db);
    })
    .then(function(rows) {
      data.positions = rows;
      res.render('employees', {
        title: 'ข้อมูลพนักงาน',
        activeMenu: 2,
        data: data
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      });
    });

});

router.get('/employees/all', function(req, res, next) {
  var db = req.db;
  employees.all(db)
    .then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      })
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      })
    })
});

router.delete('/employees/:id', function (req, res, next) {
  var db = req.db;
  var id = req.params.id;
  var ids = [];
  // Get slips ids
  employees.getSlipIds(db, id)
    .then(function (rows) {
      _.forEach(rows, function (v) {
        ids.push(v.id);
      });
      return employees.remove(db, id);
    })
    .then(function () {
      return employees.removeSlipHistory(db, id);
    })
    .then(function () {
      console.log(ids);
      return employees.removeSlipDetailHistory(db, ids);
    })
    .then(function () {
      res.send({ok: true});
    }, function (err) {
      res.send({ok: false, msg: err});
    });
    
    
});

router.post('/employees', function(req, res, next) {
  var db = req.db;
  var data = req.body;
  if (data.fullname && data.cid && data.position && data.bank && data.accountNo && data.department) {
    var employee = {};
    employee.fullname = data.fullname;
    employee.position_id = data.position;
    employee.bank_id = data.bank;
    employee.account_no = data.accountNo;
    employee.department_id = data.department;
    employee.cid = data.cid;

    if (data.id) {
      // update
      employees.checkUpdateDuplicated(db, data.id, data.cid)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'มีเลขบัตรประจำตัวประชาชนนี้ ในระบบแล้ว'
            });
          } else {
            employees.update(db, data.id, employee)
              .then(function() {
                res.send({
                  ok: true
                })
              }, function(err) {
                res.send({
                  ok: false,
                  msg: err
                })
              });
          }
        })
    } else {
      // insert
      employees.checkDuplicated(db, data.cid)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'มีเลขบัตรประจำตัวประชาชนนี้ ในระบบแล้ว'
            });
          } else {
            employees.save(db, employee)
              .then(function() {
                res.send({
                  ok: true
                })
              }, function(err) {
                res.send({
                  ok: false,
                  msg: err
                })
              });
          }
        })
    }

  } else {
    res.send({
      ok: false,
      msg: 'ข้อมูลไม่สมบูรณ์ กรุณาตรวจสอบ'
    })
  }
});

router.get('/employees/search/:query', function(req, res, next) {
  var query = req.params.query;
  var db = req.db;

  employees.search(db, query)
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
    })
});

router.get('/employees/filter/:id', function(req, res, next) {
  var depaertment_id = req.params.id;
  var db = req.db;

  employees.filter(db, depaertment_id)
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
    })
});

router.get('/departments', function(req, res, next) {
  res.render('departments', {
    title: 'ข้อมูลแผนก',
    activeMenu: 3
  });
});

router.post('/departments', function(req, res, next) {

  var name = req.body.name;
  var id = req.body.id;
  var db = req.db;

  if (name) {

    if (id) {
      department.checkDuplicatedUpdate(db, name, id)
        .then(function (total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            department.update(db, id, name)
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
        }, function (err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        })
    } else {
      department.checkDuplicated(db, name)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            department.save(db, name)
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
        }, function(err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        });
    }

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

  var db = req.db;
  var name = req.body.name;
  var id = req.body.id;

  if (name) {
    if (id) {
      positions.checkUpdateDuplicated(db, id, name)
        .then(function (total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            positions.update(db, id, name)
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
        }, function (err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        })
    } else {
      positions.checkDuplicated(db, name)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            positions.save(db, name)
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
        }, function(err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        });
    }

  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบข้อมูล'
    });
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
  var db = req.db;
  var name = req.body.name;
  var id = req.body.id;

  if (name) {
    if (id) {
      banks.checkUpdateDuplicated(db, id, name)
        .then(function (total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            banks.update(db, id, name)
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
        }, function (err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        })
    } else {

      banks.checkDuplicated(db, req.body.name)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
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
        }, function(err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        });

    }

  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบข้อมูล'
    });
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

  var db = req.db;
  var name = req.body.name;
  var id = req.body.id;

  if (name) {

    if (id) {
      items.checkUpdateDuplicated(db, id, name, 1)
        .then(function (total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            items.update(db, id, name)
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
        }, function (err) {
          res.send({
            ok: false,
            msg: err
          });
        })
    } else {
      items.checkDuplicated(db, id, name, 1)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            items.save(db, name, 1)
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
        }, function(err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        });
    }

  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบข้อมูล'
    });
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

  var db = req.db;
  var name = req.body.name;
  var id = req.body.id;

  if (name) {

    if (id) {
      items.checkUpdateDuplicated(db, id, name, 2)
        .then(function (total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            items.update(db, id, name)
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
        }, function (err) {
          res.send({
            ok: false,
            msg: err
          });
        })
    } else {
      items.checkDuplicated(db, id, name, 2)
        .then(function(total) {
          if (total) {
            res.send({
              ok: false,
              msg: 'รายการซ้ำ'
            })
          } else {
            items.save(db, name, 2)
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
        }, function(err) {
          console.log(err);
          res.send({
            ok: false,
            msg: err
          });
        });
    }

  } else {
    res.send({
      ok: false,
      msg: 'ไม่พบข้อมูล'
    });
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

router.get('/changepass', function (req, res, next) {
  res.render('admin_change_pass');
});

router.post('/changepass', function (req, res, next) {
  var db = req.db;
  var oldPass = req.body.oldPass;
  var newPass = req.body.newPass;

  if (!oldPass || !newPass) {
    res.render('admin_change_pass', {error: true, msg: 'ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบ'})
  } else {
    users.checkOldAdminPass(db, oldPass)
    .then(function (total) {
      if (total > 0) {
        // changepass
        users.changeAdminPass(db, newPass)
        .then(function () {
          req.session.destroy(function () {
            res.redirect('/users/admin/login');
          });
        }, function (err) {
          console.log(err);
          res.render('admin_change_pass', {error: true, msg: "เกิดข้อผิดพลาดฝั่ง Server ไม่สามารถแก้ไขได้"})
        })
      } else {
        res.render('admin_change_pass', {error: true, msg: 'รหัสผ่านเดิม ไม่ถูกต้อง'});
      }
    })
  }
})

module.exports = router;
