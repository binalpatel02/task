import { Request, Response } from "express";
import { createRoleService, getRoleByIdService, getRolesService, updateRoleService, deleteRoleService } from "../service/role.service.js";

import { roleSchema } from "../validation/role.validation.js";

// POST - Create Role
export const createRoleController = async ( req: Request, res: Response ) => {
    try {
        const { error } = roleSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const role = await createRoleService(req.body);

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role
        });

    } catch (error: any) {
        console.error("CREATE ROLE ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Role already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create role"
        });
    }
};


// GET - Get Roles
export const getRolesController = async ( req: Request, res: Response ) => {
    try {
        const title =
            typeof req.query.title === "string"
                ? req.query.title
                : "";

        const page = Number(req.query.page) || 1;

        const limit = Math.min(
            Number(req.query.limit) || 10,
            10
        );

        const result = await getRolesService(
            title,
            page,
            limit
        );

        if (result.total === 0) {
            return res.status(404).json({
                success: false,
                message: "No roles found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("GET ROLES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get roles"
        });
    }
};

export const getRoleByIdController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;

        const role = await getRoleByIdService(
            id as string
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "role fetched successfully",
            data: role
        });

    } catch (error: any) {
        console.error("GET ROLE BY ID ERROR:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch role"
        });
    }
};

// PUT - Update Role
export const updateRoleController = async ( req: Request, res: Response ) => {
    try {
        const { error } = roleSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const role = await updateRoleService(
            req.params.id as string,
            req.body
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: role
        });

    } catch (error: any) {
        console.error("UPDATE ROLE ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Role already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update role"
        });
    }
};


// DELETE - Delete Role
export const deleteRoleController = async ( req: Request, res: Response ) => {
    try {
        const role = await deleteRoleService(
            req.params.id as string
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully",
            data: role
        });

    } catch (error) {
        console.error("DELETE ROLE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete role"
        });
    }
};