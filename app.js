module.exports = (process.env['NODE_ENV'] === "COVERAGE")
    ? require('./app-coverage/server')
    : require('./app/server');