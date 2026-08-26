import * as customerHandler from "../handler/customer.handler.js";
import { importCustomersFromExcel } from "../handler/customer.import .handler.js";

// CREATE
export const createCustomerService = async (data: any) => {
    return await customerHandler.createCustomer(data);
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
    return await customerHandler.updateCustomer(id, data);
};

// DELETE
export const deleteCustomerService = async (id: string) => {
    return await customerHandler.deleteCustomer(id);
};

// IMPORT FROM EXCEL
export const importCustomersFromExcelService = async (filePath: string) => {
    return await importCustomersFromExcel(filePath);
};