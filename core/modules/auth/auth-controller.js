const bcrypt = require("bcryptjs");

const authService = require("./auth-service");
const opdService = require("../opd/opd-service");
const dbhBudgetService = require("../dbh-budget/dbh-budget-service");
const reportingService = require("../reporting/reporting-service");

exports.renderLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: req.path,
  });
};

exports.renderSignup = (req, res, next) => {
  res.render("auth/signup", { pageTitle: "Signup", path: "/signup" });
};

exports.renderChangePassword = (req, res, next) => {
  res.render("auth/ganti-password", {
    pageTitle: "Ganti Password",
    path: "/ganti-password",
  });
};

exports.adminLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const currentYear = new Date().getFullYear();

  try {
    const user = await authService.login({ username: username });

    if (!user) {
      // return res.status(400).json({ message: "User not found" });
      res.redirect("/login");
    }

    const doMatch = bcrypt.compare(password, user.password);

    if (req.session) {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.userRole = "ADMIN";
        req.session.user = user;

        return req.session.save((err) => {
          console.log(err);
          res.redirect(`/admin?tahun=${currentYear}`);
        });
      }
    } else {
      // return res.status(400).json({ message: "Wrong Password" });
      res.redirect("/admin/login");
    }
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const currentYear = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  // getMonth() returns 0-11, so add 1
  let currentPeriod;

  if (month >= 1 && month <= 3) {
    currentPeriod = 1; // January to March
  } else if (month >= 4 && month <= 6) {
    currentPeriod = 2; // April to June
  } else if (month >= 7 && month <= 9) {
    currentPeriod = 3; // July to September
  } else {
    currentPeriod = 4; // October to December
  }

  try {
    const user = await authService.login({ username: username });

    if (!user) {
      // return res.status(400).json({ message: "User not found" });
      res.redirect("/login");
    }

    const doMatch = bcrypt.compare(password, user.password);

    if (req.session) {
      if (doMatch) {
        console.log("Password matches!");
        req.session.isLoggedIn = true;
        req.session.userRole = "OPD";
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          // res.status(200).json(req.session);
          res.redirect(
            `/?triwulan=${currentPeriod}&tahun=${currentYear}&edit=false`
          );
        });
      } else {
        // return res.status(400).json({ message: "Wrong Password" });
        res.redirect("/login");
      }
    }
  } catch (error) {
    return next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    bcrypt
      .hash(req.body.password, 12)
      .then(async (hashedPassword) => {
        return await authService.signup({
          email: req.body.username,
          password: hashedPassword,
        });
      })
      .then((result) => {
        res.redirect("/login");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
    // return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const phone = req.body.phone;
  const password = req.body.password;

  try {
    const result = await opdService.updateOpd(
      { phone: phone },
      { password: password }
    );
    if (result) {
      res.redirect("/login");
    }
    // return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  if(req.session.userRole === "ADMIN"){
    res.redirect("/admin/login");
  } else {
    res.redirect("/login");
  }
  req.session.destroy((err) => {
    console.log(err);
    // return res.status(200).json("Succes Logout");
  });
};
