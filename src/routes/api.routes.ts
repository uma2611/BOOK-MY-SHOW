import  ApiControllers from "../controllers/api.controllers";
import express from "express";
const router = express.Router();

var apiControllers = new ApiControllers();


router.get("/", apiControllers.getHome);

router.get("/location", apiControllers.viewAllMovies);

router.get("/movie" ,apiControllers.allCinemasAMoviesIsPlaying);

router.get("/seats", apiControllers.availabilityOfSeats);

router.post("/signup" ,apiControllers.userSignup);

router.post("/login", apiControllers.userLogin);

router.post("/booking", apiControllers.userBooking);


export default router;