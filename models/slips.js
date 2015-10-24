var Q = require('q');
var moment = require('moment');

module.exports = {
  getMySlips: function(db, employee_id) {
    var q = Q.defer();
    var sql = 'select s.id, s.syear, s.smonth, s.updated_at,  ' +
      '( ' +
      '	select sum(sd.money)  ' +
      '	from slip_details as sd ' +
      '	inner join items as i on i.item_id=sd.item_id ' +
      ' 	where i.item_type="1" and sd.slip_id=s.id ' +
      ') as receive_total, ' +
      '( ' +
      '	select sum(sd.money)  ' +
      '	from slip_details as sd ' +
      '	inner join items as i on i.item_id=sd.item_id ' +
      '	where i.item_type="2" and sd.slip_id=s.id ' +
      ') as payment_total ' +
      'from slips as s  ' +
      'where s.employee_id=? order by concat(s.syear, s.smonth) desc';
    db.raw(sql, [employee_id])
      .then(function(rows) {
        q.resolve(rows[0]);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  all: function(db, year, month) {
    var q = Q.defer();
    var sql = 'select s.id, e.fullname, p.position_name, d.department_name, ' +
      's.syear, s.smonth, s.updated_at,  ' +
      '( ' +
      '	select sum(sd.money)  ' +
      '	from slip_details as sd ' +
      '	inner join items as i on i.item_id=sd.item_id ' +
      ' 	where i.item_type="1" and sd.slip_id=s.id ' +
      ') as receive_total, ' +
      '( ' +
      '	select sum(sd.money)  ' +
      '	from slip_details as sd ' +
      '	inner join items as i on i.item_id=sd.item_id ' +
      '	where i.item_type="2" and sd.slip_id=s.id ' +
      ') as payment_total ' +
      'from slips as s  ' +
      'left join employees as e on e.employee_id=s.employee_id ' +
      'left join positions as p on p.position_id=e.position_id ' +
      'left join departments as d on d.department_id=e.department_id ' +
      'where s.smonth=? and s.syear=?';
    db.raw(sql, [month, year])
      .then(function(rows) {
        q.resolve(rows[0]);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  removeSlip: function (db, id) {
    var q = Q.defer();
    db('slips')
    .where('id', id)
    .delete()
    .then(function () {
      q.resolve();
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  },

  removeSlipDetail: function (db, id) {
    var q = Q.defer();
    db('slip_details')
    .where('slip_id', id)
    .delete()
    .then(function () {
      q.resolve();
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  },

  save: function(db, employee_id, year, month) {
    var q = Q.defer();
    db('slips')
      .returning('id')
      .insert({
        employee_id: employee_id,
        syear: year,
        smonth: month,
        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      .then(function(rows) {
        q.resolve(rows);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },
  saveDetail: function(db, items) {
    var q = Q.defer();
    db('slip_details')
      .insert(items)
      .then(function() {
        q.resolve();
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  checkDuplicated: function(db, employee_id, year, month) {
    var q = Q.defer();
    db('slips')
      .where({
        employee_id: employee_id,
        syear: year,
        smonth: month
      })
      .count('* as total')
      .then(function(rows) {
        q.resolve(rows[0].total)
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  getMainDetail: function (db, id) {
    var q = Q.defer();
    var sql = 'select s.id, s.employee_id, e.cid, e.fullname, p.position_name, ' +
      'd.department_name, b.bank_name, left(e.account_no, 6) as account_no, s.syear, s.smonth ' +
      'from slips as s  ' +
      'left join employees as e on e.employee_id=s.employee_id ' +
      'left join positions as p on p.position_id=e.position_id ' +
      'left join departments as d on d.department_id=e.department_id ' +
      'left join banks as b on b.bank_id=e.bank_id ' +
      'where s.id=?';

    db.raw(sql, [id])
    .then(function (rows) {
      q.resolve(rows[0]);
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  },

  getItemsDetail: function (db, id) {
    var q = Q.defer();
    var sql = 'select s.item_id, i.item_name, s.money, i.item_type ' +
    'from slip_details as s ' +
    'left join items as i on i.item_id=s.item_id ' +
    'where s.slip_id=? order by s.money desc';

    db.raw(sql, [id])
    .then(function (rows) {
      q.resolve(rows[0]);
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  },

    removeOldDetail: function (db, id) {
      var q = Q.defer();
      db('slip_details')
      .where('slip_id', id)
      .delete()
      .then(function () {
        q.resolve();
      })
      .catch(function (err) {
        q.reject(err);
      });

      return q.promise;
    },

    updateSlip: function (db, id) {
      var q = Q.defer();
      db('slips')
      .where('id', id)
      .update({updated_at: moment().format('YYYY-MM-DD HH:mm:ss')})
      .then(function () {
        q.resolve();
      })
      .catch(function (err) {
        q.reject(err);
      });

      return q.promise;
    }
};
