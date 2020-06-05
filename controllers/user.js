/**
 * Takes the userType sent in the req and 
 * saves the userType in the cookie and 
 * redirects to home page.
 */
exports.switchUser = (req, res, next) => {
    const urlParams = req.params;
    const userType = urlParams['userType'];
    const isUserAdmin = userType === "admin";

    res.cookie('userType', userType, { path: '/'});
    res.render('staff/index', {
        pageTitle: 'Home',
        path: '/',
        isAdmin: isUserAdmin
    });
}