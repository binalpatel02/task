import Role from "../model/schema/role.schema.js";

// CREATE
export const createRole = async (data: any) => {
    return await Role.create(data);
};

// GET + SEARCH + PAGINATION
export const getRoles = async ( title: string, page: number, limit: number ) => {

    const skip = (page - 1) * limit;

    const filter: any = {};

    if (title) {
        filter.title = {
            $regex: title,
            $options: "i"
        };
    }

    console.log("ROLE FILTER:", filter);

    const [roles, total] = await Promise.all([
        Role.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Role.countDocuments(filter)
    ]);

    return {
        roles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getRoleById = async (id: string) => {
    return await Role.findById(id);
};

// UPDATE
export const updateRole = async ( id: string, data: any ) => {
    return await Role.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    );
};

// DELETE
export const deleteRole = async (id: string) => {
    return await Role.findByIdAndDelete(id);
};