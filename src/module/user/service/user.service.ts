import * as userHandler from "../handler/user.handler.js";
import { publishUserEvent } from "../library/rabbitmq/user.publisher.js";

// Login
export const loginUserService = async ( email_address: string, password: string ) => {
    return await userHandler.loginUser( email_address, password );
};

// CREATE
export const createUserService = async (data: any) => {
    return await userHandler.createUser(data);
};

// GET + SEARCH + PAGINATION
export const getUsersService = async ( name: string, email: string, mobileNumber: string, page: number = 1, limit: number = 10 ) => {
    const pageNum = Math.max(Number(page) || 1, 1);

    const limitNum = Math.min(
        Math.max(Number(limit) || 10, 1),
        10
    );

    return await userHandler.getUsers(
        name,
        email,
        mobileNumber,
        pageNum,
        limitNum
    );
};

// GET BY ID
export const getUserByIdService = async (id: string) => {
    return await userHandler.getUserById(id);
};

// UPDATE
export const updateUserService = async ( id: string, data: any ) => {
    const updatedUser = await userHandler.updateUser( id, data );

    if (!updatedUser) {
        return updatedUser;
    }

    console.log( "User updated locally:", updatedUser._id );

    const routingKey = process.env.INSTANCE === "USER1" ? "user1.updated" : "user2.updated";

    console.log("Publishing user event:", routingKey);

    await publishUserEvent( routingKey, updatedUser );

    return updatedUser;
};

// DELETE
export const deleteUserService = async (id: string) => {
    return await userHandler.deleteUser(id);
};