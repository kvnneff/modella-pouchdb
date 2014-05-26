# PouchDB

[PouchDB](http://pouchdb.com/) plugin for [modella](https://github.com/modella/modella).

## Installation

    npm install modella-pouchdb

## Example

```js
var model = require('modella'),
	pouch = require('modella-pouchdb'),
	PouchDB = require('pouchdb');

var UserDB = new PouchDB('Users');

var User = model('user')
  .attr('_id')
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

Initialize PouchDB adaptor with a PouchDB instance.

### Model.all(callback)

Get all models (static method)

### Model.find(id, callback)

Find a model (static method)

### model.save([options], callback)

Save the model (instance method)

### model.remove([options], callback)

Remove the model (instance method)

## License

GPL v2