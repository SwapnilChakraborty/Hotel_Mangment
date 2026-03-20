const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Override DNS for MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in .env');
    process.exit(1);
}

async function purgeDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for purging...');

        // Note: 'staff' collection is omitted to prevent locking yourself out of the admin panel.
        // If you need to purge staff as well, add 'staff' to this array.
        const collections = ['rooms', 'customers', 'orders', 'servicerequests', 'leads', 'chatmessages', 'systemsettings'];
        
        for (const colName of collections) {
            try {
                await mongoose.connection.db.dropCollection(colName);
                console.log(`Dropped collection: ${colName}`);
            } catch (err) {
                if (err.code === 26) {
                    console.log(`Collection ${colName} does not exist, skipping.`);
                } else {
                    console.error(`Error dropping ${colName}:`, err.message);
                }
            }
        }

        console.log('Database purge complete.');
        process.exit(0);
    } catch (err) {
        console.error('Purge failed:', err.message);
        process.exit(1);
    }
}

purgeDatabase();
