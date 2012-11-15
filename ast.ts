// Scheme interpreter by TypeScript

import s_expression = module('s_expression');

//////////////////////////////////////////////////
// ast
//////////////////////////////////////////////////

export function ast(exps: any): s_expression.S {
    // Return ast of Scheme from strings

    if (typeof exps === 'string') {
        return new s_expression.SSymbol(exps);
    } else if (! (exps instanceof Array)) {
        return new s_expression.SNum(exps);
    } else if (exps[0] === 'quote') {             // (quote exps)
        return new s_expression.SQuote([
            new s_expression.SStr(exps[0]),
            ast(exps[1]),
        ]);
    } else if (exps[0] === 'if') {                // (if test conseq alt)
        return new s_expression.SIf([
            new s_expression.SStr(exps[0]),
            ast(exps[1]),
            ast(exps[2]),
            ast(exps[3]),
        ]);
    } else if (exps[0] === 'define') {            // (define var exps)
        return new s_expression.SDefine([
            new s_expression.SStr(exps[0]),
            new s_expression.SStr(exps[1]),
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'set!') {              // (set! var exps)
        return new s_expression.SSet([
            new s_expression.SStr(exps[0]),
            ast(exps[1]),
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'lambda') {            // (lambad (var*) exps)
        var variables: s_expression.S[] = [];
        for (var i = 0; i < exps[1].length; ++i) {
            variables.push(new s_expression.SStr(exps[1][i]));
        }
        return new s_expression.SLambda([
            new s_expression.SStr(exps[0]),
            variables,
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'begin') {             // (begin exps*)
        var begin = exps[0];
        var tmp = exps.slice(1);
        var expressions = [];
        for (var i = 0; i < tmp.length; ++i) {
            expressions.push(ast(tmp[i]));
        }
        return new s_expression.SBegin([
            new s_expression.SStr(begin),
            expressions,
        ]);
    } else {                                      // (proc exps*)
        var expressions: any[] = [];
        for (var i = 0; i < exps.length; ++i) {
            var s: s_expression.S = ast(exps[i]);
            expressions.push(s);
        }
        return new s_expression.SProc(expressions);
    }
}
