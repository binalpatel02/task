import mongoose, { Schema } from "mongoose";
import type { ICustomer } from "../../interface/customer.interface.js";

const customerSchema = new Schema<ICustomer>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    countryCode: {
      type: String,
      required: true,
      trim: true
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true
   },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },

    user: {
      id: { type: String },
      first_name: { type: String },
      last_name: { type: String },
      email_address: { type: String },
      mobile_number: { type: String }
    }

  },
  {
    timestamps: true
  }
);

const Customer = mongoose.model<ICustomer>(
  "Customer",
  customerSchema
);

export default Customer;