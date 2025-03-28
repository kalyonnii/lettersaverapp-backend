// controllers/userController.js

// Get user information
exports.getUser = (req, res) => {
    try {
        if (req.user) {
            console.log("req.isAuthenticated()", req.isAuthenticated())
            return res.status(200).json({
                id: req.user.googleId,
                name: req.user.name,
                email: req.user.email
            });
        }
        res.status(401).json({ message: 'Not authenticated' });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Force logout user
exports.logoutUser = (req, res) => {
    try {
        console.log("Force logout called");

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
                return res.status(500).json({ message: "Logout failed" });
            }

            res.clearCookie('connect.sid', { path: '/' });
            return res.status(200).json({ message: "Force logout successful" });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};