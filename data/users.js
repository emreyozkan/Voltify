const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed in seeder
        isAdmin: true,
        isSeller: false,
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isAdmin: false,
        isSeller: false,
    },
    {
        name: 'Seller User',
        email: 'seller@example.com',
        password: 'password123',
        isAdmin: false,
        isSeller: true,
    },
];

module.exports = users;
