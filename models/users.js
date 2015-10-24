var Q = require('q');
var crypto = require('crypto');

module.exports = {
  authClient: function (db, username, password) {
    var q = Q.defer();
    var sql = 'select * from employees ' +
      'where cid=? and right(replace(account_no, "-", ""), 4)=? ' +
      'limit 1';

    db.raw(sql, [username, password])
    .then(function (rows) {
      console.log(rows[0]);
      q.resolve(rows[0]);
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  },

  authAdmin: function (db, username, password) {
    var q = Q.defer();
    var password = crypto.createHash('md5').update(password).digest('hex');

    db('users')
    .where({
      username: username,
      password: password
    })
    .count('* as total')
    .then(function (rows) {
      console.log(rows);
      q.resolve(rows[0].total);
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  },

  checkOldAdminPass: function (db, oldPass) {
    var q = Q.defer();
    var password = crypto.createHash('md5').update(oldPass).digest('hex');

    db('users')
    .where({
      username: 'admin',
      password: password
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

  changeAdminPass: function (db, newPass) {
    var q = Q.defer();
    var password = crypto.createHash('md5').update(newPass).digest('hex');

    db('users')
    .where({
      username: 'admin'
    })
    .update({
      password: password
    })
    .then(function () {
      q.resolve();
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  }

};
