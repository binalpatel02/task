import { Request, Response } from "express";
import { createCustomerService, getCustomersService, getCustomerByIdService, updateCustomerService, deleteCustomerService, importCustomersFromExcelService } from "../service/customer.service.js";
import { createCustomerSchema, updateCustomerSchema } from "../validation/customer.validation.js";

// POST
export const createCustomerController = async (req: Request, res: Response) => {
    try {
        const { error } = createCustomerSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const customer = await createCustomerService(req.body);

        return res.status(201).json({
            success: true,
            message: "Customer create successfully",
            data: customer
        });
    } catch (error: any) {
        console.error("CREATE CUSTOMER ERROR:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            let message = "Duplicate value already exists";

            if (duplicateField === "emailAddress") {
                message = "Email address already exists";
            }
            if (duplicateField === "mobileNumber") {
                message = "Mobile number already exists";
            }

            return res.status(409).json({
                success: false,
                message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create customer",
            error: error.message
        });
    }
};

// GET
export const getCustomersController = async (req: Request, res: Response) => {
    try {
        const name = typeof req.query.name === "string" ? req.query.name : "";
        const email = typeof req.query.email === "string" ? req.query.email : "";
        const mobileNumber = typeof req.query.mobileNumber === "string" ? req.query.mobileNumber : "";
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 10);

        const result = await getCustomersService(name, email, mobileNumber, page, limit);

        if (result.total === 0) {
            return res.status(404).json({
                success: false,
                message: "No customers found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("GET CUSTOMERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get customers"
        });
    }
};

export const getCustomerByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const customer = await getCustomerByIdService(id as string);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer fetched successfully",
            data: customer
        });
    } catch (error: any) {
        console.error("Get customer by ID error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};

// PUT
export const updateCustomerController = async (req: Request, res: Response) => {
    try {
        const { error } = updateCustomerSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const customer = await updateCustomerService(req.params.id as string, req.body);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer update successfully",
            data: customer
        });
    } catch (error: any) {
        console.error("UPDATE CUSTOMER ERROR:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `${duplicateField} already exists`
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update customer"
        });
    }
};

// DELETE
export const deleteCustomerController = async (req: Request, res: Response) => {
    try {
        const customer = await deleteCustomerService(req.params.id as string);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer delete successfully",
            data: customer
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete customer"
        });
    }
};

// IMPORT EXCEL FILE
export const importCustomerController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Excel file is required"
            });
        }

        const result = await importCustomersFromExcelService(req.file.path);

        return res.status(201).json({
            success: true,
            message: "Customers imported successfully",
            data: result
        });
    } catch (error: any) {
        console.error("IMPORT CUSTOMER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to import customers"
        });
    }
};