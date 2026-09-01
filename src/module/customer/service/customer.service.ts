import * as customerHandler from "../handler/customer.handler.js";
import { importCustomersFromExcel } from "../handler/customer.import .handler.js";
import { publishEvent } from "../../../library/rabbitmq.js";
import Customer from "../model/schema/customer.schema.js";
import User from "../../user/model/schema/user.schema.js";

// CREATE
export const createCustomerService = async (data: any) => {

    const user = await User.findOne({
        email_address: data.emailAddress
    });

    if (!user) {
        throw new Error( `User not found for email: ${data.emailAddress}. Please create the User first.` );
    }

    const newCustomer = await customerHandler.createCustomer(data);

    const linkedCustomer = await Customer.findByIdAndUpdate(
        newCustomer._id,
            {
                userId: user._id
            },
            {
                new: true
            }
        ).lean();

    console.log( `Customer (${newCustomer._id}) linked to existing User (${user._id})`);

    return linkedCustomer;
};

// GET + SEARCH + PAGINATION
export const getCustomersService = async (
    name: string,
    email: string,
    mobileNumber: string,
    page: number = 1,
    limit: number = 10
) => {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return await customerHandler.getCustomers(
        name,
        email,
        mobileNumber,
        pageNum,
        limitNum
    );
};

// GET BY ID
export const getCustomerByIdService = async (id: string) => {
    return await customerHandler.getCustomerById(id);
};

// UPDATE
export const updateCustomerService = async (id: string, data: any) => {

    const updatedCustomer = await customerHandler.updateCustomer( id, data );

    if (updatedCustomer &&updatedCustomer.userId ) {
        console.log( `Customer updated. Publishing customer.updated for User ID: ${updatedCustomer.userId}`);

        await publishEvent( "customer.updated",
            {
                userId:
                    updatedCustomer.userId.toString(),

                first_name:
                    updatedCustomer.firstName,

                last_name:
                    updatedCustomer.lastName,

                email_address:
                    updatedCustomer.emailAddress,

                mobile_number:
                    updatedCustomer.mobileNumber
            }
        );

        console.log( ` Event 'customer.updated' sent for User ID: ${updatedCustomer.userId}`);
    }

    return updatedCustomer;
};

export const deleteCustomerService = async (id: string) => {
    return await customerHandler.deleteCustomer(id);
};

// IMPORT FROM EXCEL
export const importCustomersFromExcelService = async (filePath: string) => {
    return await importCustomersFromExcel(filePath);
};