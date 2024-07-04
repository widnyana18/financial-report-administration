const { Router } = require("express");

const authController = require("./auth-controller");
const router = Router();

//root route employee
router.get('/login', authController.renderLogin);
router.get('/signup', authController.renderSignup);

//API
router.post("/api/login", authController.postLogin);
router.post("/api/signup", authController.postSignup);
router.post("/api/logout", authController.postLogout);

module.exports = router;


