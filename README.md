# PouchDB

[PouchDB](http://pouchdb.com/) plugin for [modella](https://github.com/modella/modella).

## Installation

Component:

    component install staygrimm/modella-pouchdb

npm:

	npm install modella-pouchdb

## Example

```js
var model = require('modella'),
	pouch = require('modella-pouchdb'),
	PouchDB = require('pouchdb');

var UserDB = new PouchDB('Users');

var User = model('user')
  .attr('_id') // not required if you'd rather PouchDB manage the creation of ids
  .attr('name')
  .attr('email')
  .attr('password');

User.use(pouchdb(UserDB));

/**
 * Initialize
 */

var user = new User;

user.
	.id(new Date().toISOString())
    .email('river.grimm@gmail.com')
    .password('test');

user.save(function(err) {
  console.log(user.toJSON());
});
```

## API

### Pouch(instance)

Initialize adaptor with a PouchDB instance.

### Model.all(callback)

Get all models (static method)

### Model.find(id, callback)

Find a model (static method)

### model.save([options], callback)

Save the model (instance method)

### model.remove([options], callback)

Remove the model (instance method)

## Caveats

modella-pouchdb attaches a `_rev` attribute every model.  This attribute is used and managed by the adaptor when updating documents in the database.  Note that if you modify that attribute on your models you will most likely encounter errors.

## Test

	npm install && make test

## License

GPL v2
