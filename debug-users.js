const mongoose = require('mongoose');

// Connect to MongoDB
const MONGO_URI = "mongodb+srv://Sneh1106:SnehShah1920@cluster0.3irnhnv.mongodb.net/smarthire_db?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        // Simplified schema for debugging
    },
    { strict: false }
);

const User = mongoose.model("User", UserSchema);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find({}).limit(10).sort({ _id: -1 }); // Get last 10 users
        console.log("Found users:", users.length);
        users.forEach(u => {
            console.log(`Email: ${u.email}, Name: '${u.fullName}'`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
