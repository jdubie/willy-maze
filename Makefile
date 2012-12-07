run:
	coffee main

build:
	browserify web.coffee -o app.js
