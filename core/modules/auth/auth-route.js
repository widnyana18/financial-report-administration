const { Router } = require("express");

const authController = require("./auth-controller");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/admin/login', authController.renderAdminLogin);
appRouter.get('/login', authController.renderLogin);
appRouter.get('/signup', authController.renderSignup);
appRouter.get('/ganti-password', authController.renderChangePassword);

//API
apiRouter.post("/admin-login", authController.adminLogin);
apiRouter.post("/login", authController.login);
apiRouter.post("/signup", authController.signup);
apiRouter.post("/ganti-password", authController.changePassword);
apiRouter.post("/logout", authController.logout);

module.exports = {appRouter, apiRouter};


