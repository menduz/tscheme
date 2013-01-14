///<reference path='../lib/node/node.d.ts' />
///<reference path='mocha.d.ts' />

import assert = module('assert');

describe('SQuote', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a quote object', () => {
            var testquote =
                new SQuote([
                    new SStr('quote'),
                    [
                        new SStr('a'),
                        new SNum(1),
                    ],
                ]);
            assert.equal(String(testquote.evaluate(global)),
                         'a,1');
        });
    });
});

describe('SQuote', () => {
    describe('#toString()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should convert s_expression to string', () => {
            var testquote =
                new SQuote([
                    new SStr('quote'),
                    [
                        new SNum(1),
                        new SStr('a'),
                    ],
                ]);
            assert.equal(String(testquote.toString()),
                         "(quote (1 a))");
        });
    });
});

describe('SIf', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate an if object', () => {
            var testif =
                new SIf([
                    new SStr('if'),
                    new SSymbol('#t'),
                    new SNum(1),
                    new SNum(0),
                ]);
            assert.equal(String(testif.evaluate(global)),
                         "1");
        });
    });
});

describe('SSet!', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a set! object', () => {
            var testset =
                new SSet([
                    new SStr('set!'),
                    new SStr('#t'),
                    new SNum(1),
                ]);
            testset.evaluate(global);
            var test =
                new SSymbol('#t');
            assert.equal(String(test.evaluate(global)),
                         "1");
        });
    });
});

describe('SDefine', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a define object', () => {
            var testdefine =
                new SDefine([
                    new SStr('define'),
                    new SStr('a'),
                    new SNum(1)]);
            testdefine.evaluate(global);
            var test =
                new SSymbol('a');
            assert.equal(String(test.evaluate(global)),
                         "1");
        });
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a proc object', () => {
            var testproc =
                new SProc([
                    new SSymbol('car'),
                    new SProc(
                        [
                            new SSymbol('cons'),
                            new SNum(0),
                            new SNum(1),
                        ]),
                ]);
            assert.equal(String(testproc.evaluate(global)), '0');
        });
    });
});

describe('SLambda', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a lambda object', () => {
            var testlambda =
                new SLambda(
                    [
                        new SStr('lamda'),
                        [
                            new SStr('a'),
                        ],
                        new SProc([
                            new SSymbol('+'),
                            new SSymbol('a'),
                            new SNum(1),
                        ]),
                    ]);
            var testproc =
                new SProc([
                    testlambda,
                    new SNum(1),
                ]);
            assert.equal(testproc.evaluate(global), '2');
        });
    });
});

describe('#parse', () => {
    it('should parse string to s_expression', () => {
        var teststring = '(define a (lambda (x) (+ x 1)))';
        var parsed = parse(teststring);
        assert.equal(String(parsed[0]), 'define');
    });
});

describe('SQuote', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a lambda object', () => {
            var testproc = '(quote (a 1))';
            var parsed = parse(testproc);
            var s = ast(parsed);
            assert.equal(String(s.evaluate(global)), 'a,1');
        });
    });
});

describe('#ast()', () => {
    var global: Environment = createGlobalEnvironment();
    it('should make ast', () => {
        var testast = '(if #t 1 0)';
        var parsed = parse(testast);
        var s = ast(parsed);
        assert.equal(String(s.evaluate(global)), '1');
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a lambda object', () => {
            var testproc = '((lambda (a) (+ a 1)) 1)';
            var parsed = parse(testproc);
            var s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '2');
        });
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a lambda object', () => {
            var testproc = '(* 2 (car (quote (5 1))))'
            var parsed = parse(testproc);
            var s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '10');
        });
    });
});

describe('SBegin', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a begin object', () => {
            var testbegin = '(begin (+ 1 1) (* 2 2))';
            var parsed = parse(testbegin);
            var s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '4');
        });
    });
});

describe('SProc', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a proc object', () => {
            var testproc = '(+ 1 1)';
            var parsed = parse(testproc);
            var s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '2');
        });
    });
});

describe('let', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should evaluate a let object', () => {
            var testproc = '(let ((n 1) (m 2)) (+ n m))';
            var parsed = parse(testproc);
            var s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '3');
        });
    });
});

describe('factrial function', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should culcurate factorial 5', () => {
            var testfactrial = '(define factrial (lambda (n) (begin (define fact-iter (lambda (k result) (if (> k n) result (fact-iter (+ k 1) (* k result))))) (fact-iter 1 1))))';
            var parsed = parse(testfactrial);
            var s = ast(parsed);
            s.evaluate(global);
            var test = '(factrial 5)';
            parsed = parse(test);
            s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '120');
        });
    });
});

describe('factrial function re', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should culcurate factorial 5', () => {
            var testfactrial = '(define factrial (lambda (n) (define fact-iter (lambda (k result) (if (> k n) result (fact-iter (+ k 1) (* k result))))) (fact-iter 1 1)))';
            var parsed = parse(testfactrial);
            var s = ast(parsed);
            s.evaluate(global);
            var test = '(factrial 5)';
            parsed = parse(test);
            s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '120');
        });
    });
});

describe('factrial function re re', () => {
    describe('#evaluate()', () => {
        var global: Environment = createGlobalEnvironment();
        it('should culcurate factorial 5', () => {
            var testfactrial = '(define (factrial n) (define (fact-iter k res) (if (> k n) res (fact-iter (+ k 1) (* res k)))) (fact-iter 1 1))';
            var parsed = parse(testfactrial);
            var s = ast(parsed);
            s.evaluate(global);
            var test = '(factrial 5)';
            parsed = parse(test);
            s = ast(parsed);
            assert.equal(String(s.evaluate(global)), '120');
        });
    });
});
