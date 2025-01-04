module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log('IS PATH : ' + req.originalUrl);

    if (req.originalUrl.includes("/admin")) {
      return res.redirect("/admin/login");
    } else {
      return res.redirect("/login");
    }
  }
  next();
};
