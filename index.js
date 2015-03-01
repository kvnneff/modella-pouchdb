'use strict';

var debug = require('debug')('modella:pouchdb');
var sync = {};
var Pouch;

/**
 * Export `PouchDB`
 */

Pouch = function Pouch(db) {
    if (!db) throw new TypeError('expected: PouchDB Instance');
    return function (model) {
        for (var key in sync) {
            model[key] = sync[key]
        }
        model.db = db;
        model.attr('_rev');
        model.attr('_id');
        model.get = model.find;
        model.update = model.save;

        return model;
    };
};

/**
 * Save a model
 * @param  {Function} cb Callback function
 * @return {json}      JSON representation of the model
 */
sync.save = function save(cb) {
    var self = this;
    var db = this.model.db;
    var json = this.toJSON();

    debug('saving... %j', json);

    function callback(err, res) {
        if (err) {
            return cb(err);
        }

        self.primary(res.id);
        self._rev(res.rev);

        debug('saved %j', json);

        return cb(null, self.toJSON());
    };

    if (!this.primary()) {
        db.post(json, callback);
    } else {
        db.put(json, callback);
    };
};

/**
 * Remove a model
 * @param  {Function} cb Callback function
 * @return {null}      Returns null on success
 */
sync.remove = function remove(cb) {
    var json = this.toJSON();
    var db = this.model.db;

    debug('removing... %j', json);

    db.remove(json, function (err) {
        if (err) return cb(err);
        debug('removed %j', json);
        return cb(null);
    });
};

/**
 * Retrieve all models
 * @param  {Function} cb Callback function
 * @return {Array}      Returns an array of models
 */
sync.all = function all(cb) {
    var self = this;
    var db = this.db;

    debug('retrieving all models...');

    db.allDocs({include_docs: true}, function (err, res) {
        if (err) return cb(err);
        var collection = []
        res.rows.forEach(function (row) {
            if (row.doc._id.substring(0, 6) !== '_design') {
                collection.push(new self(row.doc));
            }
        });
        return cb(null, collection);
    });
};

/**
 * Find a model by its id
 * @param  {String|Number}   id Model id
 * @param  {Function} cb Callback function
 * @return {Object}      Returns an instance of model
 */
sync.find = function find(id, cb) {
    var self = this;
    var db = this.db;

    db.get(id, function (err, doc) {
        if (err) return cb(err);
        return cb(null, new self(doc));
    });
};

/**
 * Simple helper for creating and storing design docs.
 * @param  {String} name
 * @param  {Function} mapFunction
 * @return {Object}
 * @api public
 */
sync.createDesignDoc = function createDesignDoc(name, mapFunction, cb) {
    var db = this.db;
    var designDoc = {
        _id: '_design/' + name,
        views: {}
    };
    designDoc.views[name] = {map: mapFunction.toString()};
    db.put(designDoc, function (err, res) {
        if (err) return cb(err);
        return cb(null, res);
    });
};

/**
 * Perform a query and return the results
 * @param  {String}   name    Query name
 * @param  {Object}   options PouchDB options object
 * @param  {Function} cb      Callback
 * @return {Array}           Returns collection
 * @api public
 */
sync.query = function query(name, options, cb) {
    options = options || {};
    var self = this;
    var db = this.db;
    var collection = [];
    options.include_docs = true;
    db.query(name, options, function (err, res) {
        if (err) return cb(err);
        res.rows.forEach(function (doc) {
            collection.push(new self(doc.doc));
        });
        return cb(null, collection);
    });
};

/**
 * Expose `Pouch`
 */
module.exports = Pouch;