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