import * as roleHandler from "../handler/role.handler.js";

// CREATE
export const createRoleService = async (data: any) => {
    return await roleHandler.createRole(data);
};

// GET + SEARCH + PAGINATION
export const getRolesService = async ( title: string, page: number = 1, limit: number = 10 ) => {
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 10, 10);

    return await roleHandler.getRoles(
        title,
        pageNum,
        limitNum
    );
};

// GET BY ID
export const getRoleByIdService = async (id: string) => {
    return await roleHandler.getRoleById(id);
};

// UPDATE
export const updateRoleService = async ( id: string, data: any ) => {
    return await roleHandler.updateRole(id, data);
};

// DELETE
export const deleteRoleService = async (id: string) => {
    return await roleHandler.deleteRole(id);
};