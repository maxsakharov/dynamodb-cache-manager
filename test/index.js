var path     = require('path');
var should   = require('should');
var sinon    = require('sinon');
var proxyquire = require('proxyquire');
var DynamoDbCache  = require(path.resolve('./lib/DynamoDbCache'));

function createSubject(options, funcName, cb) {
  var stubs = {
    'aws-sdk': {
      'DynamoDB': function(args) {
        self = {};
        self.options = args;
        self[funcName] = cb;
        return self;
      }
    }
  };

  var DynamoDbCache = proxyquire(path.resolve('./lib/DynamoDbCache'), stubs);
  return new DynamoDbCache(options || {});
}

describe('DynamoDbCache', () => {

  context('set', () => {

    it('should store cache with string key and default property settings when no such provided', () => {

      var cbStub = sinon.stub();
      var subject = createSubject({}, 'putItem', function(params, cb) { 
        cbStub(params); 
        cb(null, 'Done');             
      });

      return subject.set('42', 'My answer is ...', function(err, res) {
        (err === null).should.be.true();  
        
        res.should.equal('Done');

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('cache');
        cbStub.getCall(0).args[0].Item.key.S.should.equal('42');
        cbStub.getCall(0).args[0].Item.val.M.data.S.should.equal('My answer is ...');
      });

    });
    
    it('should store cache with string key', () => {

      var cbStub = sinon.stub();  
      var options = {
        'tableName': 'test',
        'keyField': 'id',
        'valField': 'config'
      };
      var subject = createSubject(options, 'putItem', function(params, cb) { 
          cbStub(params); 
          cb(null, 'Done');             
      });    

      return subject.set('42', 'My answer is ...', function(err, res) {
        (err === null).should.be.true();  

        res.should.equal('Done');

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('test');
        cbStub.getCall(0).args[0].Item.id.S.should.equal('42');
        cbStub.getCall(0).args[0].Item.config.M.data.S.should.equal('My answer is ...');
      });

    });

    it('should store cache with object key and value', () => {

      var cbStub = sinon.stub();
      var options = {
        'tableName': 'test',
        'keyField': 'id',
        'valField': 'config'
      };
      var subject = createSubject(options, 'putItem', function(params, cb) { 
          cbStub(params); 
          cb(null, 'Done');             
      });

      return subject.set({'id': 42, 'environemnt': 'dev'}, {'key': 'the answer'}, function(err, res) {
        (err === null).should.be.true();  

        res.should.equal('Done');
        
        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('test');
        cbStub.getCall(0).args[0].Item.id.N.should.equal('42');
        cbStub.getCall(0).args[0].Item.environemnt.S.should.equal('dev');
        cbStub.getCall(0).args[0].Item.config.M.data.M.key.S.should.deepEqual('the answer');
      });
    });

  });

  context('get', () => {

    it('should retrieve cache with string key and default property settings when no such provided', () => {

      var cbStub = sinon.stub();
      var subject = createSubject({}, 'getItem', function(params, cb) { 
        cbStub(params); 
        cb(null, { 
          Item: {
            'key': {
              'N':'42'
            },
            'val': {
              'M': { 'data': { 'M': { 'key': { 'S': 'val' }}}}
            }
          }
        });             
      });

      return subject.get('42', function(err, res) {
        (err === null).should.be.true();  
        
        res.should.deepEqual({ 'key': 'val' });

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('cache');
        cbStub.getCall(0).args[0].Key.key.should.deepEqual({'S': '42'});
      });

    });
    
    it('should retrieve cache with string key', () => {

      var cbStub = sinon.stub();
      var options = {
        'tableName': 'test',
        'keyField': 'id',
        'valField': 'config'
      };
      var subject = createSubject(options, 'getItem', function(params, cb) { 
        cbStub(params); 
        cb(null, { 
          Item: {
            'id': {
              'N':'42'
            },
            'config': {
              'M': { 'data': { 'M': { 'key': { 'S': 'val' }}}}
            }
          }
        });             
      });

      return subject.get('42', function(err, res) {
        (err === null).should.be.true();  
        
        res.should.deepEqual({ 'key': 'val' });

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('test');
        cbStub.getCall(0).args[0].Key.id.should.deepEqual({'S': '42'});
      });
    });

    it('should retrieve cache with object key and value', () => {

      var cbStub = sinon.stub();
      var options = {
        'tableName': 'test',
        'keyField': 'id',
        'valField': 'config'
      };
      var subject = createSubject(options, 'getItem', function(params, cb) { 
        cbStub(params); 
        cb(null, { 
          Item: {
            'id': {
              'N':'42'
            },
            'environment': {
              'S':'dev'
            },
            'config': {
              'M': { 'data': { 'M': { 'key': { 'S': 'val' }}}}
            }
          }
        });             
      });

      return subject.get({'id': 42, 'environment': 'dev'}, function(err, res) {
        (err === null).should.be.true();  
        
        res.should.deepEqual({ 'key': 'val' });

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('test');
        cbStub.getCall(0).args[0].Key.id.should.deepEqual({'N': '42'});
        cbStub.getCall(0).args[0].Key.environment.should.deepEqual({'S': 'dev'});
      });
    });
  });

  context('del', () => {

    it('should remove cache with string key and default property settings when no such provided', () => {

      var cbStub = sinon.stub();
      var subject = createSubject({}, 'deleteItem', function(params, cb) { 
        cbStub(params); 
        cb(null, 'Done');             
      });

      return subject.del('42', function(err, res) {
        (err === null).should.be.true();  
        
        res.should.equal('Done');

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('cache');
        cbStub.getCall(0).args[0].Key.key.S.should.equal('42');
      });

    });
    
    it('should remove cache with string key', () => {

      var cbStub = sinon.stub();
      var options = {
        'tableName': 'test',
        'keyField': 'id'
      };
      var subject = createSubject(options, 'deleteItem', function(params, cb) { 
        cbStub(params); 
        cb(null, 'Done');             
      });

      return subject.del(42, function(err, res) {
        (err === null).should.be.true();  
        
        res.should.equal('Done');

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('test');
        cbStub.getCall(0).args[0].Key.id.N.should.equal('42');
      });      
    });

    it('should remove cache with object key and value', () => {
      
      var cbStub = sinon.stub();
      var options = {
        'tableName': 'test',
        'keyField': 'id'
      };
      var subject = createSubject(options, 'deleteItem', function(params, cb) { 
        cbStub(params); 
        cb(null, 'Done');             
      });

      return subject.del({'id': 42, 'environment': 'dev'}, function(err, res) {
        (err === null).should.be.true();  
        
        res.should.equal('Done');

        cbStub.getCalls().length.should.equal(1);
        cbStub.getCall(0).args[0].TableName.should.equal('test');
        cbStub.getCall(0).args[0].Key.id.N.should.equal('42');
        cbStub.getCall(0).args[0].Key.environment.S.should.equal('dev');
      });      
    });
  });
  
});
