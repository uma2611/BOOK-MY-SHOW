"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var validator_1 = __importDefault(require("validator"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var DatabaseConnection_1 = __importDefault(require("../database/DatabaseConnection"));
var databaseConnection = new DatabaseConnection_1.default();
var client = databaseConnection.getClient();
var ApiControllers = /** @class */ (function () {
    function ApiControllers() {
        //Home Page
        this.getHome = function (request, response) {
            response.send("WELCOME TO BOOK MY SHOW ASSIGNMENT");
        };
        // 1 - Ability to view all the movies playing in your city
        this.viewAllMovies = function (request, response) {
            try {
                var location_1 = request.query.location;
                if (location_1 === undefined || location_1.length === 0) {
                    throw new Error();
                }
                else {
                    client.connect();
                    client.query("SELECT movie_name FROM uma.movies WHERE cinema_hall_name IN(SELECT cinema_hall_name FROM uma.cinema WHERE city_name IN (SELECT city FROM uma.location WHERE city = $1));", ["" + location_1], function (err, result) {
                        if (err) {
                            response.status(500).send("Query not executed " + err);
                        }
                        else {
                            //console.log(result.rows);
                            if (result.rows.length === 0) {
                                response.status(400).send(location_1 + " is not present in database");
                            }
                            else {
                                response.status(200).send(result.rows);
                            }
                        }
                    });
                    // client.end();
                }
            }
            catch (err) {
                response.status(400).send(err + " Please enter location as a Params");
            }
        };
        // 2 - Ability to check all cinemas in which a movie is playing along with all the showtimes
        this.allCinemasAMoviesIsPlaying = function (request, response) {
            try {
                var location_2 = request.query.location;
                var movie_name_1 = request.query.movie_name;
                if (location_2 === undefined || movie_name_1 === undefined) {
                    throw new Error();
                }
                else {
                    client.connect();
                    client.query("SELECT cinema_hall_name, movie_name, movie_time FROM uma.movies WHERE movie_name = $2 AND cinema_hall_name IN(SELECT cinema_hall_name FROM uma.cinema WHERE city_name IN (SELECT city FROM uma.location WHERE city = $1));", ["" + location_2, "" + movie_name_1], function (err, result) {
                        if (err) {
                            response.status(500).send("Query not executed " + err);
                        }
                        else {
                            if (result.rows.length === 0) {
                                response.status(400).send(location_2 + " and " + movie_name_1 + " are not present in database");
                            }
                            else {
                                response.status(200).send(result.rows);
                            }
                        }
                    });
                    //client.end();
                }
            }
            catch (err) {
                response.status(400).send(err + " Please enter correct Params for location and movie name");
            }
        };
        // 3 - For each showtime, check the availability of seats 
        this.availabilityOfSeats = function (request, response) {
            try {
                var location_3 = request.query.location;
                if (location_3 === undefined || location_3.length === 0) {
                    throw new Error();
                }
                else {
                    client.connect();
                    client.query("SELECT movie_id, cinema_hall_name, movie_name, movie_time, seats FROM uma.movies WHERE cinema_hall_name IN(SELECT cinema_hall_name FROM uma.cinema WHERE city_name IN (SELECT city FROM uma.location WHERE city = $1));", ["" + location_3], function (err, result) {
                        if (err) {
                            response.status(500).send("Query not executed " + err);
                        }
                        else {
                            if (result.rows.length === 0) {
                                response.status(400).send(location_3 + " is not present in database");
                            }
                            else {
                                response.status(200).send(result.rows);
                            }
                        }
                    });
                    //client.end();
                }
            }
            catch (err) {
                response.status(400).send(err + " Please enter correct location in Pramas");
            }
        };
        // 4 - User Sign up
        this.userSignup = function (request, response) {
            try {
                var userSignup_1 = request.body;
                //console.log(userSignup);
                if (validator_1.default.isEmail(userSignup_1.email)) {
                    client.connect();
                    client.query("SELECT email FROM uma.users WHERE email = $1", [userSignup_1.email], function (err, result) {
                        //console.log(result.rows);
                        if (err) {
                            response.status(500).send(err);
                        }
                        else {
                            if (result.rows.length === 0) {
                                client.query("INSERT INTO uma.users (user_name, email, password) VALUES ($1, $2, $3)", [userSignup_1.user_name, userSignup_1.email, userSignup_1.password], function (err, result) {
                                    if (err) {
                                        response.status(400).send("Data not inserted into database " + err);
                                    }
                                    else {
                                        response.status(200).send("User registered successfully :) ");
                                    }
                                });
                            }
                            else {
                                response.status(200).send("This user already present please try another");
                            }
                        }
                    });
                }
                else {
                    response.status(400).send("Please enter correct email");
                }
            }
            catch (err) {
                response.status(400).send(err + " please insert user name, email, password in body request");
            }
        };
        // 5 -  User login 
        this.userLogin = function (request, response) {
            try {
                var userData_1 = request.body;
                client.connect();
                client.query("SELECT * FROM uma.users WHERE email = $1 AND password = $2", ["" + userData_1.email, "" + userData_1.password], function (err, result) {
                    if (err) {
                        response.status(500).send("Query not executed " + err);
                    }
                    else {
                        if (result.rows[0]["token"] === null) {
                            var userEmail = userData_1.email;
                            var user = { name: userEmail };
                            var accessToken = jsonwebtoken_1.default.sign(user, "myNameIsUmaShankarAndIMSoftwareDevelopmentEngineerAtCAWStudios");
                            //response.send(accessToken);
                            client.query("UPDATE uma.users set token = $1 WHERE email =$2", ["" + accessToken, "" + userData_1.email], function (error, result2) {
                                if (error) {
                                    response.status(500).send("Not updated in database " + error);
                                }
                                else {
                                    response.status(200).send("user login successfully :) ");
                                }
                            });
                        }
                        else {
                            response.status(200).send("user already logged in :) ");
                        }
                    }
                });
            }
            catch (err) {
                response.status(400).send(err + " please insert email, password in body request");
            }
        };
        // 6 - Ability to book a ticket. (No payment gateway integration is required. Assume tickets can be booked for free)
        this.userBooking = function (request, response) {
            try {
                var date_1 = new Date();
                //console.log(date);
                client.connect();
                var userBooking_1 = request.body;
                client.query("SELECT * FROM uma.users WHERE email = $1", ["" + userBooking_1.email], function (err, result) {
                    if (err) {
                        response.status(500).send("Query not executed " + err);
                    }
                    else {
                        if (result.rows[0]["token"] === null) {
                            response.status(200).send("This user not logged in");
                        }
                        else {
                            var token = result.rows[0]["token"];
                            jsonwebtoken_1.default.verify(token, "myNameIsUmaShankarAndIMSoftwareDevelopmentEngineerAtCAWStudios", function (error, res) {
                                if (error) {
                                    response.status(200).send("This is not a correct user");
                                }
                                else {
                                    client.query("SELECT seats FROM uma.movies WHERE movie_id =$1", ["" + userBooking_1.movie_id], function (err, result) {
                                        if (err) {
                                            response.status(500).send("Query not executed " + err);
                                        }
                                        else {
                                            var movieArray;
                                            var userArray;
                                            movieArray = result.rows[0]["seats"];
                                            //response.send(movieArray);
                                            userArray = userBooking_1.seats;
                                            var count = 0;
                                            for (var i = 0; i < userArray.length; i++) {
                                                if (movieArray.includes(userArray[i])) {
                                                    count++;
                                                    movieArray.forEach(function (element, index) {
                                                        if (element === userArray[i]) {
                                                            movieArray.splice(index, 1);
                                                        }
                                                    });
                                                }
                                                else {
                                                    response.status(200).send(userArray[i] + " " + "seat not available\n" + "available seats are " + movieArray);
                                                    return;
                                                }
                                            }
                                            if (count === userArray.length) {
                                                client.query("UPDATE uma.movies SET seats = $1 WHERE movie_id = $2", [movieArray, userBooking_1.movie_id], function (err, result) {
                                                    if (err) {
                                                        response.status(500).send("Query not executed " + err);
                                                    }
                                                });
                                                client.query("UPDATE uma.users SET seats = $1, booking_date =$3 WHERE email = $2 ;", [userArray, userBooking_1.email, date_1], function (err, result) {
                                                    if (err) {
                                                        response.status(500).send("Query not executed " + err);
                                                    }
                                                    else {
                                                        response.status(200).send("BOOKING SUCCESSFUL: " + userArray);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
            catch (err) {
                response.status(400).send(err + " please insert movie_id, email, seats in request body");
            }
        };
    }
    return ApiControllers;
}());
exports.default = ApiControllers;
