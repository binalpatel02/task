import * as userHandler from "../handler/user.handler.js";
import { publishEvent } from "../../../library/rabbitmq.js";

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

    if (updatedUser) {
        console.log( "User updated successfully in DB." );

        await publishEvent("user.updated", {
            userId: updatedUser._id.toString(),

            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email_address: updatedUser.email_address,
            mobile_number: updatedUser.mobile_number
        });

        console.log( `Event 'user.updated' successfully sent for User ID: ${updatedUser._id}`);
    }

    return updatedUser;
};

// DELETE
export const deleteUserService = async (id: string) => {
    return await userHandler.deleteUser(id);
};