const flagger = require('./index');
const Redis = require('redis');

//---------------------------------------------
console.log('SETUP OPTIONS')
//---------------------------------------------
//  instance      // Pass an already instantiated redis
//  host          // new Redis instance Host      (if no instance was setted)
//  port          // new Redis instance Port      (if no instance was setted)
//  db            // new Redis instance db        (if no instance was setted)
//  password      // new Redis instance Password  (if no instance was setted)
//  ttl           // Default ttl timespan
//  key_builder   // Key builder calculation function
//  key_prefix    // Key to be prepended to builded key
//---------------------------------------------
console.log(flagger.DEFAULT);
//---------------------------------------------

//---------------------------------------------
console.log('Creating redis connection');
//---------------------------------------------

flagger.setup({host:'127.0.0.1'});

const element = {foo:"bar"};

flagger.flag(element);

flagger.flagged(element).then(console.log); // true
flagger.flagged({zaraza:true}).then(console.log); // false
//---------------------------------------------



//---------------------------------------------
console.log('Passing an existing redis connection');
//---------------------------------------------

const instance = Redis.createClient({host:'127.0.0.1'});

flagger.setup({instance});

const element2 = {foo:"bar",bar:"foo"};

console.log('Flags an element for 90 seconds overriding default');
flagger.flag(element2,90);

flagger.flagged(element2).then(console.log); // true

flagger.unflag(element2);

flagger.flagged(element2).then(console.log); // false
//---------------------------------------------


//---------------------------------------------
console.log('Treating object or array order mistmatch');
//---------------------------------------------

const original = {foo:'bar',bar:'foo'};
const another = {bar:'foo',foo:'bar'};

console.log('Leads to different hash keys, so:')
flagger.flag(original);
flagger.flagged(another).then(console.log); // false

console.log('One Solution could be:');
flagger.flag(`${original.foo}:${original.bar}`);
flagger.flagged(`${another.foo}:${another.bar}`).then(console.log); // true

console.log('Or in equivalent and some agnostic way:');

const default_handler = flagger.DEFAULT.KEY_BUILDER;

flagger.setup({
  key_builder: ({foo,bar})=> default_handler(`${foo}:${bar}`)
});

flagger.flag(original);
flagger.flagged(another).then(console.log); // true