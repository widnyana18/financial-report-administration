module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log("IS PATH : " + req.originalUrl);

    if (req.originalUrl.includes("/admin")) {
      return res.redirect("/admin/login");
    } else {
      return res.redirect("/login");
    }
  } else {    
    if (
      (req.originalUrl.includes("/admin") && req.session.userRole != "ADMIN") ||
      (req.session.userRole != "OPD" && !req.user?._id)
    ) {
      return res.redirect("/logout");
    }
  }
  next();
};

// else {
//   if (req.originalUrl.includes("/admin")) {
//     if (req.session.userRole != "ADMIN") {
//       return res.redirect("/logout");
//     }
//   } else {
//     if (req.session.userRole != "OPD") {
//       return res.redirect("/logout");
//     }
//   }
//   next();
// }
