import mongoose from "mongoose";

export interface ICustomer {
    firstName: string;
    lastName: string;
    countryCode: string;
    mobileNumber: string;
    emailAddress?: string;
    userId: mongoose.Schema.Types.ObjectId;
    
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email_address: string;
      mobile_number: string;
    }
}