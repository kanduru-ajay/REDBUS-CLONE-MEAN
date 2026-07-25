const express = require("express")
const router = express.Router();
const customercontroller = require("../controller/customer")

// Add new customer
router.post("/customer", customercontroller.addnewcustomer)

// Get customer profile
router.get("/", customercontroller.getCustomer)

module.exports = router;
// const express=require("express")
// const router=express.Router();
// const customercontroller=require("../controller/customer")

// router.post("/customer",customercontroller.addnewcustomer)

// module.exports=router;