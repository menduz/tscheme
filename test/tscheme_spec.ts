import assert = module('assert');
import ideone = module('../tscheme');

describe('S', () => {
    describe('#evaluate()', () => {
        it('should evaluate an if object', () => {
            var testif = '(if #t 1 0)';
            var stest = parse(testif, global);
            assert.equal(String(stest.evaluate()), "1");
        });
    });
});
