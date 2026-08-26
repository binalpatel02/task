import User from "../model/schema/user.schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { clearUserCache } from "../util/user.cache.js";
import redisClient from "../../../library/redis.js";

export const loginUser = async (email_address: string, password: string) => {

    const user = await User.findOne({ email_address });

    if (!user) {
        return null;
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return null;  
    }

    const token = jwt.sign(
        {
            id: user._id.toString(),
            roleId: (user as any).role?.toString(),     
            customerId: (user as any).customer?.toString() 
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );

    // Safely remove the password field using destructuring
    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
        user: userWithoutPassword,
        token
    };
};

export const createUser = async (data: any) => {

    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );

    const userData = {
        ...data,
        password: hashedPassword
    };

    const user = await User.create(userData);
    console.log("Successfully inserted into MongoDB:", user._id);

    await clearUserCache();
    return user;

};

export const getUsers = async ( name: string, email: string, mobileNumber: string, page: number, limit: number ) => {

    const skip = (page - 1) * limit;

    const filter: any = {};

    if (name) {
        filter.$or = [
            {
                firstName: {
                    $regex: name,
                    $options: "i"
                }
            },
            {
                lastName: {
                    $regex: name,
                    $options: "i"
                }
            }
        ];
    }

    if (email) {
        filter.emailAddress = {
            $regex: email,
            $options: "i"
        };
    }

    if (mobileNumber) {
        filter.mobileNumber = {
            $regex: mobileNumber,
            $options: "i"
        };
    }

    console.log("USER FILTER:", filter);

    const [users, total] = await Promise.all([
        User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        User.countDocuments(filter)
    ]);

    return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getUserById = async (id: string) => {
    const cacheKey = `user:${id}`;
        const cacheUser = await redisClient.get(cacheKey);
    
        if(cacheUser) {
            console.log("User Id Cache Hit");
            return JSON.parse(cacheUser);
        }
    
        console.log("User Id Cache Miss");

    const user = await User.findById(id);
    if(!user) {
            return null;
        }
        
        await redisClient.set(
            cacheKey,
            JSON.stringify(user),{
                EX: 300
            }
        );
    return user;
};

export const updateUser = async ( id: string, data: any ) => {
    const user = await User.findByIdAndUpdate( id, data,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if(user) {
            await clearUserCache();
        }
    
    return user;
};

export const deleteUser = async (id: string) => {
    const user = await User.findByIdAndDelete(id);

    if(user) {
            await clearUserCache();
        }
    
        return user;
};
