const Redis = require('ioredis');
const sha1 = require('sha1');

let redis;

const DEFAULT = {
  DB: 0,
  PORT: 6379,
  PREFIX:'flagger::',
  TTL:60,
  KEY_BUILDER: payload => {
    return DEFAULT.PREFIX + sha1(JSON.stringify(payload))
  },
};

const setup = ({host,port=DEFAULT.PORT,db=DEFAULT.DB,password='',ttl=DEFAULT.TTL,key_builder=DEFAULT.KEY_BUILDER,key_prefix=DEFAULT.PREFIX}) => {
  DEFAULT.TTL = ttl;
  DEFAULT.KEY_BUILDER = key_builder;
  redis = new Redis({host,port,db,password});
  DEFAULT.PREFIX = key_prefix;
};

const flag = (payload,ttl=DEFAULT.TTL) => {
  if(!redis) throw 'Connection was not Stablished';
  redis.set(DEFAULT.KEY_BUILDER(payload), 1, 'EX', ttl);
};

const flagged = async (payload) => {
  if(!redis) throw 'Connection was not Stablished';
  return await redis.exists(DEFAULT.KEY_BUILDER(payload)).then(res => res === 1);
};

module.exports = {
  setup,
  flag,
  flagged,
};