// AST type declarations
"use strict";

var typecheck = module.exports.typecheck = function(val, type, self) {
    switch (type) {
    case 'any':
        return true;
    case 'string':
        return typeof(val) === type;
    case 'self':
        return self && self.contains(val);
    }
    if (Array.isArray(type)) {
        return Array.isArray(val) && val.every(function(elem) {
            return typecheck(elem, type[0], self);
        });
    }
    return type.contains(val);
};
var type2str = function(type) {
    if (typeof(type) === 'string') {
        return type;
    }
    if (Array.isArray(type)) {
        return '[' + type2str(type[0]) + ']';
    }
    return type.name;
};

// "Enum" helper
// vaguely based on:
// https://github.com/rauschma/enums/blob/master/enums.js
var Enum = function(name, fields, proto) {
    proto = proto || {};
    // Non-enumerable properties 'name' and 'prototype'
    Object.defineProperty(this, 'name', { value: name });
    Object.defineProperty(this, 'prototype', { value: proto });
    Object.keys(fields).forEach(function(fname) {
        var args = fields[fname].args || [];
        var self = this;
        this[fname] = function EnumField() {
            if (!(this instanceof EnumField)) {
                var o = Object.create(EnumField.prototype);
                o.constructor = EnumField;
                EnumField.apply(o, arguments);
                return o;
            }
            this.name = fname;
            console.assert(arguments.length === args.length,
                           "Wrong # of args for " + name + "." + fname);
            for (var i=0; i<args.length; i++) {
                console.assert(typecheck(arguments[i], args[i], self),
                              "Argument " + i + " of " + name + "." + fname +
                               " should be " + type2str(args[i]));
                this[i] = arguments[i];
            }
            this.length = args.length;
        };
        this[fname].prototype = Object.create(proto);
        this[fname].prototype.toString = function() {
            var stringify = function(type, val) {
                if (type==='string') {
                    return JSON.stringify(val);
                } else if (Array.isArray(type)) {
                    return '[' + val.map(function(v) {
                        return stringify(type[0], v);
                    }).join(',') + ']';
                }
                return val.toString();
            };
            return fname + '(' + args.map(function(type, i) {
                return stringify(type, this[i]);
            }.bind(this)).join(',') + ')';
        };
    }.bind(this));
};
Enum.prototype.contains = function(sym) {
    return sym.name && this.hasOwnProperty(sym.name) &&
        sym instanceof this[sym.name];
};
Enum.prototype.defineVisitor = function(visitorName, o, numArgs) {
    var self = this;
    numArgs = numArgs || 0;
    console.assert(Object.keys(o).length === Object.keys(self).length,
                  "Missing cases in " + self.name /*+ ": " +
                   Object.keys(o) + " vs " + Object.keys(self)*/);
    Object.keys(o).forEach(function(fname) {
        self[fname].prototype[visitorName] = function() {
            var args = [];
            for (var i=0; i<numArgs; i++) { args.push(arguments[i]); }
            args.push.apply(args, this);
            return o[fname].apply(this, args);
        };
    });
};

// Actual AST starts here.

var FontForce = module.exports.FontForce = new Enum( 'FontForce', {
    IT: {},
    RM: {}
});

var FontClass = module.exports.FontClass = new Enum( 'FontClass', {
    IT:  {}, /* IT default, may be forced to be RM */
    RM:  {}, /* RM default, may be forced to be IT */
    UF:  {}, /* not affected by IT/RM setting */
    RTI: {}, /* RM - any, IT - not available in HTML */
    UFH: {} /* in TeX UF, in HTML RM */
});

var MathClass = module.exports.MathClass = new Enum( 'MathClass', {
    MN: {},
    MI: {},
    MO: {}
});

var RenderT = module.exports.RenderT = new Enum( 'RenderT', {
    HTMLABLEC:    { args: [ FontClass, 'string', 'string' ] },
    HTMLABLEM:    { args: [ FontClass, 'string', 'string' ] },
    HTMLABLE:     { args: [ FontClass, 'string', 'string' ] },
    MHTMLABLEC:   { args: [ FontClass, 'string', 'string', MathClass, 'string' ] },
    HTMLABLE_BIG: { args: [ 'string', 'string' ] },
    TEX_ONLY:     { args: ['string'] }
}/*, {
    // demonstration of doing dispatch on the enumerated type with a
    // switch statement.  it turns out to be more self-documenting if we
    // use Enum.defineVisitor() for this instead (see render.js)
    tex_part: function() {
        switch(this.constructor) {
        case RenderT.HTMLABLE:
        case RenderT.HTMLABLEM:
        case RenderT.HTMLABLEC:
        case RenderT.MHTMLABLEC:
            return this[1];
        case RenderT.HTMLABLE_BIG:
        case RenderT.TEX_ONLY:
            return this[0];
        }
    }
}*/);

var Tex = module.exports.Tex = new Enum( 'Tex', {
    LITERAL: { args: [ RenderT ] }, // contents
    CURLY:   { args: [ ['self'] ] }, // expr
    FQ:      { args: [ 'self', 'self', 'self' ] }, // base, down, up
    DQ:      { args: [ 'self', 'self' ] }, // base, down
    UQ:      { args: [ 'self', 'self' ] }, // base, up
    FQN:     { args: [ 'self', 'self' ] }, // down, up (no base)
    DQN:     { args: [ 'self' ] }, // down (no base)
    UQN:     { args: [ 'self' ] }, // up (no base)
    LR:      { args: [ RenderT, RenderT, [ 'self' ] ] }, // left, right, expr
    BOX:     { args: [ 'string', 'string' ] }, // name, contents
    BIG:     { args: [ 'string', RenderT ] }, // name, contents
    FUN1:    { args: [ 'string', 'self' ] }, // name, expr
    FUN1nb:  { args: [ 'string', 'self' ] }, // name, expr
    FUN2:    { args: [ 'string', 'self', 'self' ] },
    FUN2nb:  { args: [ 'string', 'self', 'self' ] },
    INFIX:   { args: [ 'string', ['self'], ['self'] ] },
    FUN2sq:  { args: [ 'string', 'self', 'self' ] },
    FUN1hl:  { args: [ 'string', 'any', 'self' ] },
    FUN1hf:  { args: [ 'string', FontForce, 'self' ] },
    FUN2h:   { args: [ 'string', 'any', 'self', 'self' ] },
    INFIXh:  { args: [ 'string', 'any', [ 'self' ], [ 'self' ] ] },
    MATRIX:  { args: [ 'string', [ [ [ 'self' ] ] ] ] },
    DECLh:   { args: [ 'string', FontForce, [ 'self' ] ] }
});

// Linked List of Tex, useful for efficient "append to head" operations.
var nil = {};
var LList = module.exports.LList = function LList(head, tail) {
    if (!(this instanceof LList)) {
        return new LList(head, tail);
    }
    if (head === nil && tail === nil) { return; /* empty list singleton */ }
    if (!tail) { tail = LList.EMPTY; }
    console.assert(typecheck(head, Tex));
    console.assert(tail instanceof LList);
    this.head = head;
    this.tail = tail;
};
LList.EMPTY = new LList(nil, nil);
LList.prototype.toArray = function() {
    console.assert(this instanceof LList, "not a LList");
    var arr = [];
    for (var l = this ; l !== LList.EMPTY; l = l.tail) {
        arr.push(l.head);
    }
    return arr;
};
