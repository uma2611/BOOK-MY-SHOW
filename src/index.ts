import routes from "./routes/api.routes";
import express from "express";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/", routes);

app.listen(port, () => {
    console.log(`start at ${port}`);
});
































/*
//Home Page
app.get("/user", (request, response) => {
    response.send("WELCOME TO BOOK MY SHOW ASSIGNMENT");
});


jayegajayegajayegajayega
// 1 - Ability to view all the movies playing in your city
app.get("/user/location",(request, response) => {
    try{
        const location = request.query.location;
        client.connect();
        client.query("SELECT movie_name FROM movies WHERE cinema_hall_name IN(SELECT cinema_hall_name FROM cinema WHERE city_name IN (SELECT city FROM location WHERE city = $1));",[`${location}`],(err, result) => {
            if(err){
                response.send("Query not executed " + err);
            } else {
                response.send(result.rows);
            }
            
        });
        // client.end();
    } catch(err){
        response.send("Please provide location" + err);
    }
});
        
       

// 2 - Ability to check all cinemas in which a movie is playing along with all the showtimes
app.get("/user/movie",(request, response) => {
    try{
        const location = request.query.location;
        const movie_name = request.query.movie_name;
        client.connect();
        client.query("SELECT cinema_hall_name, movie_name, movie_time FROM movies WHERE movie_name = $2 AND cinema_hall_name IN(SELECT cinema_hall_name FROM cinema WHERE city_name IN (SELECT city FROM location WHERE city = $1));",[`${location}`, `${movie_name}`],(err, result) => {
            if(err){
                response.send("Query not executed " + err);
            } else {
                response.send(result.rows);
            }
            
        });
        //client.end();
    } catch(err) {
        response.send("Movie name not found " + err);
    }
});


// 3 - For each showtime, check the availability of seats 
const header = request.headers;app.get("/user/seats", (request, response) => {
    try{
        const location = request.query.location;
        client.connect();
        client.query("SELECT movie_id, cinema_hall_name, movie_name, movie_time, seats FROM movies WHERE cinema_hall_name IN(SELECT cinema_hall_name FROM cinema WHERE city_name IN (SELECT city FROM location WHERE city = $1));",[`${location}`], (err, result) => {
            if(err){
                response.send("Query not executed " + err);
            } else{
                response.send(result.rows);
            }
            
        });
        //client.end();
    } catch(err) {
        response.send(err);
    }
});

 



 
// 4 - User Sign up
app.post("/user/signup", (request, response) => {
    try{
        const userSignup = request.body;
        if(validator.isEmail(userSignup.email)){
            client.connect();
            client.query("SELECT email FROM users WHERE email = $1", [userSignup.email], (err, result) => {
                //console.log(result.rows);
                if(err){
                    response.send(err);
                } else{
                    if(result.rows.length === 0){
                        client.query("INSERT INTO users (user_name, email, password) VALUES ($1, $2, $3)", [userSignup.user_name, userSignup.email, userSignup.password], (err, result) => {
                        if(err){
                            response.send("Data not inserted into database " + err);
                        } else{
                            response.send("User registered successfully :) ");
                        }
                    })
                    } else {
                        response.send("This user already present please try another");
                    }
                }
                
            })
            
        } else{
            response.send("Please enter correct email");
        }
        
    } catch(err) {
        response.send(err);
    }
});









// 5 -  User login 
app.post("/user/login", (request, response) => {
    try{
        const userData = request.body;
        client.connect();
        client.query("SELECT * FROM users WHERE email = $1 AND password = $2",[`${userData.email}`,`${userData.password}`],(err, result) => {
            if(err){
                response.send("Query not executed " + err);
            } else{
                if(result.rows[0]["token"] === null)
                {
                    const userEmail = userData.email;
                    const user = {name:userEmail};
                    const accessToken = jwt.sign(user, "myNameIsUmaShankarAndIMSoftwareDevelopmentEngineerAtCAWStudios");
                    //response.send(accessToken);
                    client.query("UPDATE users set token = $1 WHERE email =$2",[`${accessToken}`,`${userData.email}`], (error, result2) => {
                        if(error){
                            response.send("Query not executed " + error);
                        } else{
                            response.send("user login successfully :) ");
                        }
                    })
                } else{
                    response.send("user already logged in :) ");
                }
                
            }
            
        });
    } catch(err){
        response.send(err);
    }
});




// 6 - Ability to book a ticket. (No payment gateway integration is required. Assume tickets can be booked for free)
app.post("/user/booking", (request, response) => {
    try{
        client.connect();
        const userBooking = request.body;
        client.query("SELECT * FROM users WHERE email = $1",[`${userBooking.email}`], (err, result) => {
            if(err){
                response.send("Query not executed " + err);
            } else{
                if(result.rows[0]["token"] === null){
                    response.send("This user not logged in");
                } else{
                    const token = result.rows[0]["token"];
                    jwt.verify(token, "myNameIsUmaShankarAndIMSoftwareDevelopmentEngineerAtCAWStudios", (error: any, res: any) => {
                        if(error){
                            response.send("This is not a correct user");
                        } else{
                            //write seat booking code
                            client.query("SELECT seats FROM movies WHERE movie_id =$1",[`${userBooking.movie_id}`],(err, result) => {
                                if(err){
                                    response.send("Query not executed " + err);
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
                                            response.send(userArray[i] +" "+"seat not available");
                                            return;
                                        }
                                    }

                                    if(count === userArray.length){
                                        client.query("UPDATE movies SET seats = $1 WHERE movie_id = $2", [movieArray, userBooking.movie_id], (err, result) => {
                                            if(err){
                                                response.send("Query not executed " + err);
                    
                                            }
                                        });
                                        client.query("UPDATE users SET seats = $1  WHERE email = $2 ;",[userArray, userBooking.email], (err, result) => {
                                            if(err){
                                                response.send("Query not executed " + err);
                                            } else{
                                                response.send("BOOKING SUCCESSFUL: " + userArray)
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
    } catch(err){
        response.send(err);
    }
});

*/











