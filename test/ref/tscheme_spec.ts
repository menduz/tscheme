///<reference path='../node/node.d.ts' />
///<reference path='mocha.d.ts' />

import assert = module('assert');
import tscheme = module('../tscheme');

describe('S', () => {
    describe('#evaluate()', () => {
        var global: tscheme.Environment = tscheme.createGlobalEnvironment();
        it('should evaluate an if object', () => {
            var testif = '(if #t 1 0)';
            var stest = tscheme.parse(testif, global);
            assert.equal(String(stest.evaluate()), "1");
        });
    });
});
