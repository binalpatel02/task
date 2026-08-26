import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../module/user/model/schema/user.schema.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
}

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);

            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;
