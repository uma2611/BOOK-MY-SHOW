"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_controllers_1 = __importDefault(require("../controllers/api.controllers"));
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
var apiControllers = new api_controllers_1.default();
router.get("/", apiControllers.getHome);
router.get("/location", apiControllers.viewAllMovies);
router.get("/movie", apiControllers.allCinemasAMoviesIsPlaying);
router.get("/seats", apiControllers.availabilityOfSeats);
router.post("/signup", apiControllers.userSignup);
router.post("/login", apiControllers.userLogin);
router.post("/booking", apiControllers.userBooking);
exports.default = router;
