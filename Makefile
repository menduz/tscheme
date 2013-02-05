all:
	tsc --out src/all.js src/*.ts
	cat src/*.ts test/tscheme_test.ts > test/test.ts
	tsc test/test.ts

clean:
	rm -f src/*.js test/*.js
