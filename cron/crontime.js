const cron = require('node-cron');
const Booking = require('../models/Booking');

const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const currentTime = new Date();
      
      const expiredBookings = await Booking.deleteMany({
        endTime: { $lte: currentTime }
      });

      if (expiredBookings.deletedCount > 0) {
        console.log(`Deleted ${expiredBookings.deletedCount} expired bookings at ${currentTime}`);
      }
    } catch (error) {
      console.error('Error in cron job deleting bookings:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
  });
};

module.exports = { startCronJobs };