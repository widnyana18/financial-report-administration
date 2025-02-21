const bcrypt = require("bcryptjs");

const authService = require("./auth-service");
const opdService = require("../opd/opd-service");
const reportingService = require("../reporting/reporting-service");

exports.renderAdminLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Admin Login",
    path: "/admin-login",
    message: req.flash(),
  });
  console.log(req.flash("error"));
};

exports.renderLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    message: req.flash(),
  });
};

exports.renderSignup = async (req, res, next) => {
  try {
    res.render("auth/signup", {
      pageTitle: "Buat Akun Baru",
      domain: "auth",
      path: "/auth/signup",
      selectedOpd: null,
      message: req.flash(),
    });
  } catch (error) {
    return next(error);
  }
};

exports.renderChangePassword = (req, res, next) => {
  res.render("auth/ganti-password", {
    pageTitle: "Ganti Password",
    path: "/ganti-password",
    message: req.flash(),
  });
};

exports.adminLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const userEnv = process.env;

  try {
    const pswMatch = await bcrypt.compare(password, userEnv.PASSWORD);
    
    if (username == userEnv.USER && pswMatch) {
      const currentUser = {
        username,
        password: userEnv.PASSWORD,
        opdName: userEnv.NAME,
        phone: userEnv.PHONE,
        institutionName: userEnv.INSTITUTION,
      };

      req.session.isLoggedIn = true;
      req.session.userRole = "ADMIN";
      req.session.user = currentUser;

      const lastReporting = await reportingService.getLastReporting();

      req.flash("success", "Berhasil login");
      if (!lastReporting) {
        res.redirect("/admin");
      } else {
        res.redirect("/admin?tahun=" + lastReporting.year);
      }

      return req.session.save();
    } else {
      req.flash("error", "Username atau password salah !!");
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

    console.log(" USER = " + JSON.stringify(user));
    if (user) {
      const doMatch = await bcrypt.compare(password, user?.password);

      if (!doMatch) {
        req.flash("error", "Password salah !!");
        res.redirect("/login");
      }

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

      console.log(getAllDataInstitutionByOpd + " | " + lastReportingOpd);

      req.flash("success", "Berhasil login");

      console.log(" session = " + JSON.stringify(req.session));

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
      req.flash("error", "Username tidak ditemukan");
      res.redirect("/login");
    }
  } catch (error) {
    return next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const haveAccount = await opdService.getOneOpd({
      username: req.body.username,
    });

    if (haveAccount) {
      req.flash("error", "Akun ini sudah terdaftar");
      res.redirect("/signup");
    }

    await authService.signup({
      ...req.body,
      password: hashedPassword,
    });

    req.flash("success", "Berhasil membuat akun");
    res.redirect("/login");
  } catch (error) {
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const body = req.body;

  try {
    if (body.password !== body.confirmPassword) {
      req.flash("error", "password tidak sama");
      res.redirect("/ganti-password");
    }

    const hashedPassword = await bcrypt.hash(body.confirmPassword, 12);
    const result = await opdService.updateOpd(
      { phone: body.phone },
      { password: hashedPassword }
    );

    if (!result) {
      req.flash("error", "Nomor telepon tidak ditemukan");
      res.redirect("/ganti-password");
    }

    req.flash("success", "Berhasil mengganti password");
    res.redirect("/login");
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
  console.log(" session = " + JSON.stringify(req.session));
};
