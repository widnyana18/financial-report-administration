const { Router } = require("express");

const authController = require("./auth-controller");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/login', authController.renderLogin);
appRouter.get('/signup', authController.renderSignup);
// appRouter.get('/lupa-password', authController.renderForgetPassword);

//API
apiRouter.post("/login", authController.postLogin);
apiRouter.post("/signup", authController.postSignup);
// apiRouter.patch("/reset-password", authController.resetpassword);
apiRouter.post("/logout", authController.postLogout);

module.exports = {appRouter, apiRouter};


