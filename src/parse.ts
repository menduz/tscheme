// Scheme interpreter by TypeScript

//////////////////////////////////////////////////
// parse
//////////////////////////////////////////////////

function parse(str: string): string[] {
    // read S-expression from string

    return readFrom(tokenize(str));
}

function tokenize(str: string): string[] {
    // convert string to list of tokens

    function replaceAll(expression: string, org: string, dest: string): string {
        return expression.split(org).join(dest);
    }

    str = replaceAll(str, "(", " ( ");
    str = replaceAll(str, ")", " ) ");

    var list: string[] = str.split(/\s+/);
    var res = [];
    for (var i = 0; i < list.length; ++i) {
        if (list[i] !== '') {
            res.push(list[i]);
        }
    }

    return res;
}

function readFrom(tokens: string[]): any[] {
    // read expression from list of tokens

    function innerReadFrom(tokens: string[]): any {
        if (tokens.length === 0) {
            console.log("SyntaxError: unexpected EOF while reading");
        }

        var token: string = tokens.shift();

        if (token === "(") {
            var L: any[] = [];
            while (tokens[0] != ")") {
                L.push(readFrom(tokens));
            }
            tokens.shift();
            return L;
        } else if (token === ")") {
            console.log("SyntaxError: unexpected )");
        } else {
            var isNotANumber: (string) => bool = isNaN;
            if (!isNotANumber(token)) {
                if (token.indexOf(".") != -1) {
                    return parseFloat(token);
                } else {
                    return parseInt(token);
                }
            } else {
                return token;
            }
        }
    }

    return innerReadFrom(tokens);
}
