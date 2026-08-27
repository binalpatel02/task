import User from "../model/schema/user.schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redisClient from "../../../library/redis.js";

// TTL Constant (5 minutes cache expiry)
const CACHE_TTL = 300; 

const getUserCacheKey = (id: string) => `${id}`;

// LOGIN
export const loginUser = async (email_address: string, password: string) => {
    const user = await User.findOne({ email_address });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;  

    const token = jwt.sign(
        {
            id: user._id.toString(),
            roleId: (user as any).role?.toString(),     
            customerId: (user as any).customer?.toString() 
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    return { user: userWithoutPassword, token };
};

// CREATE USER - Caches the user profile instantly on creation
export const createUser = async (data: any) => {
    const hashedPassword = await bcrypt.hash(data.password || "", 10);
    const userData = { ...data, password: hashedPassword };

    const user = await User.create(userData);
    console.log("Successfully inserted into MongoDB:", user._id);

    try {
        const cacheKey = getUserCacheKey(user._id.toString());
        await redisClient.set(
            cacheKey, 
            JSON.stringify(user.toObject()), 
            { EX: CACHE_TTL }
        );
        console.log(`[REDIS SUCCESS] Cached profile: ${cacheKey}`);
    } catch (err) {
        console.error("Redis write error in createUser:", err);
    }

    return user;
};

// GET USERS
export const getUsers = async ( name: string, email: string, mobileNumber: string, page: number, limit: number ) => {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (name) {
        filter.$or = [
            { first_name: { $regex: name, $options: "i" } },
            { last_name: { $regex: name, $options: "i" } }
        ];
    }
    if (email) filter.email_address = { $regex: email, $options: "i" };
    if (mobileNumber) filter.mobile_number = { $regex: mobileNumber, $options: "i" };

    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter)
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// GET USER BY ID 
export const getUserById = async (id: string) => {
    const cacheKey = getUserCacheKey(id);
    
    try {
        const cacheUser = await redisClient.get(cacheKey);    
        if (cacheUser) {
            console.log(`[REDIS HIT] Serving profile from cache: ${id}`);
            return JSON.parse(cacheUser);
        }
    } catch (err) {
        console.error("Redis read error:", err); 
    }
    
    console.log(`[REDIS MISS] Querying MongoDB for profile: ${id}`);
    
    const user = await User.findById(id).lean();
    if (!user) return null;
    
    try {
        await redisClient.set(
            cacheKey, 
            JSON.stringify(user), 
            { EX: CACHE_TTL }
        );
        console.log(`[REDIS SUCCESS] Cached missed profile: ${cacheKey}`);
    } catch (err) {
        console.error("Redis write error in getUserById:", err);
    }

    return user;
};

// UPDATE USER 
export const updateUser = async (id: string, data: any) => {
    const user = await User.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true
    });

    if (user) {
        const cacheKey = getUserCacheKey(id);
        try {
            await redisClient.set(
                cacheKey, 
                JSON.stringify(user.toObject()), 
                { EX: CACHE_TTL }
            );
            console.log(`[REDIS UPDATE] Overwrote cache with fresh profile data: ${id}`);
        } catch (err) {
            console.error("Redis error in updateUser:", err);
        }
    }
    return user;
};

// DELETE USER
export const deleteUser = async (id: string) => {
    const user = await User.findByIdAndDelete(id);

    if (user) {
        const cacheKey = getUserCacheKey(id);
        try {
            await redisClient.del(cacheKey);
            console.log(`[REDIS DELETE] Wiped profile cache key from memory: ${id}`);
        } catch (err) {
            console.error("Redis delete error in deleteUser:", err);
        }
    }
    return user;
};
