const authService = require("./auth-service");

exports.renderLogin = (req, res, next) => {
  res.render("auth/login", { title: "Login" });
};

exports.renderSignup = (req, res, next) => {
  res.render("auth/signup", { title: "Signup" });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber;

  try {
    const result = await authService.signup(email, password, phoneNumber);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.postLogout = async (req, res, next) => {
  const result = await authService.logout();
    return res.status(200).json(result);
};
