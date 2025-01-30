const bcrypt = require("bcryptjs");

const authService = require("./auth-service");
const opdService = require("../opd/opd-service");
const reportingService = require("../reporting/reporting-service");

exports.renderAdminLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Admin Login",
    path: "/admin-login",
  });
};

exports.renderLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
  });
};

exports.renderSignup = async (req, res, next) => {
  try {
    res.render("auth/signup", {
      pageTitle: "Buat Akun Baru",
      domain: "auth",
      path: "/auth/signup",
      selectedOpd: null,
    });
  } catch (error) {
    return next(error);
  }
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
  const userEnv = process.env;

  try {
    let currentUser = await authService.login({ username: username });

    if (username == userEnv.USER && password == userEnv.PASSWORD) {
      if (!currentUser) {
        const hashedPsw = await bcrypt.hash(password, 12);

        currentUser = await authService.signup({
          username,
          password: hashedPsw,
          opdName: userEnv.NAME,
          phone: userEnv.PHONE,
          institutionName: userEnv.INSTITUTION,
        });
      }

      delete currentUser.password;
      req.session.isLoggedIn = true;
      req.session.userRole = "ADMIN";
      req.session.user = currentUser;

      const lastReporting = await reportingService.getLastReporting();

      if (!lastReporting) {
        res.redirect("/admin");
      } else {
        res.redirect("/admin?tahun=" + lastReporting.year);
      }
      return req.session.save();
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await authService.login({ username: username });

    if (!user) {
      // return res.status(400).json({ message: "User not found" });
      res.redirect("/login");
    }

    const doMatch = await bcrypt.compare(password, user.password);

    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.userRole = "OPD";
      req.session.user = user;

      const getAllDataInstitutionByOpd =
        await reportingService.findInstitutionBudget({
          opdId: user._id,
        });
      const lastReportingOpd = await reportingService.findOneReporting({
        _id: getAllDataInstitutionByOpd[getAllDataInstitutionByOpd.length - 1]
          ?.reportingId,
      });

      if (!lastReportingOpd) {
        res.redirect("/");
      } else {
        res.redirect(
          `/?triwulan=${lastReportingOpd.period.trim()}&tahun=${
            lastReportingOpd.year
          }&edit=false`
        );
      }

      return req.session.save();
    } else {
      // return res.status(400).json({ message: "Wrong Password" });
      res.redirect("/login");
    }
  } catch (error) {
    return next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const result = await authService.signup({
      ...req.body,
      password: hashedPassword,
    });

    if (result) {
      res.redirect("/login");
    }
  } catch (error) {
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const phone = req.body.phone;
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const result = await opdService.updateOpd(
      { phone: phone },
      { password: hashedPassword }
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
  if (req.session.userRole === "ADMIN") {
    res.redirect("/admin/login");
  } else {
    res.redirect("/login");
  }

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.send("Error logging out");
    }
  });
};
