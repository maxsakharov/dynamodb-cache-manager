### Why?

Library is extenstion for [cache-manager](https://github.com/BryanDonovan/node-cache-manager). 
DynamoDB is not typical usecase for caches, but can be used as backing engine to store your cache or configuration.

### Usage

Regular usecase for that lib is to chain DynamoDB with memory cache. It will give you persistance layer + fast access. 
For example it can be used to load your application configuration dynamically from the DynamoDB. Here is example.

```
var Promise = require('bluebird');
var cacheManager = require('cache-manager');
var DynamoDB = require('dynamodb-cache-manager');

var memoryCache = cacheManager.caching({
  store: 'memory', 
  max: 100, 
  ttl: 10,
});

var dynamoDBCache = cacheManager.caching({
  store: DynamoDB, 
  tableName: 'tableName',
  keyField: 'key'.
  valField: 'cache',
  connection: {
    region: 'us-east-1'
  }
});

var memory = Promise.promisifyAll(memoryCache);
var dynamo = Promise.promisifyAll(dynamoDbCache);

dynamoDbCache.get('12345', (err, res) => {
  console.log(res);
});

var pollCache = () => {
  return memory.getAsync(key)
    .then(res => {
      if (res)  return res;
      else return dynamo.getAsync(key)
                  .then(res => memory.set(key, res))
                  .then(()  => memory.get(key));
    })
    .then((res) => {      
      console.log("Cache data: " + res);
      setTimeout(fn, 1000)
    })
    .catch(err => {
      console.error(err);
    });
}

pollCache();
```

Above example will poll DynamoDB every 10 seconds and store result in memory, so every time you access it it won't go to the database.

## TODO

* finish/fix docs
* figure our right wasy to utilize cache-mananger multicache


