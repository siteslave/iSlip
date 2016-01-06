var Q = require('q');
module.exports = {
  all: function (db) {
    var q = Q.defer();
    db('departments')
      .orderBy('department_name', 'ASC')
      .then(function (rows) {
        q.resolve(rows);
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  },
  save: function (db, name) {
    var q = Q.defer();
    db('departments')
      .insert({
        department_name: name
      })
      .then(function () {
        q.resolve();
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  },
  update: function (db, id, name) {
    var q = Q.defer();
    db('departments')
      .update({
        department_name: name
      })
      .where('department_id', id)
      .then(function () {
        q.resolve();
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  },

  search: function (db, name) {
    var q = Q.defer();
    db('departments')
      .where('department_name', 'like', '%' + name + '%')
      //    .toSQL();
      //console.log(sql);
      .then(function (rows) {
        console.log(rows);
        q.resolve(rows);
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  },

  remove: function (db, id) {
    var q = Q.defer();
    db('departments')
      .where('department_id', id)
      .delete()
      .then(function () {
        q.resolve();
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  },

  checkDuplicated: function (db, name) {
    var q = Q.defer();
    db('departments')
      .where({
        department_name: name
      })
      .count('* as total')
      .then(function (rows) {
        q.resolve(rows[0].total);
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  },

  checkDuplicatedUpdate: function (db, name, id) {
    var q = Q.defer();
    db('departments')
      .where('department_name', name)
      .whereNot('department_id', id)
      .count('* as total')
      .then(function (rows) {
        q.resolve(rows[0].total);
      })
      .catch(function (err) {
        q.reject(err);
      });

    return q.promise;
  }
};