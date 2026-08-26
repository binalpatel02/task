import Customer from "../model/schema/customer.schema.js";

// CREATE
export const createCustomer = async (data: any) => {
   try {
       const customer = await Customer.create(data);
       console.log("Successfully inserted into MongoDB:", customer._id);
       return customer;
   } catch (error) {
       console.error("MongoDB Insertion Failed Error Detail:", error);
       throw error;
   }
};

// GET + SEARCH + PAGINATION
export const getCustomers = async ( name: string, email: string, mobileNumber: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Search by firstName or lastName
    if (name) {
        filter.$or = [
            { firstName: { $regex: name, $options: "i" } },
            { lastName: { $regex: name, $options: "i" } }
        ];
    }

    // Search by email
    if (email) {
        filter.emailAddress = { $regex: email, $options: "i" };
    }

    // Search by mobile number
    if (mobileNumber) {
        filter.mobileNumber = { $regex: mobileNumber, $options: "i" };
    }

    console.log("FILTER:", filter);

    const [customers, total] = await Promise.all([
        Customer.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Customer.countDocuments(filter)
    ]);

    return {
        customers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

// GET BY ID
export const getCustomerById = async (id: string) => {
    const customer = await Customer.findById(id).lean();
    if (!customer) {
        return null;
    }
    return customer;
};

// UPDATE
export const updateCustomer = async (id: string, data: any) => {
    const customer = await Customer.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true
    });
    return customer;
};

// DELETE
export const deleteCustomer = async (id: string) => {
    const customer = await Customer.findByIdAndDelete(id);
    return customer;
};
