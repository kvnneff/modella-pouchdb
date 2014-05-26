/*global describe, before, it, should*/

'use strict';

var PouchDB = require('pouchdb'),
    model = require('modella'),
    adaptor = require('..'),
    User,
    user,
    pouch;

pouch = new PouchDB('users');

User = model('User')
    .attr('name')
    .attr('nick')
    .attr('_id');

User.use(adaptor(pouch));

describe('modella PouchDB', function () {
    after(function () {
        return pouch.destroy();
    });

    describe('sync layer operations', function () {
        it('defines the required sync layer operations', function (done) {
            User.save.should.be.a.function;
            User.update.should.be.a.function;
            User.remove.should.be.a.function;
            User.find.should.be.a.function;
            User.get.should.be.a.function;
            User.all.should.be.a.function;
            done();
        });
    });

    describe('save', function () {
        it('should save the model', function (done) {
            user = new User();
            user.name('foo');
            user.nick('baz');
            user.save(function (err, res) {
                user.primary().should.be.ok;
                res.should.be.ok;
                pouch.get(user.primary(), function (err, doc) {
                    doc.should.be.ok;
                    doc.should.have.property('name', 'foo');
                    doc.should.have.property('nick', 'baz');
                    done();
                });
            });
        });
    });

    describe('update', function () {
        it('should update the model', function (done) {
            user = new User({name: 'foo', nick: 'baz'});
            user.save(function (err, res) {
                user.primary().should.be.ok;
                user.name('bar');
                user.save(function (err, res) {
                    user.primary().should.be.ok;
                    res.should.be.ok;
                    pouch.get(user.primary(), function (err, doc) {
                        doc.should.be.ok;
                        doc.should.have.property('name', 'bar');
                        doc.should.have.property('nick', 'baz');
                        done();
                    });
                });
            });
        });
    });

    describe('get', function () {
        var user;

        before(function (done) {
            user = new User({name: 'chewie', nick: 'dobs'});
            user.save(function (err, res) {
                user.primary().should.be.ok;
                res.should.be.ok;
                done();
            });
        });

        it('should work with the oid as a string', function (done) {
            var id = user.primary();

            User.get(id, function (err, model) {
                if (err) {
                    return done(err);
                }
                model.name().should.equal(user.name());
                user.name().should.equal('chewie');
                done();
            });
        });
    });

    describe('all', function () {
        it('should get all models', function (done) {
            User.all(function (err, users) {
                (err === null).should.be.true;
                users.should.have.length(3);
                users[0].should.be.an.instanceof(User);
                done();
            });
        });
    });

    describe('remove', function () {
        it('should remove the model from the db', function (done) {
            user = new User({name: 'foo', nick: 'baz'});
            user.save(function (err, res) {
                user.primary().should.be.ok;
                res.should.be.ok;
                user.remove(function (err) {
                    (err === null).should.be.true;
                    pouch.get(user.primary(), function (err, doc) {
                        (doc === undefined).should.be.true;
                        err.should.be.ok;
                        err.should.have.property('message', 'deleted');
                        done();
                    });
                });
            });
        });
    });
});