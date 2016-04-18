'use strict';

class ControlFlow {
    constructor(opts) {
        this.opts = opts;
    }
}

class Any extends ControlFlow {
    constructor(opts) {
        super(opts);
    }
}

class Repeats extends ControlFlow {
    constructor(opts) {
        super(opts);
    }
}

class Optional extends ControlFlow {
    constructor(opts) {
        super(opts);
    }
}

// Dialect terminology.
const terms = {
    any:        (opts) => new Any(opts),
    optional:   (opts) => new Optional(opts),
    repeats:    (opts) => new Repeats(opts),

    COLUMNNAME: Symbol('COLUMNNAME'),
    DATATYPE:   Symbol('DATATYPE'),
    EXPRESSION: Symbol('EXPRESSION'),
    INDEXNAME:  Symbol('INDEXNAME'),
    IDENTIFIER: Symbol('IDENTIFIER'),
    NUMBER:     Symbol('NUMBER'),
    STATEMENT:  Symbol('STATEMENT'),
    STRING:     Symbol('STRING'),
    TABLENAME:  Symbol('TABLENAME'),
    VALUE:      Symbol('VALUE')
};

function _normalize(statement) {
    if (!statement) {
        return statement;
    }

    var length = statement.length;
    if (statement[length - 1] === null) {
        statement.pop();
        statement = terms.optional(statement);
    }

    if (Array.isArray(statement)) {
        statement = statement.map(_normalize);
    }
    else if (statement instanceof ControlFlow) {
        statement.opts = _normalize(statement.opts);
    }

    return statement;
}

function _symbolToString(symbol) {
    var m = /^Symbol\(([\w]+)\)$/.exec(symbol.toString());
    return m ? m[1] : null;
}

function _defineProp(obj, statement, symbol, offset, next, nextOffset) {
    var getter = () => _extend({}, statement, offset);
    if (next) {
        getter = () => _extend({}, next, nextOffset);
    }
    Object.defineProperty(obj, symbol, {get: getter, enumerable: true});
}

function _extend(obj, statement, offset, next, nextOffset) {
    for (var i = offset || 0; i < statement.length; ++i) {
        var k = statement[i];
        var symbol = _symbolToString(k);
        if (symbol) {
            _defineProp(obj, statement, symbol, i + 1, next, nextOffset)
            break;
        }
        else if (k instanceof Optional) {
            _extend(obj, k.opts, 0, statement, i + 1);
        }
    }
    return obj;
}

class Dialect {
    constructor(dialect) {
        var d = dialect(terms);
        d.statements = d.statements.map(_normalize);
        this._dialect = d;
    }

    extend(obj) {
        this._dialect.statements.forEach((s) => _extend(obj, s));
    }
}

module.exports = Dialect;
