import e, * as express from "express";
import validator from 'validator';
import jwt from "jsonwebtoken";
import DatabaseConnection from "../database/DatabaseConnection";

const databaseConnection = new DatabaseConnection();
const client = databaseConnection.getClient();

class ApiControllers{

    //Home Page
    getHome = (request:express.Request, response:express.Response) => {
       
        response.send("WELCOME TO BOOK MY SHOW ASSIGNMENT");
    };




    // 1 - Ability to view all the movies playing in your city
    viewAllMovies = (request: express.Request, response: express.Response) => {
        try{
            const location = request.query.location;
            if(location === undefined || location.length === 0){
                throw new Error();
            } else{
                client.connect();
                client.query("SELECT movie_name FROM uma.movies WHERE cinema_hall_name IN(SELECT cinema_hall_name FROM uma.cinema WHERE city_name IN (SELECT city FROM uma.location WHERE city = $1));",[`${location}`],(err, result) => {
                if(err){
                    response.status(500).send("Query not executed " + err);
                } else {
                    //console.log(result.rows);
                    if(result.rows.length === 0){
                        response.status(400).send(`${location} is not present in database`);
                    } else{
                         response.status(200).send(result.rows);
                    }
                }
                
            });
            // client.end();
            }
 
        } catch(err){
            response.status(400).send(err + " Please enter location as a Params");
        }
    }




    // 2 - Ability to check all cinemas in which a movie is playing along with all the showtimes
    allCinemasAMoviesIsPlaying =  (request: express.Request, response: express.Response) => {
        try{
            const location = request.query.location;
            const movie_name = request.query.movie_name;
            if(location === undefined || movie_name === undefined){
                throw new Error();
            } else {
                client.connect();
                client.query("SELECT cinema_hall_name, movie_name, movie_time FROM uma.movies WHERE movie_name = $2 AND cinema_hall_name IN(SELECT cinema_hall_name FROM uma.cinema WHERE city_name IN (SELECT city FROM uma.location WHERE city = $1));",[`${location}`, `${movie_name}`],(err, result) => {
                if(err){
                    response.status(500).send("Query not executed " + err);
                } else {
                    if(result.rows.length === 0){
                        response.status(400).send(`${location} and ${movie_name} are not present in database`);
                    } else{
                    response.status(200).send(result.rows);

                    }
                }
                
            });
            //client.end();
            }
            
        } catch(err) {
            response.status(400).send(err + " Please enter correct Params for location and movie name");
        }
    }





    // 3 - For each showtime, check the availability of seats 
    availabilityOfSeats = (request: express.Request, response: express.Response) => {
        try{
            const location = request.query.location;
            if(location === undefined || location.length === 0){
                throw new Error();
            } else{
                client.connect();
                client.query("SELECT movie_id, cinema_hall_name, movie_name, movie_time, seats FROM uma.movies WHERE cinema_hall_name IN(SELECT cinema_hall_name FROM uma.cinema WHERE city_name IN (SELECT city FROM uma.location WHERE city = $1));",[`${location}`], (err, result) => {
                if(err){
                    response.status(500).send("Query not executed " + err);
                } else{
                    if(result.rows.length === 0){
                        response.status(400).send(`${location} is not present in database`);
                    } else{
                        response.status(200).send(result.rows);
                    }
                }
                
            });
            //client.end();
            }
            
        } catch(err) {
            response.status(400).send(err + " Please enter correct location in Pramas");
        }
    }



    // 4 - User Sign up
    userSignup =  (request: express.Request, response:express.Response) => {
        try{
            const userSignup = request.body;
            if(userSignup.email && userSignup.user_name && userSignup.password){
                //console.log(userSignup);
                if(validator.isEmail(userSignup.email)){
                    client.connect();
                    client.query("SELECT email FROM uma.users WHERE email = $1", [userSignup.email], (err, result) => {
                        //console.log(result.rows);
                        if(err){
                            response.status(500).send(err);
                        } else{
                            if(result.rows.length === 0){
                                client.query("INSERT INTO uma.users (user_name, email, password) VALUES ($1, $2, $3)", [userSignup.user_name, userSignup.email, userSignup.password], (err, result) => {
                                if(err){
                                    response.status(400).send("Data not inserted into database " + err);
                                } else{
                                    response.status(200).send("User registered successfully :) ");
                                }
                            })
                            } else {
                                response.status(200).send("This user already present please try another");
                            }
                        }
                        
                    })
                    
                } else{
                    response.status(400).send("Please enter correct email");
                } 
            } else{
                //console.log("Something is miss");
                throw new Error();
            }
            //console.log(userSignup);
                
        } catch(err) {
            response.status(400).send(err + " please insert 'user_name', 'email', 'password' in body request");
        }
    }





    // 5 -  User login 
    userLogin = (request: express.Request, response: express.Response) => {
        try{
            const userData = request.body;
            if(userData.email && userData.password){
                client.connect();
            client.query("SELECT * FROM uma.users WHERE email = $1 AND password = $2",[`${userData.email}`,`${userData.password}`],(err, result) => {
                if(err){
                    response.status(500).send("Query not executed " + err);
                } else{
                    if(result.rows[0]["token"] === null)
                    {
                        const userEmail = userData.email;
                        const user = {name:userEmail};
                        const accessToken = jwt.sign(user, "myNameIsUmaShankarAndIMSoftwareDevelopmentEngineerAtCAWStudios");
                        //response.send(accessToken);
                        client.query("UPDATE uma.users set token = $1 WHERE email =$2",[`${accessToken}`,`${userData.email}`], (error, result2) => {
                            if(error){
                                response.status(500).send("Not updated in database " + error);
                            } else{
                                response.status(200).send("user login successfully :) ");
                            }
                        })
                    } else{
                        response.status(200).send("user already logged in :) ");
                    }
                    
                }
                
            });
            } else{
                throw new Error();
            }
            
        } catch(err){
            response.status(400).send(err + " please insert 'email', 'password' in body request");
        }
    }


    // 6 - Ability to book a ticket. (No payment gateway integration is required. Assume tickets can be booked for free)
    userBooking = (request: express.Request, response: express.Response) => {
        try{
            const date = new Date();
            //console.log(date);
            const userBooking = request.body;
            if(userBooking.movie_id && userBooking.email && userBooking.seats){
                client.connect();
            client.query("SELECT * FROM uma.users WHERE email = $1",[`${userBooking.email}`], (err, result) => {
                if(err){
                    response.status(500).send("Query not executed " + err);
                } else{
                    if(result.rows[0]["token"] === null){
                        response.status(200).send("This user not logged in");
                    } else{
                        const token = result.rows[0]["token"];
                        jwt.verify(token, "myNameIsUmaShankarAndIMSoftwareDevelopmentEngineerAtCAWStudios", (error: any, res: any) => {
                            if(error){
                                response.status(200).send("This is not a correct user");
                            } else{
                                client.query("SELECT seats FROM uma.movies WHERE movie_id =$1",[`${userBooking.movie_id}`],(err, result) => {
                                    if(err){
                                        response.status(500).send("Query not executed " + err);
                                    } else{
                                        var movieArray: string[];
                                        var userArray: string[];
                                        movieArray = result.rows[0]["seats"];
                                        //response.send(movieArray);
                                        userArray = userBooking.seats;
                                        var count: number =0;
                                        for(var i=0;i<userArray.length;i++){
                                            if(movieArray.includes(userArray[i])){
                                                count++;
                                                movieArray.forEach((element, index) => {
                                                    if(element === userArray[i]){
                                                        movieArray.splice(index, 1);
                                                    }
                                                })
                                                
                                            } else{
                                                response.status(200).send(userArray[i] +" "+"seat not available\n" + "available seats are " + movieArray );
                                                return;
                                            }
                                        }

                                        if(count === userArray.length){
                                            client.query("UPDATE uma.movies SET seats = $1 WHERE movie_id = $2", [movieArray, userBooking.movie_id], (err, result) => {
                                                if(err){
                                                    response.status(500).send("Query not executed " + err);
                        
                                                }
                                            });
                                            client.query("UPDATE uma.users SET seats = $1, booking_date =$3 WHERE email = $2 ;",[userArray, userBooking.email, date], (err, result) => {
                                                if(err){
                                                    response.status(500).send("Query not executed " + err);
                                                } else{
                                                    response.status(200).send("BOOKING SUCCESSFUL: " + userArray)
                                                }
                                            });
                                        }
                                        
                                        
                                    }
                                })
                                
                            }
                        })
                    }
                }
            });
            } else{
                throw new Error();
            }
            
        } catch(err){
            response.status(400).send(err + " please insert 'movie_id', 'email', 'seats' in request body");
        }
    }

}


export default ApiControllers;
