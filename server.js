/**
 * Created by th on 2/27/2016.
 */
var express= require('express');
var app= express();
var bodyParser= require('body-parser');
var oracledb = require('oracledb');

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

var connAttrs= {
    "user": "system",
    "password" : "orcl",

    "connectString" : "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = Furqan-PC)(PORT = 1521))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = XE)))"
    //  "tns": "system@//localhost:1521/xe"
    // "connectString" : "mdt.us.oracle.com/dborcl",

}
app.get('/nbtry/:USERNAME/:PASSWORD', function (req, res) {
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
         connection.execute("SELECT USERNAME FROM ADMIN where USERNAME=:USERNAME and PASSWORD=:PASSWORD", [req.params.USERNAME,req.params.PASSWORD], {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err || result.rows.length < 1) {
        //        console.log(JSON.stringify(result.rows));
               console.log("Invalid USER")

            }
            else {
                res.contentType('application/json').status(200);
                res.send(JSON.stringify(result.rows));
                res.redirect("not.html");
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /nbtry : Connection released");
                    }
                });
        });
    });
});

//admin notification
app.get('/admin/notification', function (req, res) {
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

        connection.execute("select * from notification", {}, {
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
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /notification : Connection released");
                    }
                });
        });
    });
});
 //to get notice from admin
app.get('/student/notification/:id', function (req, res) {
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

        connection.execute("select sender, notice from notification where reciever= 'student' ", {}, {
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
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /notification : Connection released");
                    }
                });
        });
    });
});

// to get notice for teachers from admin

app.get('/teacher/notification/:id', function (req, res) {
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

        connection.execute("select sender, notice from notification where reciever= 'teachers' ", {}, {
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
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /notification : Connection released");
                    }
                });
        });
    });
});



//to get student notice from teachers

app.get('/student/:id', function (req, res) {
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

        connection.execute("select sender, notice from announcement where dept_id=(select dept_id from student where std_id= :id) and BATCH= (select batch from student where std_id=:id) and SECTION=(select section from student where std_id= :id )", [req.params.id], {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err) {
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error getting notice",
                    detailed_message: err.message
                }));
            } else {
                res.contentType('application/json').status(200);
                res.send(JSON.stringify(result.rows));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /notice: Connection released");
                    }
                });
        });
    });
});

app.listen(3000);
console.log("server is on");
