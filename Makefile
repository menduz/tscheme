all:
	tsc --out all.js *.ts canvas/picture_language.ts
	cat *.ts test/tscheme_test.ts > test/test.ts
	tsc test/test.ts

clean:
	rm -f *.js test/*.js
