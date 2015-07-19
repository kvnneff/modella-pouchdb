# Modella-PouchDB
[![Build Status](https://travis-ci.org/staygrimm/modella-pouchdb.svg?branch=master)](https://travis-ci.org/staygrimm/modella-pouchdb)

[PouchDB](http://pouchdb.com/) plugin for [modella](https://github.com/modella/modella).

## Installation

Component:

    component install staygrimm/modella-pouchdb

npm:

	npm install modella-pouchdb

bower:
  bower install modella-pouchdb

## Example

```js
var model = require('modella');
var pouch = require('modella-pouchdb');
var PouchDB = require('pouchdb');

var UserDB = new PouchDB('Users');

var User = model('User')
  .attr('_id')
  .attr('name')
  .attr('email');

User.use(pouch(UserDB));

/**
 * Initialize
 */

var user = new User;

user.
	._id(new Date().toISOString())
    .name('foo')
    .email('foo@gmail.com');

user.save(function(err) {
  // do something
});
```

## API

### Pouch(instance)

Initialize adaptor with a PouchDB instance.

### Model.all(callback)

Get all models (static method)

### Model.find(id, callback)

Find a model (static method)

### Model.createDesignDoc(name, mapFunction, callback)

Create a design document and store it in PouchDB instance

### Model.query(name, options, callback)

Query view named `name`, with PouchDB `options`, returning `callback` with an error
or array of result docs

### model.save([options], callback)

Save the model (instance method)

### model.remove([options], callback)

Remove the model (instance method)


## Caveats

modella-pouchdb attaches a `_rev` attribute to every model.  This attribute is used and managed by the adaptor when updating documents in the database.  Note that if you modify this attribute on your models you will most likely encounter errors.

## Test

	npm install && make test

## License

MIT
