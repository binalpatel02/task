import mongoose, { Schema } from "mongoose";
import type { IRole } from "../../interface/role.interface.js";

const roleSchema = new Schema<IRole>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,      
            lowercase: true,   
        },

        permission: {
            type: new Schema({
                customer: {
                    view: {
                        type: Boolean,
                        default: false,
                        required: true
                    },
                    manage: {
                        type: Boolean,
                        default: false,
                        required: true
                    }
                },
            }, { _id: false }),
            required: true,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const Role = mongoose.model<IRole>("Role", roleSchema);

export default Role;
