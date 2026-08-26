import XLSX from "xlsx";
import Customer from "../model/schema/customer.schema.js";

export const importCustomersFromExcel = async (filePath: string) => {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);

    // Get first sheet
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error("Excel sheet not found");
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert Excel to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
        throw new Error("Excel file is empty");
    }

    console.log("Total Excel rows:", rows.length);

    // Prepare & validate customer data 
    const customers = rows.flatMap((row: any) => {
        const firstName = String(row?.firstName || "").trim();
        const lastName = String(row?.lastName || "").trim();
        const countryCode = String(row?.countryCode || "").trim();
        const mobileNumber = String(row?.mobileNumber || "").trim();
        const emailAddress = String(row?.emailAddress || "").trim().toLowerCase();

        // Regex patterns
        const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
        const countryCodeRegex = /^\+?[1-9]\d{0,3}$/;
        const mobileNumberRegex = /^\d{7,15}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        // Drop row if ANY required field is missing or invalid
        if (
            !nameRegex.test(firstName) ||
            !nameRegex.test(lastName) ||
            !countryCodeRegex.test(countryCode) ||
            !mobileNumberRegex.test(mobileNumber) ||
            !emailRegex.test(emailAddress)
        ) {
            return [];
        }

        return [{
            firstName,
            lastName,
            countryCode,
            mobileNumber,
            emailAddress
        }];
    });

    if (customers.length === 0) {
        throw new Error("No valid customer records found in Excel sheet");
    }

    try {
        const result = await Customer.insertMany(customers, { ordered: false });

        return {
            totalRows: rows.length,
            validRows: customers.length,
            imported: result.length,
            skippedDuplicates: 0,
            customers: result
        };

    } catch (error: any) {
        // Handle MongoDB E11000 duplicate key errors gracefully
        if (error.code === 11000 || error.name === "BulkWriteError") {
            const insertedDocs = error.insertedDocs || [];
            const duplicateCount = error.writeErrors?.length || 0;

            console.warn(`Partial import complete: ${insertedDocs.length} inserted, ${duplicateCount} duplicates skipped.`);

            return {
                totalRows: rows.length,
                validRows: customers.length,
                imported: insertedDocs.length,
                skippedDuplicates: duplicateCount,
                customers: insertedDocs
            };
        }

        console.error("EXCEL IMPORT ERROR:", error);
        throw error;
    }
};
