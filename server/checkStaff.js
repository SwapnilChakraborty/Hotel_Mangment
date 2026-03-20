const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Override DNS for MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const StaffSchema = new mongoose.Schema({
    username: String,
    role: String
});
const Staff = mongoose.model('Staff', StaffSchema);

async function checkStaff() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const count = await Staff.countDocuments();
        console.log('Total staff in DB:', count);
        
        if (count > 0) {
            const users = await Staff.find({}, 'username role');
            console.log('Staff list:', users);
        } else {
            console.log('Staff collection is EMPTY!');
        }
        
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkStaff();
