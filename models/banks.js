var Q = require('q');
module.exports = {
    all: function (db) {
        var q = Q.defer();
        db('banks')
            .orderBy('bank_name', 'ASC')
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
        db('banks')
            .insert({
                bank_name: name
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
        db('banks')
            .update({
                bank_name: name
            })
            .where('bank_id', id)
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
        db('banks')
            .where('bank_name', 'like', '%' + name + '%')
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
        db('banks')
            .where('bank_id', id)
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
        db('banks')
            .where({
                bank_name: name
            })
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
