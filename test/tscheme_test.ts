///<reference path='../node/node.d.ts' />
///<reference path='mocha.d.ts' />

import assert = module('assert');
import environment = module('../environment');
import s_expression = module('../s_expression');
import parse = module('../parse');
import ast = module('../ast');

describe('SQuote', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a quote object', () => {
            var testquote =
                new s_expression.SQuote([
                    new s_expression.SStr('quote'),
                    [
                        new s_expression.SStr('a'),
                        new s_expression.SNum(1),
                    ],
                ]);
            assert.equal(String(testquote.evaluate(global)),
                         'a,1');
        });
    });
});

describe('SQuote', () => {
    describe('#toString()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should convert s_expression to string', () => {
            var testquote =
                new s_expression.SQuote([
                    new s_expression.SStr('quote'),
                    [
                        new s_expression.SNum(1),
                        new s_expression.SStr('a'),
                    ],
                ]);
            assert.equal(String(testquote.toString()),
                         "(quote (1 a))");
        });
    });
});

describe('SIf', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate an if object', () => {
            var testif =
                new s_expression.SIf([
                    new s_expression.SStr('if'),
                    new s_expression.SSymbol('#t'),
                    new s_expression.SNum(1),
                    new s_expression.SNum(0),
                ]);
            assert.equal(String(testif.evaluate(global)),
                         "1");
        });
    });
});

describe('SSet!', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a set! object', () => {
            var testset =
                new s_expression.SSet([
                    new s_expression.SStr('set!'),
                    new s_expression.SStr('#t'),
                    new s_expression.SNum(1),
                ]);
            testset.evaluate(global);
            var test =
                new s_expression.SSymbol('#t');
            assert.equal(String(test.evaluate(global)),
                         "1");
        });
    });
});

describe('SDefine', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a define object', () => {
            var testdefine =
                new s_expression.SDefine([
                    new s_expression.SStr('define'),
                    new s_expression.SStr('a'),
                    new s_expression.SNum(1)]);
            testdefine.evaluate(global);
            var test =
                new s_expression.SSymbol('a');
            assert.equal(String(test.evaluate(global)),
                         "1");
        });
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a proc object', () => {
            var testproc =
                new s_expression.SProc([
                    new s_expression.SSymbol('car'),
                    new s_expression.SProc(
                        [
                            new s_expression.SSymbol('cons'),
                            new s_expression.SNum(0),
                            new s_expression.SNum(1),
                        ]),
                ]);
            assert.equal(String(testproc.evaluate(global)), '0');
        });
    });
});

describe('SLambda', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a lambda object', () => {
            var testlambda =
                new s_expression.SLambda(
                    [
                        new s_expression.SStr('lamda'),
                        [
                            new s_expression.SStr('a'),
                        ],
                        new s_expression.SProc([
                            new s_expression.SSymbol('+'),
                            new s_expression.SSymbol('a'),
                            new s_expression.SNum(1),
                        ]),
                    ]);
            var testproc =
                new s_expression.SProc([
                    testlambda,
                    new s_expression.SNum(1),
                ]);
            assert.equal(testproc.evaluate(global), '2');
        });
    });
});

describe('#parse', () => {
    it('should parse string to s_expression', () => {
        var teststring = '(define a (lambda (x) (+ x 1)))';
        var res = parse.parse(teststring);
        assert.equal(String(res[0]), 'define');
    });
});

describe('#ast()', () => {
    var global: environment.Environment = environment.createGlobalEnvironment();
    it('should make ast', () => {
        var testast = '#t';
        var s = ast.ast(testast);
        assert.equal(String(s.evaluate(global)), 'true');
    });
});

describe('#ast()', () => {
    var global: environment.Environment = environment.createGlobalEnvironment();
    it('should make ast', () => {
        var testast = '(if #t 1 0)';
        var res = parse.parse(testast);
        var s = ast.ast(res);
        assert.equal(String(s.evaluate(global)), '1');
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a lambda object', () => {
            var testproc = '((lambda (a) (+ a 1)) 1)';
            var res = parse.parse(testproc);
            var s = ast.ast(res);
            assert.equal(String(s.evaluate(global)), '2');
        });
    });
});

describe('SBegin', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a begin object', () => {
            var testbegin = '(begin (+ 1 1) (* 2 2))';
            var res = parse.parse(testbegin);
            var s = ast.ast(res);
            assert.equal(String(s.evaluate(global)), '4');
        });
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should evaluate a proc object', () => {
            var testproc = '(+ 1 1)';
            var res = parse.parse(testproc);
            var s = ast.ast(res);
            assert.equal(String(s.evaluate(global)), '2');
        });
    });
});

describe('factrial function', () => {
    describe('#evaluate()', () => {
        var global: environment.Environment = environment.createGlobalEnvironment();
        it('should culcurate factorial 5', () => {
            var testfactrial = '(define factrial (lambda (n) (begin (define fact-iter (lambda (k result) (if (> k n) result (fact-iter (+ k 1) (* k result))))) (fact-iter 1 1))))';
            var res = parse.parse(testfactrial);
            var s = ast.ast(res);
            s.evaluate(global);
            var tmp = ast.ast('#t');
            console.log(tmp.evaluate(global));
            var test = '(factrial 5)';
            var res = parse.parse(test);
            var s = ast.ast(res);
            assert.equal(String(s.evaluate(global)), '120');
        });
    });
});