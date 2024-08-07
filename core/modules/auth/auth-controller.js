const authService = require("./auth-service");
const opdService = require("../opd/opd-service");

exports.renderLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: req.baseUrl,
  });
};

exports.renderSignup = (req, res, next) => {
  res.render("auth/signup", { pageTitle: "Signup", path: "/signup" });
};

exports.renderChangePassword = (req, res, next) => {
  res.render("auth/change-password", {
    pageTitle: "Ganti Password",
    path: "/ganti-password",
  });
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await opdService.updateOpd({email:email}, password);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  const result = await authService.logout();
  return res.status(200).json(result);
};
