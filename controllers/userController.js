// controllers/userController.js
exports.getUser = (req, res) => {
    if (req.user) {
        res.json({
            id: req.user.googleId,
            name: req.user.name,
            email: req.user.email
        });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

exports.logoutUser = (req, res) => {
    console.log("Force logout called");

    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Force logout successful" });
    });
};