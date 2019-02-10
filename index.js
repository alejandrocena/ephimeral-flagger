const Redis = require('redis');
const sha1 = require('sha1');

let redis;
let KEY_BUILDER;
let TTL;
let PREFIX;

const DEFAULT = {
  DB: 0,
  PORT: 6379,
  PREFIX:'flagger::',
  TTL:0,
  KEY_BUILDER: payload => {
    return PREFIX + sha1(JSON.stringify(payload))
  },
};

const setup = ({
    instance=null,
    host,
    port=DEFAULT.PORT,
    db=DEFAULT.DB,
    password='',
    ttl=DEFAULT.TTL,
    key_builder=DEFAULT.KEY_BUILDER,
    key_prefix=DEFAULT.PREFIX
  }) => {

  if(instance) {
    redis = instance;
  } else {
    redis = Redis.createClient({host,port,db,password});
  }

  TTL = ttl;
  KEY_BUILDER = key_builder;
  PREFIX = key_prefix;
};

const flag = (payload,ttl=TTL) => {
  if(!redis) throw 'Connection was not Stablished';
  const key = KEY_BUILDER(payload);
  if (ttl>0) redis.set(key, 1, 'EX', ttl);
  else redis.set(key, 1);
};

const flagged = (payload) => {
  if(!redis) throw 'Connection was not Stablished';
  return new Promise((resolve,reject) => {
    redis.exists(KEY_BUILDER(payload),(err,res) => {
      if(err) reject(err);
      else resolve(res===1)
    })
  });
};

const unflag = (payload) => {
  if(!redis) throw 'Connection was not Stablished';
  return new Promise((resolve,reject) => {
    redis.del(KEY_BUILDER(payload),(err,res) => {
      if(err) reject(err);
      else resolve(res===1)
    })
  });
};

module.exports = {
  DEFAULT,
  setup,
  flag,
  flagged,
  unflag
};