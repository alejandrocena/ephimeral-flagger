const Redis = require('redis');
const sha1 = require('sha1');

let redis;

const DEFAULT = {
  DB: 0,
  PORT: 6379,
  PREFIX:'flagger::',
  TTL:0,
  KEY_BUILDER: payload => {
    return DEFAULT.PREFIX + sha1(JSON.stringify(payload))
  },
};

const setup = ({instance=null,host,port=DEFAULT.PORT,db=DEFAULT.DB,password='',ttl=DEFAULT.TTL,key_builder=DEFAULT.KEY_BUILDER,key_prefix=DEFAULT.PREFIX}) => {

  if(instance) {
    redis = instance;
  } else {
    redis = Redis.createClient({host,port,db,password});
  }

  DEFAULT.TTL = ttl;
  DEFAULT.KEY_BUILDER = key_builder;
  DEFAULT.PREFIX = key_prefix;
};

const flag = (payload,ttl=DEFAULT.TTL) => {
  if(!redis) throw 'Connection was not Stablished';
  const key = DEFAULT.KEY_BUILDER(payload);
  if (ttl>0) redis.set(key, 1, 'EX', ttl);
  else redis.set(key, 1);
};

const flagged = (payload) => {
  if(!redis) throw 'Connection was not Stablished';
  return new Promise(function(resolve,reject) {
    redis.exists(DEFAULT.KEY_BUILDER(payload),function (err,res) {
      if(err) reject(err)
      else resolve(res===1)
    })
  });
};

module.exports = {
  setup,
  flag,
  flagged,
};