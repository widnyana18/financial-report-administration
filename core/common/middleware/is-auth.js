module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log('IS PATH : ' + req.path);

    if (req.path.includes("/admin")) {
      return res.redirect("/admin/login");
    } else {
      return res.redirect("/login");
    }
  }
  next();
};
