import mongoose, { Schema } from "mongoose";
import type { IUser } from "../../interface/user.interface.js";

const userSchema = new Schema<IUser>(
  {
    avatar: {
      type: String,
      trim: true,
      default: ""
    },

    first_name: {
      type: String,
      required: true,
      trim: true
    },

    last_name: {
      type: String,
      required: true,
      trim: true
    },

    country_code: {
      type: String,
      required: true,
      trim: true
    },

    mobile_number: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    email_address: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true
    },
    
    password: {
      type: String,
      required: true,
      trim: true
    },

    user_type: {
      type: String,
      required: true,
      trim: true,
    }

  },
  {
    timestamps: true
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
