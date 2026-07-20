const Booking=require("../models/booking");
const { createNotification } = require("./notification");

exports.addbooking=async(req,res)=>{
    const booking =await Booking.create(req.body);
    await createNotification({
        userId: booking.customerId,
        type: "booking_confirmation",
        channels: ["inApp", "email", "push"],
        metadata: { bookingId: booking._id, route: `${booking.departureDetails.city} to ${booking.arrivalDetails.city}` }
    });
    res.send(booking);
}

exports.getBooking =async(req,res)=>{
    let {id}=req.params;
    const booking=await Booking.find().lean().exec();
    let filteredBookings=booking.filter((booking)=>booking.customerId.toString()== id);
    res.send(filteredBookings)
}
