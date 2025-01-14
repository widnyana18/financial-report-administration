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
  const institution = [];

  try {
    const getAllInstitution = await reportingService.findInstitution({});
    console.log("INSTITUTION ALL : " + getAllInstitution);

    getAllInstitution.forEach((item) => {
      if (!institution.includes(item.institutionName)) {
        institution.push({
          id: item.institutionName?.toLowerCase().split(" ").join("-"),
          name: item.institutionName,
        });
      }
    });

    res.render("auth/signup", {
      pageTitle: "Buat Akun Baru",
      domain: "auth",
      path: "/auth/signup",
      institution,
      selectedOpd: null,
      selectedInstitution: null,
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
    const currentUser = await authService.login({ username: username });

    if (!currentUser) {
      if (username == userEnv.username && password == userEnv.password) {
        const hashedPsw = await bcrypt.hash(password, 12);

        await authService.signup({
          username,
          hashedPsw,
          opdName: "ADMIN",
          phone: userEnv.phone,
          institutionId: [],
          password: hashedPassword,
        });
      } else {
        res.redirect("/admin/login");
      }
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

      const selectedInstitution = await reportingService.findInstitution({
        _id: user.institutionId,
      });
      console.log("LAST DBH : " + selectedInstitution.length);

      const lastReporting = await reportingService.findOneReporting({
        _id: selectedInstitution[selectedInstitution.length - 1]?.reportingId,
      });

      if (!lastReporting) {
        res.redirect("/");
      } else {
        res.redirect(
          `/?triwulan=${lastReporting.period.trim()} ${
            lastReporting.year
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
    const getManyReportInstitution = await reportingService.findInstitution({
      institutionName: req.body.institution,
    });

    const institutionIdArr = getManyReportInstitution.map((item) => {
      return item._id;
    });

    bcrypt
      .hash(req.body.password, 12)
      .then(async (hashedPassword) => {
        return await authService.signup({
          ...req.body,
          institutionId: institutionIdArr,
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
  req.session.destroy();
};
