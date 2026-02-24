const db = require("../utils/connectdb");
const { JWT_SECRET } = require('../config/config');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {    
        const { email, password } = req.body;
        const sql = "SELECT * FROM users WHERE email = $1 AND password = $2"; 
        const result = await db.query(sql, [email, password]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid' });
        }
        const user = result.rows[0];
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};

module.exports = {
    login,
};
