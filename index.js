'use strict';

var debug = require('debug')('modella:pouchdb'),
    sync = {},
    pouch;

/**
 * Export `PouchDB`
 */

pouch = function pouch(db) {
    if (!db) {
        throw new TypeError('expected: PouchDB Instance');
    }

    return function (model) {
        model.db = db;
        model.update = sync.save;
        model.save = sync.save;
        model.remove = sync.remove;
        model.find = model.get = sync.find;
        model.query = sync.query;
        model.createDesignDoc = sync.createDesignDoc;
        model.all = sync.all;
        model.attr('_rev');

        if (!model.primaryKey) {
            model.attr('_id');
        }

        return model;
    };
};

/**
 * Save a model
 * @param  {Function} cb Callback function
 * @return {json}      JSON representation of the model
 */
sync.save = function save(cb) {
    var self = this,
        db = this.model.db,
        json = this.toJSON(),
        callback;

    debug('saving... %j', json);

    callback = function (err, res) {
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
    var json = this.toJSON(),
        db = this.model.db;

    debug('removing... %j', json);

    db.remove(json, function (err) {
        if (err) {
            return cb(err);
        }

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
    var self = this,
        db = this.db;

    debug('retrieving all models...');

    db.allDocs({include_docs: true}, function (err, res) {
        if (err) {
            return cb(err);
        }

        var i = res.rows.length,
            models = [];

        while (i--) {
            models.push(new self(res.rows[i].doc));
        }

        return cb(null, models);
    });
};

/**
 * Find a model by its id
 * @param  {String|Number}   id Model id
 * @param  {Function} cb Callback function
 * @return {Object}      Returns an instance of model
 */
sync.find = function find(id, cb) {
    var self = this,
        db = this.db;

    db.get(id, function (err, doc) {
        if (err) {
            return cb(err);
        }

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

module.exports = pouch;