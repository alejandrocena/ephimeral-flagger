const Redis = require('ioredis');
const sha1 = require('sha1');

let redis;

const DEFAULT = {
  DB: 'ephemeral-flagger',
  TTL:60,
  KEY_BUILDER: payload => sha1(JSON.parse(payload)),
};

const setup = ({host,post,criteria=DEFAULT.KEY_BUILDER,db=DEFAULT.DB,ttl=DEFAULT.TTL,password}) => {
  DEFAULT.TTL = ttl;
  DEFAULT.KEY_BUILDER = criteria;
  redis = new Redis({host,port,db,password});
};

const create = (payload,{ttl=DEFAULT.TTL}) => {
  if(!redis) throw 'Connection was not Stablished';
  redis.set(DEFAULT.KEY_BUILDER(payload), 1, 'EX', ttl);
};

const already = (payload) => {
  if(!redis) throw 'Connection was not Stablished';
  return redis.exist(DEFAULT.KEY_BUILDER(payload));
};

module.export = {
  setup,
  create,
  already,
};