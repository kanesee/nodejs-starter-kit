var mysql = require('mysql');

var db_config = {
  host    : 'localhost',
  user    : 'root',
  password: 'PASSWORD',
  database: 'DATABASE'
};

exports.connection;

function handleDisconnect() {
  exports.connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  exports.connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  exports.connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

/******************
 * Ensure proper shutdown when exiting
 ******************/
process.on('SIGINT', function() { process.exit(); });
process.on('exit', function shutdown() {
	console.log("shutting down...");
	if( exports.connection ) {
		console.log("close mysql");
		exports.connection.end();
	}
});

