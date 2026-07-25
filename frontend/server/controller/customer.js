const Customer = require('../models/customer');


// Add new customer after Google login
exports.addnewcustomer = async (req, res) => {
    try {
        const { name, email, googleId, profilepicture } = req.body;

        let existingcustomer = await Customer.findOne({ email: email }).lean().exec();

        if (existingcustomer) {
            return res.status(200).json(existingcustomer);
        }

        const customer = new Customer({
            name,
            email,
            googleId,
            profilepicture
        });

        const newCustomer = await customer.save();

        return res.status(201).json(newCustomer);

    } catch (error) {
        console.error("Error adding customer:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};


// Get customer profile
exports.getCustomer = async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const customer = await Customer.findOne({ email: email });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        return res.status(200).json(customer);

    } catch (error) {
        console.error("Error fetching customer:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};