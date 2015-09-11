SPIKE-SIGNATURE-PAD
============

PREREQUISITES
--------------
* Install Node and NPM
* Install node packages: "npm install"
* Install grunt "npm install -g grunt-cli"
* Install JSCoverage from : http://siliconforks.com/jscoverage/download.html

EXECUTING
----------
* npm start

TESTING
-------
* grunt test runs tests using mocks for dependant APIs
* grunt integration runs tests using the real dependant APIs
* grunt reports (coverage, plato)

ENVIRONMENTS
-------------
* The environment get set by the variable: "NODE_ENV".
* Different configuration settings can be set in config/[ENVIRONMENT].json
* If nothing set "development" will be the default.
* Common properties are set in default.json
* Possible environments are: development, test, integration, coverage, staging, production

IISNODE
-------------
* logs are located under D:/config/product-api
* config files are read from D:/config/product-api
* the path for this service under ISS is /node/product/{endpoint}
* documentation is hosted under the /docs endpoint

DEPLOYMENT
-------------
* git pull
* copy config folder to D:/config/product-api
* restart the server