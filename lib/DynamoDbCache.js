var AWS   = require('aws-sdk');
var types = require('dynamodb-data-types').AttributeValue;

module.exports = function(options) {
  
  var self = {};

  self.options = Object.assign({
    keyField:  'key',
    valField:  'val',
    dataRef:   'data',
    tableName: 'cache'
  }, options);

  var dynamodb = new AWS.DynamoDB(self.options.connection);  

  var mapKey = function(key, options) {
    if (typeof key === 'string' || typeof key === 'number') {
      var tmp = key;
      key = {}; 
      key[options.keyField] = tmp;
    }
    return types.wrap(key);
  }

  self.get = function(key, options, cb) {
    if (typeof options === 'function') {
      cb = options;
    }
  
    key = mapKey(key, self.options);
  
    var params = {
      TableName: self.options.tableName,
      Key: key
    }
  
    dynamodb.getItem(params, function(err, data) {
      if (err) cb(err, null); 
      else {
        if (data.Item) {
          var res = types.unwrap(data.Item);
          cb(null, res[self.options.valField][self.options.dataRef]);
        } else {
          cb(null)
        }
      }
    });
  };

  self.set = function(key, value, options, cb) {
    if (typeof options === 'function') {
      cb = options;
    }
    
    var val = {};
    val[self.options.valField] = {};
    val[self.options.valField][self.options.dataRef] = value;
    
    key = mapKey(key, self.options);
    val = types.wrap(val);
  
    var item = Object.assign(key, val);
  
    var params = {
      TableName: self.options.tableName,
      Item: item
    }
  
    dynamodb.putItem(params, function(err, data) {
      if (err) cb(err);
      else cb(null, data);
    });
  };

  self.del = function(key, options, cb) {
    if (typeof options === 'function') {
      cb = options;
    }
  
    key = mapKey(key, self.options);
  
    var params = {
      TableName: self.options.tableName,
      Key: key
    }
  
    dynamodb.deleteItem(params, function(err, data) {
      if (err) cb(err); 
      else cb(null, data);
    });
  };

  self.isCacheableValue = function(val) {
    return true;
  };

  self.getClient = function(cb) {
    return cb(null, {
      client: this
    })
  };

  return self;
} 

