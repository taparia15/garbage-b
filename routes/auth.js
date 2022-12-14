const express = require('express');
const User = require('../models/User');
const Staff = require('../models/Staff')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'nikhilji';

//ROUTE 1: Create a user using POST "/api/auth/createuser" No Login required
router.post('/createuser', [
    // body('name', 'Enter a valid Name').isLength({ min: 3 }),
    // body('email', 'Enter a valid Email').isEmail(),
    // body('password', 'Enter a valid Password').isLength({ min: 3 }),

], async (req, res) => {
    // if there are error return bad request and error
    const errors = validationResult(req);
    success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        //  check whether the user with this email exists already
        let user = await Staff.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry only admins are allowed to create Staff Member" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        // Create a new user
        user = await Staff.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            area: req.body.area,
            phone: req.body.phone
        });

        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        // const  authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ success })

        // res.json(user)

        // .then(user => res.json(user))
        // .catch(err => {console.log(err)
        // res.json({error: 'This Email is already used', message: err.message})})


        // console.log(req.body);
        // const user = User(req.body);
        // user.save()
        // res.send(req.body)
        // res.json({"Status" : "Account created in DB Successfully"})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Authenticate a user using POST "/api/auth/login" Login required
router.post('/login', [
    // body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password cannot be blank').exists(),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        let staff = await Staff.findOne({ email });
        if (!user && !staff) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' });
        }
        if (user) {
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                success = false;
                return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
            }
            const data = {
                staff: {
                    id: user.id,
                    role:user.role
                }

            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken })
        }

        if (staff) {
            const passwordCompare = await bcrypt.compare(password, staff.password);
            if (!passwordCompare) {
                success = false;
                return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
            }
            const data = {
                staff: {
                    id: staff.id,
                    role:staff.role
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken })
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal Server error");
    }

})

// ROUTE 3: Get loggedin user details using POST "/api/auth/getuser" Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal Server error");
    }
})

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        const staff = await Staff.findById(userId).select("-password")
        res.send(user?user:staff)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal Server error");
    }
})

module.exports = router