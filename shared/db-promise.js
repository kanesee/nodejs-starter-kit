var mysql = require('promise-mysql');

exports.pool = mysql.createPool({
  host    : 'localhost',
  user    : 'root',
  password: 'PASSWORD',
  database: 'DATABASE',
  connectionLimit: 10
});

/******************
 * Ensure proper shutdown when exiting
 ******************/
process.on('SIGINT', function() { process.exit(); });
process.on('exit', function shutdown() {
	console.log("shutting down db-promise pool...");
	if( exports.pool ) {
		exports.pool.end();
		console.log("closed db-promise pool");
	}
});

