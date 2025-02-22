module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log("IS PATH : " + req.originalUrl);

    if (req.originalUrl.includes("/admin")) {
      return res.redirect("/admin/login");
    } else {
      return res.redirect("/login");
    }
  } else { 
    const query = req.query;   
    if (
      (req.originalUrl.includes("/admin") && req.session.userRole != "ADMIN")
       ||
      (query.triwulan && query.tahun && req.session.userRole != "OPD" && !req.user?._id)
    ) {
      return res.redirect("/logout");
    }
  }
  next();
};
