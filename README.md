# redis-flagger

A light weight library to perform content flagging using redis.

Ideal to be included in all kind of data streams, for example to prevent process something twice during a timespan window.

Install with:

    npm install redis-flagger

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

Options

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