// Import Packages
import {body, check, validationResult, param} from "express-validator";

// Import Handler
import {compareHashedPassword} from "../handlers/bcrypt.handler";

// Import Types
import {Request, Response, NextFunction} from "express";

// Import Model
import User from "../models/user.model";

// Validation for SignUp Route
const validateSignUpRoute = [
    // Check for Valid Email
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email").normalizeEmail({all_lowercase: true}),

    // Check If Email Already Exits
    check("email").custom(async (email) => {
        const fetchedUser = await User.findOne({email});
        if (fetchedUser) return Promise.reject("An Account with this email already exists");
    }),

    // Check for Username
    body("username").notEmpty().withMessage("Username is required"),

    // Check If userName Already Exits
    check("username").custom(async (userName) => {
        if (userName.toLowerCase() !== 'private') {
            const fetchedUser = await User.findOne({userName});
            if (fetchedUser) return Promise.reject("An Account with this username already exists");
        } else {
            return Promise.reject("This username is not allowed");
        }
    }),

    // Check for Minimun Password Length
    body("password").notEmpty().withMessage("Password is required").isLength({min: 8}).withMessage("Password must be at least 8 characters long"),

    // Check for Confirm Password Match
    body("confirmPassword").notEmpty().withMessage("confirmPassword is required").isLength({min: 8}).withMessage("Password must be at least 8 characters long"),

    // Check If Password Matches
    check("confirmPassword").custom(async (confirmPassword, {req}) => {
        const password = req.body.password;
        if (confirmPassword !== password) return Promise.reject("password does not matches confirmPassword already in use");
    }),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for CheckUser
const validateCheckUser = [
    // Check for Valid Email
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email").normalizeEmail({all_lowercase: true}),

    // Check If Email Already Exits
    check("email").custom(async (email) => {
        const fetchedUser = await User.findOne({email});
        if (fetchedUser) return Promise.reject("An Account with this email already exists");
    }),

    // Check for Username
    body("username").notEmpty().withMessage("Username is required"),

    // Check If userName Already Exits
    check("username").custom(async (userName) => {
        if (userName.toLowerCase() !== 'private') {
            const fetchedUser = await User.findOne({userName});
            if (fetchedUser) return Promise.reject("An Account with this username already exists");
        } else {
            return Promise.reject("This username is not allowed");
        }
    }),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for Login Route
const validateLoginRoute = [
    // Check for Valid Email
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email").normalizeEmail({all_lowercase: true}),

    // Check for Minimun Password Length
    body("password").notEmpty().withMessage("Password is required"),

    // Fetching User
    check("email").custom(async (email, {req}) => {
        const fetchedUser = await User.findOne({email});
        if (!fetchedUser) return Promise.reject("Authentication failed, please enter correct email and password");
        const isValid = await compareHashedPassword(req.body.password, fetchedUser.password);
        if (!isValid) return Promise.reject("Authentication failed, please enter correct email and password");
        req.user = fetchedUser;
    }),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for User Recovery Route
const validateRecoverUserPasswordRoute = [
    // Check for Valid Email
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email").normalizeEmail({all_lowercase: true}),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for Reset Password Route
const validateResetUserPasswordRoute = [
    // Check for Minimun Password Length
    body("password").notEmpty().withMessage("Password is required"),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for Change Password Route
const validateUserPassword = [
    // Check for Minimun Password Length
    body("oldPassword").notEmpty().withMessage("oldPassword is required"),
    body("newPassword").notEmpty().withMessage("newPassword is required"),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for 2FA Token Verification Route
const validateValidateUserRecoveryRoute = [
    // Check for 2FA TOPT

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

// Validation for User Update Route
const validateUpdateUser = [
    // Check for Array Must Have Object With Key
    check("update.*.key").not().isEmpty().withMessage("key is required"),

    // Check for Array Must Have Object With Value
    check("update.*.value").not().isEmpty().withMessage("value is required"),

    // Check If userName Already Exits
    check("update.*").custom(async (object) => {
        if (object.key === 'userName') {
            if (object.value.toLowerCase() !== 'private') {
                const fetchedUser = await User.findOne({'userName': object.value});
                if (fetchedUser) return Promise.reject("An Account with this username already exists");
            } else {
                return Promise.reject("This username is not allowed");
            }
        }
        if (object.key === 'email') {
            const fetchedUser = await User.findOne({'email': object.value});
            if (fetchedUser) return Promise.reject("An Account with this email already exists");

        }
    }),

    // Return Errors If Validation Fails
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({errors: errors.array()});

        // Continue Request
        next();
    },
];

const validateId = [
    param("id").notEmpty().isMongoId().withMessage("User Id is Invalid"),

    //Return the validation result
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    },
];

// Exports
export {
    validateSignUpRoute,
    validateLoginRoute,
    validateRecoverUserPasswordRoute,
    validateResetUserPasswordRoute,
    validateValidateUserRecoveryRoute,
    validateUpdateUser,
    validateId,
    validateUserPassword,
    validateCheckUser
};
