const { Router } = require("express");

const authController = require("./auth-controller");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/admin/login', authController.renderLogin);
appRouter.get('/login', authController.renderLogin);
appRouter.get('/signup', authController.renderSignup);
appRouter.get('/ganti-password', authController.renderChangePassword);

//API
apiRouter.post("/login", authController.login);
apiRouter.post("/signup", authController.signup);
apiRouter.patch("/ganti-password", authController.changePassword);
apiRouter.post("/logout", authController.logout);

module.exports = {appRouter, apiRouter};


