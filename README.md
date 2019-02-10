# redis-flagger

A light weight library to perform distributed content flagging backed by redis, limited or not to a time span window. 

Ideal to be included in all kind of data streams or cases like:

 * To preventing process something twice.
 * To filter a data stream to let only unique elements.
 * To be used as a distributed semaphore.
 * ... and all the cases that a distributed flag could be useful.

Install with:

    npm install redis-flagger --save

## ¿How it works?

### setup 
Before you can use it, you need to specify if library creates a new redis connection or it should use an already created one.
After that, you can override some default options letting you to control practically any behavior.

*Options:*

```js
//  instance      // Pass an already instantiated redis
//  host          // new Redis instance Host      (if no instance was setted)
//  port          // new Redis instance Port      (if no instance was setted)
//  db            // new Redis instance db        (if no instance was setted)
//  password      // new Redis instance Password  (if no instance was setted)
//  ttl           // Default ttl timespan
//  key_builder   // Key builder calculation function
//  key_prefix    // Key to be prepended to builded key
```

 *Default behavior:*

Redis flagger treats the element, in both *flag* and *flagged* endponts, as the same way. The main idea is to allways reach the same calculated redis key.

The calculating process, with default behavioral arguments, is the following...

To determine redis key flag, element is treated by *key_builder*. *key_builder* JSON encode it and then apply a *sha1* hashing algorithm to, no matter what kind of stuff element is, always have the same size key.
After that, *key_preffix* is prepended to that hash to improve redis key tracing. Both *key_builder* and *key_preffix* could be override it in setup options to fit any case you want.

*Considerations*

 * Flagged element could be anything (array, string, object, etc).
 * Note that differences in object atribute order or array elements order, could lead in different hashing results. So if you cannot enshure that this object are *EXACTLY* the same, you can create an string element representation for example:

*Considering..*
original and another and the same but order.
```js
const original = {foo:'bar',bar:'foo'};
const another = {bar:'foo',foo:'bar'};
```

Leads to different hash keys, so:
```js
flagger.flag(original);
flagger.flagged(another).then(console.log); // false
```

One Solution could be:

```js
flagger.flag(`${original.foo}:${original.bar}`);
flagger.flagged(`${another.foo}:${another.bar}`).then(console.log); // true
```

Or in some 'agnostic' way:

```js
const default_handler = flagger.DEFAULT.KEY_BUILDER;

flagger.setup({
  key_builder: ({foo,bar})=> default_handler(`${foo}:${bar}`)
});

flagger.flag(original);
flagger.flagged(another).then(console.log); // true
```


 

## Usage Example

Creating a redis connection:

```js
const flagger = require('redis-flagger');

flagger.setup({host:'127.0.0.1'});

const element = {foo:"bar"};

flagger.flag(element);

flagger.flagged(element).then(console.log); // true
flagger.flagged({zaraza:true}).then(console.log); // false
```

Or passing an existing one:

```js

const instance = Redis.createClient({host:'127.0.0.1'});

flagger.setup({instance});

const element2 = {foo:"bar",bar:"foo"};

// Flags an element for 90 seconds overriding default
flagger.flag(element2,90);

flagger.flagged(element2).then(console.log); // true
```