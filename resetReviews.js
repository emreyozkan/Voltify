const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const resetReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await Product.updateMany({}, {
            $set: {
                reviews: [],
                numReviews: 0,
                rating: 0
            }
        });

        console.log('All reviews reset successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetReviews();
