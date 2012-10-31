all:
	tsc *.ts
	tsc test/*.ts

clean:
	rm -f *.js test/*.js
