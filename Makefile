#
# node.js
#

run:
	coffee main

#
# browser
#

build:
	mkdir -p public
	browserify web/app.coffee -o public/app.js
	cp web/index.html public/index.html
	cp web/bootstrap.css public/bootstrap.css

server:
	cd public && python -m SimpleHTTPServer 8000

clean:
	rm -rf public
