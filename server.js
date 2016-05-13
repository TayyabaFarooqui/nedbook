/**
 * Created by Furqan on 3/7/2016.
 */
var express= require('express');
var gcm = require('node-gcm');
var http= require('http');
var cors= require('cors');
var app= express();
var bodyParser= require('body-parser');
var oracledb = require('oracledb');

app.use(bodyParser.json());


var device_token;

//app.use(cors());
app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.set('port',3000);
//app.use(express.static(__dirname + "/www"));

var connAttrs= {
  "user": "system",
  "password" : "orcl",

  "connectString" : "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = Furqan-PC)(PORT = 1521))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = XE)))"


}

//for notification register
app.post('/register', function(req, res){

  device_token = req.body.device_token;
  console.log('device token received');
  console.log(device_token);
  res.send('ok');
});
// register done

// for push
app.get('/push/:SENDER/:NOTICE', function(req, res){

  var device_tokens = [];
  var message = new gcm.Message();
  var sender = new gcm.Sender('AIzaSyBhgozl-8sVTXPAswk-Jk3zM6WO_wPKTFQ');
  console.log('title'+ req.params.SENDER);
  console.log('msg '+ req.params.NOTICE);

  message.addData('title', req.params.SENDER);
  message.addData('message', req.params.NOTICE);
  message.addData('sound', 'notification');

  message.collapseKey = 'testing';
  message.delayWhileIdle = true;
  message.timeToLive = 3;

  console.log('sending to: ' + device_token);

  device_tokens.push(device_token);

  sender.send(message, device_tokens, 4, function(result){
    console.log(result);
    console.log('push sent to: ' + device_token);
  });

  res.send('ok');
});
// push end

app.get('/admin/login', function (req, res) {
  "use strict";

  oracledb.getConnection(connAttrs, function (err, connection) {
    if (err) {
      // Error connecting to DB
      res.set('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({
        status: 500,
        message: "Error connecting to DB",
        detailed_message: err.message
      }));
      return;
    }

    connection.execute("select * from ADMIN", {}, {
      outFormat: oracledb.OBJECT // Return the result as Object
    }, function (err, result) {
      if (err) {
        res.set('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
          status: 500,
          message: "Error getting notification",
          detailed_message: err.message
        }));
      } else {
        res.contentType('application/json').status(200);
        res.send(JSON.stringify(result.rows));
        console.log(JSON.stringify(result.rows));
      }
      // Release the connection
      connection.release(
        function (err) {
          if (err) {
            console.error(err.message);
          } else {
            console.log("GET /admin/login : Connection released");
          }
        });
    });
  });
});
app.post('/admin', function (req, res) {
  "use strict";
 // if ("application/json" !== req.get('Content-Type')) {
   //     res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
   //         status: 415,
   //         message: "Wrong content-type. Only application/json is supported",
   //         detailed_message: null
   //     }));
   //     return;
  //  }

  oracledb.getConnection(connAttrs, function (err, connection) {
  if (err) {
      // Error connecting to DB
      res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
        status: 500,
        message: "Error connecting to DB",
        detailed_message: err.message
      }));
      return;
   }
    console.log(req.body.SENDER);console.log(req.body.RECIEVER);console.log(req.body.NOTICE);
    connection.execute("INSERT INTO NOTIFICATION VALUES " +
      "(:SENDER, :RECIEVER, :NOTICE, :N_ID) ", [req.body.SENDER, req.body.RECIEVER,
        req.body.NOTICE,null], {
        autoCommit: true,
        outFormat: oracledb.OBJECT // Return the result as Object
      },
      function (err, result) {

        connection.release(
          function (err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log("POST /notification : Connection released");
            }
          });
        res.end();
      });
  });
});
app.get('/student/:ID/:PASSWORD', function (req, res) {
  "use strict";

  oracledb.getConnection(connAttrs, function (err, connection) {
    if (err) {
      // Error connecting to DB
      res.set('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({
        status: 500,
        message: "Error connecting to DB",
        detailed_message: err.message
      }));
      return;
    }

    connection.execute("select STD_ID from STUDENT where STD_ID=:ID and STD_PASSWORD= :PASSWORD ", [req.params.ID,req.params.PASSWORD], {
      outFormat: oracledb.OBJECT // Return the result as Object
    }, function (err, result) {
      console.log(req.params.ID);console.log(req.params.PASSWORD);
      if (err || result.rows.length < 1) {
        console.log(0);
        res.sendStatus(JSON.stringify('0'));

      } else {

        res.sendStatus(JSON.stringify('1'));
        console.log(JSON.stringify(result.rows));
      }
      // Release the connection
      connection.release(
          function (err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log("GET /student/" + req.params.ID + req.params.PASSWORD +" : Connection released");
            }
          });
    });
  });
});

app.get('/student/:N_ID', function (req, res) {
  "use strict";

  oracledb.getConnection(connAttrs, function (err, connection) {
    if (err) {
      // Error connecting to DB
      res.set('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({
        status: 500,
        message: "Error connecting to DB",
        detailed_message: err.message
      }));
      return;
    }

    connection.execute("SELECT * FROM NOTIFICATION WHERE N_ID > :N_ID", [req.params.N_ID], {
      outFormat: oracledb.OBJECT // Return the result as Object
    }, function (err, result) {
      if (err || result.rows.length < 1) {
        res.set('Content-Type', 'application/json');
        var status = err ? 500 : 404;
        res.status(status).send(JSON.stringify({
          status: status,
          message: err ? "Error getting the user profile" : "User doesn't exist",
          detailed_message: err ? err.message : ""
        }));
      } else {
        // res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
        res.send(JSON.stringify(result.rows));
        console.log(JSON.stringify(result.rows));
      }
      // Release the connection
      connection.release(
          function (err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log("GET /student/" + req.params.N_ID + " : Connection released");
            }
          });
    });
  });
});


//app.post('/pushtoken', function (req, res) {
//  "use strict";
////    if ("application/json" !== req.get('Content-Type')) {
////        res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
////            status: 415,
////            message: "Wrong content-type. Only application/json is supported",
////            detailed_message: null
////        }));
////        return;
////    }
//  oracledb.getConnection(connAttrs, function (err, connection) {
//    if (err) {
//      // Error connecting to DB
//      res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
//        status: 500,
//        message: "Error connecting to DB",
//        detailed_message: err.message
//      }));
//      return;
//    }
//    console.log(req.body.TOKEN);
//    console.log(req.body.STD_ID);
//    connection.execute("UPDATE STUDENT set TOKEN=:TOKEN where STD_ID=:STD_ID ", [req.body.TOKEN,req.body.STD_ID], {
//          autoCommit: true,
//          outFormat: oracledb.OBJECT // Return the result as Object
//        },
//        function (err, result) {
//         // if (err) {
//         //   // Error
//         //   res.set('Content-Type', 'application/json');
//         //   res.status(400).send(JSON.stringify({
//         //     status: 400,
//         //     message: err.message.indexOf("ORA-00001") > -1 ? "User already exists" : "Input Error",
//         //     detailed_message: err.message
//         //   }));
//         // } else {
//         //   // Successfully created the resource
//         ////   res.status(201).set('Location', '/contactlist/' + req.body.name  ).end();
//         // }
//          // Release the connection
//          connection.release(
//              function (err) {
//                if (err) {
//                  console.error(err.message);
//                } else {
//                  console.log("PuT /pushtoken : Connection released");
//                }
//              });
//          res.send('ok');
//         res.end();
//        });
//  });
//});
//update comment


// update again
// Build UPDATE statement and prepare bind variables
var buildUpdateStatement = function buildUpdateStatement(req) {
  "use strict";

  var statement = "",
      bindValues = {};
  //if (req.body.TOKEN) {
  //  statement += "TOKEN = :TOKEN";
  //  bindValues.TOKEN = req.body.TOKEN;
  //}
  if (req.body.TOKEN) {
    statement += "TOKEN = :TOKEN";
    bindValues.TOKEN = req.body.TOKEN;
  }
  statement += " WHERE STD_ID = :STD_ID";
  bindValues.STD_ID = req.params.STD_ID;
  statement = "UPDATE STUDENT SET " + statement;
  
  return {
    statement: statement,
    bindValues: bindValues
  };
};

// Http method: PUT
// URI        : /user_profiles/:USER_NAME
// Update the profile of user given in :USER_NAME
app.put('/pp/:STD_ID', function (req, res) {
  "use strict";
  console.log('in put');
  console.log(req.params.STD_ID);
  console.log(req.body.TOKEN);
  // if ("application/json" !== req.get('Content-Type')) {
  //     res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
  //         status: 415,
  //         message: "Wrong content-type. Only application/json is supported",
  //         detailed_message: null
  //     }));
  //     return;
  //}

  oracledb.getConnection(connAttrs, function (err, connection) {
    if (err) {
      // Error connecting to DB
      res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
        status: 500,
        message: "Error connecting to DB",
        detailed_message: err.message
      }));
      return;
    }

    var updateStatement = buildUpdateStatement(req);
    connection.execute(updateStatement.statement, updateStatement.bindValues, {
   // connection.execute("UPDATE STUDENT set TOKEN=:TOKEN where STD_ID=:STD_ID ", [req.body.TOKEN, req.params.STD_ID], {
          autoCommit: true,
          outFormat: oracledb.OBJECT // Return the result as Object
        },
        function (err, result) {
              if (err || result.rowsAffected === 0) {
          // Error
                  res.set('Content-Type', 'application/json');
                  res.status(400).send(JSON.stringify({
                      status: 400,
                      message: err ? "Input Error" : "User doesn't exist",
                      detailed_message: err ? err.message : ""
                  }));
              } else {
          // Resource successfully updated. Sending an empty response body.
                  res.status(204).end();
            }
          // Release the connection
          connection.release(
              function (err) {
                if (err) {
                  console.error(err.message);
                } else {

                  console.log("PUT /pp/" + req.params.STD_ID + " : Connection released ");
                }
              });
        //  res.send('ok');
          res.end();
        });
  });
});

//update again


http.createServer(app).listen(app.get('port'),function(){
  console.log('Express server listening on port'+app.get('port'));
});
//app.listen(3000);
//console.log("server is on");
