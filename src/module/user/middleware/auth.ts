import passport from "../../../library/passport.js"

export const authenticateJWT = passport.authenticate(
    "jwt",
    {
        session: false
    }
);