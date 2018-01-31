var DynamoDbCache = require('./lib/DynamoDbCache');

module.exports = {
  create: function(args) {
    return new DynamoDbCache(args);
  }
};