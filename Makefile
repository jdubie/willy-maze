#
# node.js
#

run:
	coffee main

#
# browser
#

build:
	browserify web/app.coffee -o public/app.js
	cp web/index.html public/index.html

server:
	cd public && python -m SimpleHTTPServer 8000

clean:
	rm -f app.js
