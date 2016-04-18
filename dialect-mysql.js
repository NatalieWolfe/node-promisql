'use strict';

// MySQL symbols.
const s = {
    ACTION:         Symbol('ACTION'),
    ALWAYS:         Symbol('ALWAYS'),
    AS:             Symbol('AS'),
    ASC:            Symbol('ASC'),
    AUTO_INCREMENT: Symbol('AUTO_INCREMENT'),
    BINARY:         Symbol('BINARY'),
    BTREE:          Symbol('BTREE'),
    CASCADE:        Symbol('CASCADE'),
    CHARACTER:      Symbol('CHARACTER'),
    CHECK:          Symbol('CHECK'),
    COLLATE:        Symbol('COLLATE'),
    COLUMN_FORMAT:  Symbol('COLUMN_FORMAT'),
    COMMENT:        Symbol('COMMENT'),
    CONSTRAINT:     Symbol('CONSTRAINT'),
    CREATE:         Symbol('CREATE'),
    DATABASE:       Symbol('DATABASE'),
    DEFAULT:        Symbol('DEFAULT'),
    DELETE:         Symbol('DELETE'),
    DESC:           Symbol('DESC'),
    DYNAMIC:        Symbol('DYNAMIC'),
    EVENT:          Symbol('EVENT'),
    EXISTS:         Symbol('EXISTS'),
    FIXED:          Symbol('FIXED'),
    FOREIGN:        Symbol('FOREIGN'),
    FULL:           Symbol('FULL'),
    FULLTEXT:       Symbol('FULLTEXT'),
    FUNCTION:       Symbol('FUNCTION'),
    GENERATED:      Symbol('GENERATED'),
    HASH:           Symbol('HASH'),
    IF:             Symbol('IF'),
    IGNORE:         Symbol('IGNORE'),
    INDEX:          Symbol('INDEX'),
    KEY:            Symbol('KEY'),
    KEY_BLOCK_SIZE: Symbol('KEY_BLOCK_SIZE'),
    LOGFILE:        Symbol('LOGFILE'),
    GROUP:          Symbol('GROUP'),
    MATCH:          Symbol('MATCH'),
    NO:             Symbol('NO'),
    NOT:            Symbol('NOT'),
    NULL:           Symbol('NULL'),
    ON:             Symbol('ON'),
    PARSER:         Symbol('PARSER'),
    PARTIAL:        Symbol('PARTIAL'),
    PRIMARY:        Symbol('PRIMARY'),
    PROCEDURE:      Symbol('PROCEDURE'),
    REFERENCES:     Symbol('REFERENCES'),
    REPLACE:        Symbol('REPLACE'),
    RESTRICT:       Symbol('RESTRICT'),
    SERVER:         Symbol('SERVER'),
    SET:            Symbol('SET'),
    SIMPLE:         Symbol('SIMPLE'),
    SPATIAL:        Symbol('SPATIAL'),
    STORED:         Symbol('STORED'),
    TABLE:          Symbol('TABLE'),
    TABLESPACE:     Symbol('TABLESPACE'),
    TEMPORARY:      Symbol('TEMPORARY'),
    TRIGGER:        Symbol('TRIGGER'),
    UNIQUE:         Symbol('UNIQUE'),
    UNSIGNED:       Symbol('UNSIGNED'),
    UPDATE:         Symbol('UPDATE'),
    USING:          Symbol('USING'),
    VIEW:           Symbol('VIEW'),
    VIRTUAL:        Symbol('VIRTUAL'),
    WITH:           Symbol('WITH'),
    ZEROFILL:       Symbol('ZEROFILL')
};

// MySQL datatypes.
const d = {
    BIT:                Symbol('BIT'),
    TINYINT:            Symbol('TINYINT'),
    SMALLINT:           Symbol('SMALLINT'),
    MEDIUMINT:          Symbol('MEDIUMINT'),
    INT:                Symbol('INT'),
    INTEGER:            Symbol('INTEGER'),
    BIGINT:             Symbol('BIGINT'),
    REAL:               Symbol('REAL'),
    DOUBLE:             Symbol('DOUBLE'),
    FLOAT:              Symbol('FLOAT'),
    DECIMAL:            Symbol('DECIMAL'),
    NUMERIC:            Symbol('NUMERIC'),
    DAT:                Symbol('DAT'),
    TIME:               Symbol('TIME'),
    TIMESTAMP:          Symbol('TIMESTAMP'),
    DATETIME:           Symbol('DATETIME'),
    YEA:                Symbol('YEA'),
    CHAR:               Symbol('CHAR'),
    VARCHAR:            Symbol('VARCHAR'),
    BINARY:             Symbol('BINARY'),
    VARBINARY:          Symbol('VARBINARY'),
    TINYBLO:            Symbol('TINYBLO'),
    BLO:                Symbol('BLO'),
    MEDIUMBLO:          Symbol('MEDIUMBLO'),
    LONGBLO:            Symbol('LONGBLO'),
    TINYTEXT:           Symbol('TINYTEXT'),
    TEXT:               Symbol('TEXT'),
    MEDIUMTEXT:         Symbol('MEDIUMTEXT'),
    LONGTEXT:           Symbol('LONGTEXT'),
    ENUM:               Symbol('ENUM'),
    SET:                Symbol('SET'),
    JSON:               Symbol('JSON'),
    GEOMETRY:           Symbol('GEOMETRY'),
    POINT:              Symbol('POINT'),
    LINESTRING:         Symbol('LINESTRING'),
    POLYGON:            Symbol('POLYGON'),
    MULTIPOINT:         Symbol('MULTIPOINT'),
    MULTILINESTRING:    Symbol('MULTILINESTRING'),
    MULTIPOLYGON:       Symbol('MULTIPOLYGON'),
    GEOMETRYCOLLECTION: Symbol('GEOMETRYCOLLECTION')
};

// MySQL table engines.
const engines = {
    Archive:    Symbol('Archive'),
    Blackhole:  Symbol('Blackhole'),
    CSV:        Symbol('CSV'),
    Federated:  Symbol('Federated'),
    InnoDB:     Symbol('InnoDB'),
    Memory:     Symbol('Memory'),
    Merge:      Symbol('Merge'),
    MyISAM:     Symbol('MyISAM'),
    NDB:        Symbol('NDB')
};

module.exports = function(t) {
    const index = (function(){
        const type = [s.USING, t.any([s.BTREE, s.HASH])];
        const col_name = [t.COLUMNNAME, ['(', t.NUMBER, ')', null], [t.any([s.ASC, s.DESC]), null]];
        const reference_option = t.any([s.RESTRICT, s.CASCADE, [s.SET, s.NULL], [s.NO, s.ACTION]]);

        return {
            col_name: col_name,
            option: t.any([
                [s.KEY_BLOCK_SIZE, ['=', null], t.NUMBER],
                type,
                [s.WITH, s.PARSER, t.STRING],
                [s.COMMENT, t.STRING]
            ]),
            reference_definition: [
                s.REFERENCES, t.TABLENAME, '(', t.repeats(col_name), ')',
                [s.MATCH, t.any([s.FULL, s.PARTIAL, s.SIMPLE]), null],
                [s.ON, s.DELETE, reference_option],
                [s.ON, s.UPDATE, reference_option]
            ],
            type: type
        };
    })();

    const datatype_definition = (function() {
        const length = ['(', t.NUMBER, ')'];
        const unsigned_zerofill = [[s.UNSIGNED, null], [s.ZEROFILL, null]];
        const optional_char_collate = [[s.CHARACTER, s.SET, t.STRING, null], [s.COLLATE, t.STRING, null]];

        const integers          = [d.TINYINT, d.SMALLINT, d.MEDIUMINT, d.INT, d.INTEGER, d.BIGINT];
        const floating_point    = [d.REAL, d.DOUBLE, d.FLOAT];
        const fixed_point       = [d.DECIMAL, d.NUMERIC];
        const time              = [d.TIME, d.TIMESTAMP, d.DATETIME];
        const strings           = [d.CHAR, d.VARCHAR];
        const blobs             = [d.TINYBLOB, d.BLOB, d.MEDIUMBLOB, d.LONGBLOB];
        const text              = [d.TINYTEXT, d.TEXT, d.MEDIUMTEXT, d.LONGTEXT];
        const sets              = [d.ENUM, d.SET];

        return t.any([
            [d.BIT, [length, null]],
            [t.any(integers), [length, null], unsigned_zerofill],
            [t.any(floating_point), [['(', t.NUMBER, ',', t.NUMBER, ')'], null], unsigned_zerofill],
            [t.any(fixed_point), [['(', t.NUMBER, [',', t.NUMBER, null], ')'], null], unsigned_zerofill],
            d.DATE,
            d.YEAR,
            [t.any(time), [length, null]],
            [t.any(strings), [length, null], [s.BINARY, null], optional_char_collate],
            [d.BINARY, [length, null]],
            [d.VARBINARY, length],
            [t.any(blobs)],
            [t.any(text), [s.BINARY, null], optional_char_collate],
            [t.any(sets), '(', t.repeats(t.STRING), ')', optional_char_collate],
            d.JSON,
            d.GEOMETRY,
            d.POINT,
            d.LINESTRING,
            d.POLYGON,
            d.MULTIPOINT,
            d.MULTILINESTRING,
            d.MULTIPOLYGON,
            d.GEOMETRYCOLLECTION
        ]);
    })();

    const column = {
        definition: [datatype_definition, t.any([
            [
                [[s.NOT, null], s.NULL, null], [s.DEFAULT, t.VALUE, null],
                [s.AUTO_INCREMENT, null], t.any([[s.UNIQUE, [s.KEY, null]], [[s.PRIMARY, null], s.KEY]]),
                [s.COMMENT, t.STRING, null],
                [s.COLUMN_FORMAT, t.any([s.FIXED, s.DYNAMIC, s.DEFAULT]), null],
                [index.reference_definition, null]
            ], [
                [s.GENERATED, s.ALWAYS, null], s.AS, '(', t.EXPRESSION, ')',
                [t.any([s.VIRTUAL, s.STORED]), null], [s.UNIQUE, [s.KEY, null], null],
                [s.COMMENT, t.STRING, null],
                [[s.NOT, null], s.NULL, null], [[s.PRIMARY, null], s.KEY, null]
            ]
        ])]
    };

    const columns_and_options = ['(', t.repeats(index.col_name), ')', [t.repeats(index.option), null]];

    const table = (function(){
        const eql = ['=', null];
        const idx_name = [t.INDEXNAME, null];

        const primary = [s.PRIMARY, s.KEY, [index.type, null], columns_and_options];
        const unique = [s.UNIQUE, t.any([s.INDEX, s.KEY]), idx_name, [index.type, null], columns_and_options];
        const foreign = [s.FOREIGN, s.KEY, idx_name, '(', t.repeats(index.col_name), ')', index.reference_definition];

        const any_engine = t.any(Object.keys(engines).map((key) => engines[key]));
        const column_list = ['(', t.repeats(t.COLUMNNAME), ')'];

        const table_option = t.any([
            [s.ENGINE, eql, any_engine],
            [s.AUTO_INCREMENT, eql, t.NUMBER],
            [s.AVG_ROW_LENGTH, eql, t.NUMBER],
            [[s.DEFAULT, null], s.CHARACTER, s.SET, eql, t.STRING],
            [s.CHECKSUM, eql, t.any([0, 1])],
            [[s.DEFAULT, null], s.COLLATE, eql, t.STRING],
            [s.COMMENT, eql, t.STRING],
            [s.COMPRESSION, eql, t.STRING],
            [s.CONNECTION, eql, t.STRING],
            [s.DATA, s.DIRECTORY, eql, t.STRING],
            [s.DELAY_KEY_WRITE, eql, t.any([0, 1])],
            [s.ENCRYPTION, eql, t.any(['Y', 'N'])],
            [s.INDEX, s.DIRECTORY, eql, t.STRING],
            [s.INSERT_METHOD, eql, t.any([s.NO, s.FIRST, s.LAST])],
            [s.KEY_BLOCK_SIZE, eql, t.NUMBER],
            [s.MAX_ROWS, eql, t.NUMBER],
            [s.MIN_ROWS, eql, t.NUMBER],
            [s.PACK_KEYS, eql, t.any([0, 1, s.DEFAULT])],
            [s.PASSWORD, eql, t.STRING],
            [s.ROW_FORMAT, eql, t.any([s.DEFAULT, s.DYNAMIC, s.FIXED, s.COMPRESSED, s.REDUNDANT, s.COMPACT])],
            [s.STATS_AUTO_RECALC, eql, t.any([0, 1, s.DEFAULT])],
            [s.STATS_PERSISTENT, eql, t.any([0, 1, s.DEFAULT])],
            [s.STATS_SAMPLE_PAGES, eql, t.NUMBER],
            [s.TABLESPACE, t.IDENTIFIER],
            [s.UNION, eql, '(', t.repeats(t.TABLENAME), ')']
        ]);

        const subpartition_definition = [
            s.SUBPARTITION, s.IDENTIFIER,
            [[s.STORAGE, null], s.ENGINE, eql, any_engine, null],
            [s.COMMENT, eql, t.STRING, null],
            [s.DATA, s.DIRECTORY, eql, t.STRING, null],
            [s.INDEX, s.DIRECTORY, eql, t.STRING, null],
            [s.MAX_ROWS, eql, t.NUMBER, null],
            [s.MIN_ROWS, eql, t.NUMBER, null],
            [s.TABLESPACE, eql, t.IDENTIFIER, null],
        ];

        const partition_definition = [
            s.PARTITION, t.IDENTIFIER,
            t.optional([s.VALUES, t.any([
                [s.LESS, s.THAN, t.any([t.any(['(', t.any([t.EXPRESSION, t.repeats(t.VALUE)]), ')']), s.MAXVALUE])],
                [s.IN, '(', t.repeats(t.VALUE), ')']
            ])]),
            [[s.STORAGE, null], s.ENGINE, eql, any_engine, null],
            [s.COMMENT, eql, t.STRING, null],
            [s.DATA, s.DIRECTORY, eql, t.STRING, null],
            [s.INDEX, s.DIRECTORY, eql, t.STRING, null],
            [s.MAX_ROWS, eql, t.NUMBER, null],
            [s.MIN_ROWS, eql, t.NUMBER, null],
            [s.TABLESPACE, eql, t.IDENTIFIER, null]
            [t.repeats(subpartition_definition), null]
        ];

        return {
            create_definition: [
                t.COLUMNNAME,
                column.definition, [
                    t.repeats(t.any([
                        [[s.CONSTRAINT, [t.IDENTIFIER, null], null], t.any([primary, unique, foreign])],
                        [t.any([s.INDEX, s.KEY]), [t.INDEXNAME, null], [index.type, null], columns_and_options],
                        [t.any([s.FULLTEXT, s.SPATIAL]), t.any([s.INDEX, s.KEY]), [t.INDEXNAME, null], columns_and_options],
                        [s.CHECK, '(', t.EXPRESSION, ')']
                    ])),
                    null
                ]
            ],
            table_options: t.repeats(table_option),
            partition_options: [
                s.PARTITION, s.BY, t.any([
                    [[s.LINEAR, null], s.HASH, '(', t.EXPRESSION, ')'],
                    [[s.LINEAR, null], s.KEY, [s.ALGORITHM, '=', t.any([1, 2])], column_list],
                    [s.RANGE, t.any([['(', t.EXPRESSION, ')'], [s.COLUMNS, column_list]])]
                    [s.LIST, t.any([['(', t.EXPRESSION, ')'], [s.COLUMNS, column_list]])]
                ]),
                [s.PARTITIONS, t.NUMBER, null],
                t.optional([
                    s.SUBPARTITION, s.BY, t.any([
                        [[s.LINEAR, null], s.HASH, '(', t.EXPRESSION, ')'],
                        [[s.LINEAR, null], s.KEY, [s.ALGORITHM, '=', t.any([1, 2])], column_list],
                    ]),
                    [s.SUBPARTITIONS, t.NUMBER, null],
                ]),
                ['(', t.repeats(partition_definition), ')', null]
            ]
        };
    })();

    const statements = [
        [s.CREATE, [s.TEMPORARY, null], s.TABLE, t.any([
            [
                [[s.IF, s.NOT, s.EXISTS], null],
                t.TABLENAME, t.any([[
                    '(', t.repeats(table.create_definition), ')',
                    [table.table_options, null],
                    [table.partition_options, null],
                //     [[t.any([s.IGNORE, s.REPLACE]), null], [s.AS, null], select_statement, null]
                // ], [
                //     [table.table_options, null],
                //     [table.partition_options, null],
                //     [t.any([s.IGNORE, s.REPLACE]), null], [s.AS, null], select_statement
                ]])
            ],
            [s.LIKE, t.TABLENAME]
        ])],
        // select_statement
    ];

    return {
        symbols: s,
        statements: statements,
        datatypes: d
    };
};
