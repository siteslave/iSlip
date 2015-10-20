var Q = require('q');
module.exports = {
    all: function (db) {
        var q = Q.defer();
        db('items')
          .where('item_type', 1)
            .orderBy('item_name', 'ASC')
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
        db('items')
            .insert({
                item_name: name,
                item_type: 1
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
        db('items')
            .update({
                item_name: name
            })
            .where('item_id', id)
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
        db('items')
            .where('item_name', 'like', '%' + name + '%')
            .where('item_type', 1)
            .then(function (rows) {
                q.resolve(rows);
            })
            .catch(function (err) {
                q.reject(err);
            });

        return q.promise;
    },

    remove: function (db, id) {
        var q = Q.defer();
        db('items')
            .where('item_id', id)
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
        db('items')
            .where({
                item_name: name,
                item_type: 1
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
