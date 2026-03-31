const db = require("../utils/connectdb");
const { JWT_SECRET } = require('../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "username, email and password are required" });
        }

        const existingUser = await db.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const userRole = role || "user";

        const insertResult = await db.query(
            `INSERT INTO users (username, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, username, email, role`,
            [username, email, hashedPassword, userRole]
        );

        return res.status(201).json(insertResult.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Registration failed" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sql = "SELECT * FROM users WHERE email = $1";
        const result = await db.query(sql, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid' });
        }

        const user = result.rows[0];

        if (!user.password) {
            return res.status(400).json({ message: 'Invalid' });
        }

        let isMatch = false;

        if (isBcryptHash(user.password)) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Temporary compatibility for old plaintext records.
            isMatch = password === user.password;
            if (isMatch) {
                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
                await db.query(
                    "UPDATE users SET password = $1 WHERE user_id = $2",
                    [hashedPassword, user.user_id]
                );
                user.password = hashedPassword;
            }
        }

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid' });
        }

        if (user.role === 'admin') {
            const teamResult = await db.query(
                `SELECT a.team_id, t.team_name
                FROM admins a
                JOIN teams t ON a.team_id = t.team_id
                WHERE a.user_id = $1`,
                [user.user_id]
            );
            user.team_id = teamResult.rows[0]?.team_id || null;
            user.team_name = teamResult.rows[0]?.team_name || null;
        }

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
            team_id: user.team_id || null,
            team_name : user.team_name || null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};

module.exports = {
    register,
    login,
};
