const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rahul@123', // Replace with your MySQL password
    database: 'student_exam_portal'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Register endpoint
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Server error');

        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).send('Error registering user');
            res.status(201).send('User registered');
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(400).send('Invalid credentials');

        const user = results[0];
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) return res.status(500).send('Server error');
            if (!match) return res.status(400).send('Invalid credentials');

            res.status(200).send({ id: user.id, name: user.name, email: user.email });
        });
    });
});


//submit exam result endpoint
app.post('/submit-exam', (req, res) =>{
    const {userId, marks}  = req.body;
    if (!userId || !marks) return res.status(400).send('User ID and marks are required');

    const sql = 'INSERT INTO exam_results (user_id, marks) VALUES (?, ?)';
    db.query(sql, [userId, marks], (err, result) => {
        if (err) return res.status(500).send('Error submitting exam results');
        res.status(201).send('Exam results submitted');
    });
    
});

// Retrieve exam results endpoint
app.get('/exam-results/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM exam_results WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
