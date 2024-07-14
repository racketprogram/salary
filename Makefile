run:
	pm2 start server.js
	pm2 start ngrok -- http 8080 --log=ngrok.log

build:
	browserify client.js -s client --debug -o client.bundle.js
