
var _       = require('underscore');
var util    = require('util');

var Connectable = (function(){
    /**
     * Constructs a new Connectable object.
     *
     * @constructor
     * @alias promisql.engine.Connectable
     *
     * @classdesc
     * The base class for things which make connections, such as `promisql.engine.Engine` and
     * `promisql.engine.Connection`.
     */
    function Connectable(){}

    Connectable.prototype.connect = function(){};

    Connectable.prototype.contextualConnect = function(){
        return this.connect.apply(this, arguments);
    };

    Connectable.prototype.execute = function(){};

    return Connectable;
})();

// ---------------------------------------------------------------------------------------------- //

var Engine = (function(){
    /**
     * Constructs a new SQL Engine.
     *
     * @constructor
     * @alias promisql.engine.Engine
     *
     * @classdesc
     * The `Engine` connects a `Pool` with a `Dialect` to provide a source for database connections
     * of a specific brand.
     *
     * @param {promisql.Pool} pool
     * @param {promisql.Dialect} dialect
     */
    function Engine(pool, dialect){
        Engine.super_.call(this);

        if (!pool || !dialect) {
            throw new Error('Pool and dialect are required to build an engine.');
        }

        this._pool = pool;
        this._dialect = dialect;
    }
    util.inherits(Engine, Connectable);

    // ------------------------------------------------------------------------------------------ //

    /**
     * @namespace promisql.engine.Engine.options
     *
     * @property {promisql.Pool} pool
     * @property {promisql.Dialect} dialect
     */

    // ------------------------------------------------------------------------------------------ //

    Object.defineProperties(Engine.prototype, {
        pool: {get: function(){ return this._pool; }},
        dialect: {get: function(){ return this._dialect; }},
        driver: {get: function(){ return this.dialect.driver; }}
    });

    Engine.prototype.begin = function(cb){
        return this.contextualConnect(function(conn){
            return conn.begin(function(){ return cb(conn); });
        });
    };

    Engine.prototype.connect = function(cb){
        return this.pool.acquire(cb);
    };

    Engine.prototype.execute = function(statement){
        var args = arguments;
        return this.contextualConnect(function(conn){
            return conn.execute.call(conn, args);
        });
    };

    Engine.prototype.pooled = function(cb){
        var self = this;
        var slice = Array.prototype.slice;
        return function(){
            var args = slice.call(arguments);
            var wrappedSelf = this;
            return self.contextualConnect(function(conn){
                args.unshift(conn);
                return cb.apply(wrappedSelf, args);
            });
        }
    };

    Engine.prototype.hasTable = function(){};

    Engine.prototype.getTableNames = function(){};

    return Engine;
})();

// ---------------------------------------------------------------------------------------------- //

var Connection = (function(){
    function Connection(engine){
        Connection.super_.call(this);

        this._engine = engine;
        this._inTransaction = 0;
    }
    util.inherits(Connection, Connectable);

    Object.defineProperties(Connection.prototype, {
        closed: {get: function(){ return this._closed; }},
        connection: {get: function(){ return this._conn; }},
        engine: {get: function(){ return this._engine; }},
        invalidated: {get: function(){ return this._invalidated; }}
    });

    Connection.prototype.begin = function(cb){
        var self = this;
        return this.execute(this.engine.dialect.BEGIN).then(function(){
            ++self._inTransaction;
            try {
                cb().then(function(res){
                    if (self.inTransaction()) {
                        return self.rollback().then(function(){
                            throw new Error('Transaction expired without commit or rollback.');
                        });
                    }
                    return res;
                }, function(err){
                    if (self.inTransaction()) {
                        return self.rollback().then(function(){ throw err; });
                    }
                    throw err;
                });
            }
            catch (err) {
                if (self.inTransaction()) {
                    return self.rollback().then(function(){ throw err; });
                }
                throw err;
            }
        });
    };

    Connection.prototype.beginNested = function(){};

    Connection.prototype.beginTwoPhase = function(){};

    Connection.prototype.commit = function(){
        var self = this;
        return this.execute(this.engine.dialect.COMMIT).then(function(){ --self._inTransaction; });
    };

    Connection.prototype.rollback = function(){
        var self = this;
        return this.execute(this.engine.dialect.ROLLBACK).then(function(){ --self._inTransaction; });
    };

    Connection.prototype.close = function(){};

    Connection.prototype.execute = function(){};

    Connection.prototype.inTransaction = function(){
        return this._inTransaction > 0;
    };

    Connection.prototype.invalidate = function(){};

    return Connection;
})();

exports.Connectable = Connectable;
exports.Connection = Connection;
exports.Engine = Engine;
