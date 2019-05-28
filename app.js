var express = require("express");               
var app = express();
var bodyParser = require("body-parser"); 
var handlebars = require("express-handlebars").create({ defaultLayout: "main" });
var mysql = require('./dbcon.js'); //moved Mysql credentials to dbcon.js

app.engine("handlebars", handlebars.engine);       
app.set("view engine", "handlebars");
app.set("port", 2743);                              
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function formatDate(date) {
    if (!date || date == null) {
        return '';
    } else {
        var d = new Date(date);
        if (isNaN(d.getMonth())) {
            return '';
        } else {
            month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }
    }

}

//Provide access to static files (CSS & JS)
app.use('/public', express.static('public'));

//Renders index.html
app.get('/', function(req, res, next) {

    console.log("index handler has been fired.");

    var context = {};

    res.render('index', context);
});

app.get('/listing', function(req, res, next) {

    console.log("listing handler has been fired.");

    console.log("Listing SELECT has been fired");

    var context = {};
	
    mysql.pool.query('SELECT Listing.Id, Listing.Address, City.Name as City, '+
        'Listing.ZipCode, PropertyType.Name as PropertyType, Listing.ByOwner, ' +
        'Listing.DateListed, Listing.ListPrice, Listing.DateSold, Listing.SellPrice ' +
        'FROM Listing INNER JOIN City ON Listing.City = City.Id INNER JOIN PropertyType ON Listing.PropertyType = PropertyType.Id', function(err, rows, fields){
		
		if(err){
		
			(err);
			console.log(err);
			return;
		}
		
		var params = [];
	
		for(var row in rows){
		//console.log(rows[row]);
			var addItem = {'Id': rows[row].Id,
					   'Address': rows[row].Address,
                       'City': rows[row].City,
                       'ZipCode': rows[row].ZipCode,
                       'PropertyType': rows[row].PropertyType,
                       'ByOwner': rows[row].ByOwner,
                'DateListed': formatDate(rows[row].DateListed),
					   'ListPrice': rows[row].ListPrice,
                'DateSold': formatDate(rows[row].DateSold),
					   'SellPrice': rows[row].SellPrice};
					
			params.push(addItem);
		}
	
        context.results = params;

            mysql.pool.query('SELECT City.Id, City.Name, State.Name as State FROM City INNER JOIN State ON City.State = State.Id ORDER BY City.Name ASC', function (err, rows, fields) {

                if (err) {
                    next(err);
                    console.log(err);
                    return;
                }

                context.cities = rows;

                mysql.pool.query('SELECT Code FROM ZipCode ORDER BY Code', function (err, rows, fields) {

                    if (err) {
                        next(err);
                        console.log(err);
                        return;
                    }

                    context.zips = rows;

                    mysql.pool.query('SELECT Id, Name FROM PropertyType ORDER BY Name', function (err, rows, fields) {

                        if (err) {
                            next(err);
                            console.log(err);
                            return;
                        }

                        context.property = rows;

                        res.render('listing', context);
                    });

                });

            });


	
	})
});

app.get('/listingFeature', function(req, res, next) {

    console.log("listingFeature handler has been fired.");

    console.log("ListingFeature SELECT has been fired");

    var context = {};
    context.Listing = {
        Id: [req.query.id]
    };
    mysql.pool.query('SELECT ListingFeature.Listing, Feature.Name as Feature FROM `ListingFeature` ' +
        'INNER JOIN Feature on ListingFeature.Feature = Feature.Id WHERE ListingFeature.Listing=?', [req.query.id], function (err, rows, fields) {

            if (err) {

                next(err);
                console.log(err);
                return;
            }

            var params = [];

            for (var row in rows) {

                var addItem = {
                    'Listing': rows[row].Listing,
                    'Feature': rows[row].Feature
                };

                params.push(addItem);
            }

            context.results = params;
            mysql.pool.query('SELECT Id, Name FROM Feature', function (err, rows, fields) {

                if (err) {

                    next(err);
                    console.log(err);
                    return;
                }

                context.features = rows;

                res.render('listingFeature', context);

            })
        })
});

app.get('/property', function(req, res, next) {

    console.log("property handler has been fired.");
	
	console.log("property-type SELECT has been fired");

    var context = {};
	
    mysql.pool.query('SELECT * FROM `PropertyType`', function(err, rows, fields){
		
		if(err){
		
			next(err);
			console.log(err);
			return;
		}
	
		var params = [];
	
		for(var row in rows){
		
			var addItem = {'Id': rows[row].Id,
						   'Name': rows[row].Name};
		
			params.push(addItem);
		}
	
		context.results = params;

		res.render('property', context);
	
	})
});

app.get('/state', function(req, res, next) {

    console.log("state handler has been fired.");

    console.log("state SELECT has been fired");

    var context = {};
	
    mysql.pool.query('SELECT * FROM State', function(err, rows, fields){
		
		if(err){
		
			next(err);
			console.log(err);
			return;
		}
	
		var params = [];
	
		for(var row in rows){
		
			var addItem = {'Id': rows[row].Id,
						   'Name': rows[row].Name};
		
			params.push(addItem);
		}
	
		context.results = params;

		res.render('state', context);
		
	})
});

app.get('/zip', function(req, res, next) {

    console.log("zip handler has been fired.");

    console.log("zip-code SELECT has been fired");

    var context = {};
	
    mysql.pool.query('SELECT * FROM `ZipCode`', function(err, rows, fields){
		
		if(err){
		
			next(err);
			console.log(err);
			return;
		}
	
		var params = [];
	
		for(var row in rows){
		
			var addItem = {'Code': rows[row].Code};
		
			params.push(addItem);
		}
	
		context.results = params;

		res.render('zip', context);
		
	})
});

app.get('/city', function(req, res, next) {

    console.log("city handler has been fired.");

    console.log("city SELECT has been fired");

    var context = {};
	
    mysql.pool.query('SELECT City.Id, City.Name, State.Name as State FROM City INNER JOIN State WHERE City.State = State.Id ORDER BY State.Name, City.Name', function(err, rows, fields){
		
		if(err){
	
			next(err);
			console.log(err);
			return;
        }
	
		var params = [];
	
		for(var row in rows){
		
			var addItem = {'Id': rows[row].Id,
						   'Name': rows[row].Name, 
					       'State': rows[row].State};
		
			params.push(addItem);
		}
	
        context.results = params;

        mysql.pool.query('SELECT Id, Name FROM State ORDER BY Name ASC', function (err, rows, fields) {

            if (err) {
                next(err);
                console.log(err);
                return;
            }

            var states = [];

            for (var row in rows) {

                var thisItem = {
                    'Id': rows[row].Id,
                    'Name': rows[row].Name
                };

                states.push(thisItem);
            }

            context.states = states;

            res.render('city', context);

        });

		
	})
});

app.get('/feature', function(req, res, next) {

    console.log("feature handler has been fired.");

    console.log("feature SELECT has been fired");

    var context = {};
	
    mysql.pool.query('SELECT * FROM Feature', function(err, rows, fields){
		
		if(err){
		
			next(err);
			console.log(err);
			return;
		}
	
		var params = [];
	
		for(var row in rows){
		
			var addItem = {'Id': rows[row].Id,
						   'Name': rows[row].Name};
		
			params.push(addItem);
		}
	
		context.results = params;

		res.render('feature', context);
		
	})
});

//Inserts a record into Property-Type using AJAX calls from the home page via script
app.get('/insertPropertyType',function(req,res,next){
  
    console.log("Insert Property-Type handler has been fired");

    var context = {};
    
    mysql.pool.query("INSERT INTO `PropertyType` (`Name`) VALUES (?)",
        [req.query.Name],

        function(err, result){
            if(err){
              next(err);
              console.log(err);
              return;
            }
			
            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
    })
});

//Inserts a record into Listing-Feature using AJAX calls from the home page via script
app.get('/insertListingFeature', function (req, res, next) {

    console.log("Insert Listing-Feature handler has been fired");

    var context = {};

    mysql.pool.query("INSERT INTO `ListingFeature` (`Listing`, `Feature`) VALUES (?, ?)",
        [req.query.Listing,
            req.query.Feature],

        function (err, result) {
            if (err) {
                next(err);
                console.log(err);
                return;
            }

            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
        })
});

//Inserts a record into State using AJAX calls from the home page via script
app.get('/insertState',function(req,res,next){
  
    console.log("Insert State handler has been fired");

    var context = {};
    
    mysql.pool.query("INSERT INTO `State` (`Name`) VALUES (?)",
        [req.query.Name],

        function(err, result){
            if(err){
              next(err);
              console.log(err);
              return;
            }
			
            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
    })
});

//Inserts a record into Zip-Code using AJAX calls from the home page via script
app.get('/insertZip',function(req,res,next){
  
    console.log("Insert Zip-Code handler has been fired");

    var context = {};
    
    mysql.pool.query("INSERT INTO `ZipCode` (`Code`) VALUES (?)",
        [req.query.Code],

        function(err, result){
            if(err){
              next(err);
              console.log(err);
              return;
            }
			
            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
    })
});

//Inserts a record into City using AJAX calls from the home page via script
app.get('/insertCity',function(req,res,next){
  
    console.log("Insert City handler has been fired");

    var context = {};
    
    mysql.pool.query("INSERT INTO `City` (`Name`, `State`) VALUES (?, ?)",
        [req.query.Name,
		 req.query.State], 

        function(err, result){
            if(err){
              next(err);
              console.log(err);
              return;
            }
			
            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
    })
		
});

//Inserts a record into Feature using AJAX calls from the home page via script
app.get('/insertFeature',function(req,res,next){
  
    console.log("Insert Feature handler has been fired");

    var context = {};
    
    mysql.pool.query("INSERT INTO `Feature` (`Name`) VALUES (?)",
        [req.query.Name], 

        function(err, result){
            if(err){
              next(err);
              console.log(err);
              return;
            }
			
            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
    })
});

//Inserts a record into Listing using AJAX calls from the home page via script
app.get('/insertListing',function(req,res,next){
  
    console.log("Insert Listing handler has been fired");

    var context = {};
    
    mysql.pool.query("INSERT INTO `Listing` (`Address`, `City`, `ZipCode`, `PropertyType`, `ByOwner`, `DateListed`, `ListPrice`, `DateSold`, `SellPrice`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [req.query.Address,
		 req.query.City,
		 req.query.ZipCode,
		 req.query.PropertyType,
		 req.query.ByOwner,
		 req.query.DateListed,
		 req.query.ListPrice,
		 req.query.DateSold,
		 req.query.SellPrice], 

        function(err, result){
            if(err){
              next(err);
              console.log(err);
              return;
            }
			
            context.inserted = result.insertId;
            res.send(JSON.stringify(context));
    })
});


//Displays a State record in an edit form
app.get('/updateState', function (req, res, next) {

    var context = {};

    mysql.pool.query('SELECT Id, Name FROM State WHERE Id = ? LIMIT 1', [req.query.id], function (err, rows, fields) {

        if (err) {
            next(err);
            console.log(err);
            return;
        }

        var thisItem = {
            'Id': rows[0].Id,
            'Name': rows[0].Name,
        };

        context.results = thisItem;
        res.render('update_state', context);
    })
});

//Displays a zip-code record in an edit form
app.get('/updateZip', function (req, res, next) {

    var context = {};

    mysql.pool.query('SELECT Code FROM ZipCode WHERE Code = ? LIMIT 1', [req.query.id], function (err, rows, fields) {

        if (err) {
            next(err);
            console.log(err);
            return;
        }

        var thisItem = {
            'Code': rows[0].Code,
        };

        context.results = thisItem;
        res.render('update_zip', context);
    })
});


//Displays a City record in an edit form with State options to select from
app.get('/updateCity', function (req, res, next) {

    var context = {};

    mysql.pool.query('SELECT Id, Name, State FROM City WHERE Id = ? LIMIT 1', [req.query.id], function (err, rows, fields) {

        if (err) {
            next(err);
            console.log(err);
            return;
        }

        var states = [];

        var thisItem = {
            'Id': rows[0].Id,
            'Name': rows[0].Name,
            'State': rows[0].State
        };

        context.results = thisItem;

        mysql.pool.query('SELECT Id, Name FROM State ORDER BY Name ASC', function (err, rows, fields) {

            if (err) {
                next(err);
                console.log(err);
                return;
            }

            for (var row in rows) {

                var thisItem = {
                    'Id': rows[row].Id,
                    'Name': rows[row].Name
                };

                states.push(thisItem);
            }

            context.states = states;

            res.render('update_city', context);
        });

    })
});


//Displays a Feature record in an edit form
app.get('/updateFeature', function (req, res, next) {

    var context = {};

    mysql.pool.query('SELECT Id, Name FROM Feature WHERE Id = ? LIMIT 1', [req.query.id], function (err, rows, fields) {

        if (err) {
            next(err);
            console.log(err);
            return;
        }

        var thisItem = {
            'Id': rows[0].Id,
            'Name': rows[0].Name,
        };

        context.results = thisItem;
        res.render('update_feature', context);
    })
});


//Displays a property-type record in an edit form
app.get('/updateProperty', function (req, res, next) {

    var context = {};

    mysql.pool.query('SELECT Id, Name FROM PropertyType WHERE Id = ? LIMIT 1', [req.query.id], function (err, rows, fields) {

        if (err) {
            next(err);
            console.log(err);
            return;
        }

        var thisItem = {
            'Id': rows[0].Id,
            'Name': rows[0].Name,
        };

        context.results = thisItem;
        res.render('update_property', context);
    })
});

//Displays a Listing record in an edit form with options to select from
app.get('/updateListing', function (req, res, next) {

    var context = {};

    mysql.pool.query('SELECT Id, Address, City, ZipCode, PropertyType, ByOwner, DateListed, ListPrice, DateSold, SellPrice FROM Listing WHERE Id = ? LIMIT 1', [req.query.id], function (err, rows, fields) {

        if (err) {
            next(err);
            console.log(err);
            return;
        }

        var cities = [];

        context.results = rows[0];

        mysql.pool.query('SELECT City.Id, City.Name, State.Name as State FROM City INNER JOIN State ON City.State = State.Id ORDER BY City.Name ASC', function (err, rows, fields) {

            if (err) {
                next(err);
                console.log(err);
                return;
            }

            context.cities = rows;

            mysql.pool.query('SELECT Code FROM ZipCode ORDER BY Code', function (err, rows, fields) {

                if (err) {
                    next(err);
                    console.log(err);
                    return;
                }

                context.zips = rows;

                mysql.pool.query('SELECT Id, Name FROM PropertyType ORDER BY Name', function (err, rows, fields) {

                    if (err) {
                        next(err);
                        console.log(err);
                        return;
                    }

                    context.property = rows;

                    res.render('update_listing', context);
                });

            });

        });

    })
});



app.put('/updateState/:id', function (req, res) {
    console.log(req.body);
    console.log(req.params.id);

    var sql = "UPDATE State SET Name=? WHERE Id=?";
    var inserts = [req.body.Name, req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        res.setHeader('Content-Type', 'application/json');
        console.log(results);
        if (error) {
            console.log(error)
            res.end(JSON.stringify(error));
        } else {
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.status(200);
            res.end(JSON.stringify(response));
        }
    });
});

app.put('/updateZip/:id', function (req, res) {
    var sql = "UPDATE ZipCode SET Code=? WHERE Code=?";
    var inserts = [req.body.Name, req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        res.setHeader('Content-Type', 'application/json');
        if (error) {
            console.log(error)
            res.end(JSON.stringify(error));
        } else {
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.status(200);
            res.end(JSON.stringify(response));
        }
    });
});

app.put('/updateCity/:id', function (req, res) {
    var sql = "UPDATE City SET Name=?, State=? WHERE Id=?";
    var inserts = [req.body.Name, req.body.State, req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        res.setHeader('Content-Type', 'application/json');
        if (error) {
            console.log(error)
            res.end(JSON.stringify(error));
        } else {
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.status(200);
            res.end(JSON.stringify(response));
        }
    });
});

app.put('/updateFeature/:id', function (req, res) {

    var sql = "UPDATE Feature SET Name=? WHERE Id=?";
    var inserts = [req.body.Name, req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        res.setHeader('Content-Type', 'application/json');
        console.log(results);
        if (error) {
            console.log(error)
            res.end(JSON.stringify(error));
        } else {
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.status(200);
            res.end(JSON.stringify(response));
        }
    });
});

app.put('/updateProperty/:id', function (req, res) {

    var sql = "UPDATE PropertyType SET Name=? WHERE Id=?";
    var inserts = [req.body.Name, req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        res.setHeader('Content-Type', 'application/json');
        console.log(results);
        if (error) {
            console.log(error)
            res.end(JSON.stringify(error));
        } else {
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.status(200);
            res.end(JSON.stringify(response));
        }
    });
});

app.put('/updateListing/:id', function (req, res) {
    var sql = "UPDATE Listing SET Address=?, City=?, ZipCode=?, PropertyType=?, ByOwner=?, DateListed=?, ListPrice=?, DateSold=?, SellPrice=? WHERE Id=?";
    var inserts = [
        req.body.Address,
        req.body.City,
        req.body.ZipCode,
        req.body.PropertyType,
        req.body.ByOwner,
        req.body.DateListed,
        req.body.ListPrice,
        req.body.DateSold,
        req.body.SellPrice,
        req.params.id];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        res.setHeader('Content-Type', 'application/json');
        if (error) {
            console.log(error)
            res.end(JSON.stringify(error));
        } else {
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.status(200);
            res.end(JSON.stringify(response));
        }
    });
});


//Deletes a record in the database using an id generated from the home page via script
//app.get('/delete', function(req, res, next) {
//    var context = {};
//    mysql.pool.query("DELETE FROM `workouts` WHERE id = ?",
//        [req.query.id],
//        function(err, result) {
//            if(err){
//                next(err);
//                console.log(err);
//                return;
//            }
//        });
//});

//Handler gets called when user selects edit from the home page. A separate view with form
//is rendered to facilitate edit of a single record. All records are displayed.
//app.get('/editRecord',function(req, res, next){
//    var context = {};
//    mysql.pool.query('SELECT * FROM `workouts` WHERE id=?',
//        [req.query.id],
//        function(err, rows, fields){
//            if(err){
//                next(err);
//                return;
//            }
//            var param = [];

 //           for(var row in rows){
//                var addItem = {'name': rows[row].name,
//                            'reps': rows[row].reps,
//                            'weight': rows[row].weight,
//                            'date':rows[row].date,
//                            'lbs':rows[row].lbs,
//                            'id':rows[row].id};

 //               param.push(addItem);
 //           }

 //       context.results = param[0];
//        res.render('editRecord', context);
//    });
//});

//Selects a single record by 'id' and updates the field(s) with user entered value(s). If no value
//is provided, the existing value is used.
//app.get('/editRecordReturn', function(req, res, next){
//    var context = {};

//    mysql.pool.query("SELECT * FROM `workouts` WHERE id=?",
 //       [req.query.id],
//        function(err, result){
 //           if(err){
//                next(err);
//                return;
//            }
 //           if(result.length == 1){
 //               var current = result[0];

                
//                if(req.query.unitCheck === "on"){
//                    req.query.unitCheck = "1";
//               }
 //               else{
//                    req.query.unitCheck = "0";
 //               }

//                mysql.pool.query('UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?',  //Make a query to UPDATE and require either what the name is now or the updated name
 //               [req.query.exercise || current.name,
 //               req.query.reps || current.reps,
 //               req.query.weight || current.weight,
 //               req.query.date || current.date,
 //               req.query.unitCheck,
 //               req.query.id],
 //               function(err, result){
 //                   if(err){
 //                       next(err);
 //                       return;
  //                  }

 //                   mysql.pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
 //                       if(err){
 //                           next(err);
 //                           return;
 //                       }
 //                       var param = [];

  //                      for(var row in rows){
  //                          var addItem = {'name': rows[row].name,
 //                           'reps': rows[row].reps,
 //                           'weight': rows[row].weight,
 //                           'date':rows[row].date,
 //                           'id':rows[row].id};

  //                          if(rows[row].lbs){
  //                              addItem.lbs = "lbs";
  //                          }
  //                          else{
  //                              addItem.lbs = "kg";
  //                          }
  //                          param.push(addItem);
  //                      }

   //                     context.results = param;
   //                     res.render('home', context);
    //                });
    //            });
   //         }
   // });
//  });

app.use(function(req, res){                
	res.status(404);
	res.render("404");
});

app.use(function(err, req, res, next){
	console.log(err.stack);
	res.status(500);
	res.render("500");
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});