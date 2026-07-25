// const Customer = require('../models/customer');

// exports.addnewcustomer = async (req, res) => {
//     try {
//         const { name, email, googleId, profilepicture } = req.body;
//         // console.log(name,email,googleId,profilepicture)
//         let exisitingcustomer = await Customer.findOne({ email: email }).lean().exec();
//         if (exisitingcustomer) {
//             res.send(exisitingcustomer)
//         } else {
//             const customer = new Customer({
//                 name, email, googleId, profilepicture
//             });
//             const newCustomer = await customer.save()
//             res.status(201).json(newCustomer);
//         }
//     } catch (error) {
//         console.error('error adding customer', error);
//         res.status(500).json({ error: "internal server error" });
//     }
// }



// const Customer = require('../models/customer');

// exports.addnewcustomer = async (req, res) => {
//     try {
//         const { name, email, googleId, profilepicture } = req.body;

//         let existingcustomer = await Customer.findOne({ email: email }).lean().exec();

//         if (existingcustomer) {
//             res.send(existingcustomer);
//         } else {
//             const customer = new Customer({
//                 name,
//                 email,
//                 googleId,
//                 profilepicture
//             });

//             const newCustomer = await customer.save();
//             res.status(201).json(newCustomer);
//         }

//     } catch (error) {
//         console.error('error adding customer', error);
//         res.status(500).json({ error: "internal server error" });
//     }
// };


// Get customer profile
exports.getCustomer = async (req, res) => {
    try {
        const { email } = req.query;

        const customer = await Customer.findOne({ email: email });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.status(200).json(customer);

    } catch (error) {
        console.error("Error fetching customer", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};