var Q = require('q');
module.exports = {
  all: function(db) {
    var q = Q.defer();
    db('employees as e')
      .select('e.cid', 'e.employee_id', 'p.position_name', 'b.bank_name', 'd.department_name',
      'e.department_id', 'e.position_id', 'e.bank_id', 'e.account_no', 'e.fullname')
      .leftJoin('positions as p', 'p.position_id', 'e.position_id')
      .leftJoin('banks as b', 'b.bank_id', 'e.bank_id')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .orderBy('e.fullname', 'ASC')
      .then(function(rows) {
        q.resolve(rows);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },
  save: function(db, data) {
    var q = Q.defer();
    db('employees')
      .insert(data)
      .then(function() {
        q.resolve();
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },
  update: function(db, id, data) {
    var q = Q.defer();
    db('employees')
      .update(data)
      .where('employee_id', id)
      .then(function() {
        q.resolve();
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  search: function(db, name) {
    var q = Q.defer();
    db('employees as e')
      .select('e.cid', 'e.employee_id', 'p.position_name', 'b.bank_name', 'd.department_name',
      'e.department_id', 'e.position_id', 'e.bank_id', 'e.account_no', 'e.fullname')
      .leftJoin('positions as p', 'p.position_id', 'e.position_id')
      .leftJoin('banks as b', 'b.bank_id', 'e.bank_id')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .where('e.fullname', 'like', '%' + name + '%')
      .orderBy('e.fullname', 'ASC')
      .then(function(rows) {
        q.resolve(rows);
      })
      .catch(function(err) {
        q.reject(err);
      });


    return q.promise;
  },

  filter: function(db, department_id) {
    var q = Q.defer();
    db('employees as e')
      .select('e.cid', 'e.employee_id', 'p.position_name', 'b.bank_name', 'd.department_name',
      'e.department_id', 'e.position_id', 'e.bank_id', 'e.account_no', 'e.fullname')
      .leftJoin('positions as p', 'p.position_id', 'e.position_id')
      .leftJoin('banks as b', 'b.bank_id', 'e.bank_id')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .where('e.department_id', department_id)
      .orderBy('e.fullname', 'ASC')
      .then(function(rows) {
        q.resolve(rows);
      })
      .catch(function(err) {
        q.reject(err);
      });


    return q.promise;
  },

  remove: function(db, id) {
    var q = Q.defer();
    db('employees')
      .where('employee_id', id)
      .delete()
      .then(function() {
        q.resolve();
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  checkUpdateDuplicated: function(db, id, name) {
    var q = Q.defer();
    db('employees')
      .where({
        fullname: name
      })
      .whereNot('employee_id', id)
      .count('* as total')
      .then(function(rows) {
        q.resolve(rows[0].total);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  },

  checkDuplicated: function(db, name) {
    var q = Q.defer();
    db('employees')
      .where({
        fullname: name
      })
      .count('* as total')
      .then(function(rows) {
        q.resolve(rows[0].total);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  }
};
