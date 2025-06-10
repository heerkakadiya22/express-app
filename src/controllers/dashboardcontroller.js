exports.dashboard = (req, res) => {
  res.render("dashboard", {
    name: req.session.name,
    email: req.session.email,
    csrfToken: req.csrfToken(),
  });
};
