const countryConfigs = [
    { code: '+64', name: 'New Zealand', length: 9, prefix: '21' },
    { code: '+61', name: 'Australia', length: 9, prefix: '4' },
    { code: '+1', name: 'Canada', length: 10, prefix: '236222' }
];

const valid_prefixes = ["020", "021", "022", "027", "028", "029"];
const predefined_amounts = ["52", "71", "92"];

export const generateNZUser = () => {
    const timestamp = Date.now();
    const currentYear = new Date(timestamp).getFullYear();
    const prefix = valid_prefixes[Math.floor(Math.random() * valid_prefixes.length)];
    const remainingLength = 7;
    const randomSuffix = Math.floor(Math.random() * Math.pow(10, remainingLength))
        .toString().padStart(remainingLength, "0");
    const predefined = predefined_amounts[Math.floor(Math.random() * predefined_amounts.length)];

    return {
        username: `qa${timestamp}`,
        email: `test_${timestamp}@email.com`,
        password: 'Password123!',
        countryCode: '+64', // Targeted for the NZ challenge
        mobile_phone: `${prefix}${randomSuffix}`,
        first_name: 'Jane',
        last_name: 'Doe',
        dob: `01-01-${currentYear - 20}`, // Ensure they are over 18
        address: '123 Queen Street',
        city: 'Auckland',
        region: 'Auckland Region',
        zipcode: '1010',
        payment_provider: 'Paysafe',
        amount: '1',
        predefined_amount: `${predefined}`
    };
};

export const getExistingUser = () => {
    return {
        username: 'testuser',
        email: 'testuser@email.com',
        password: '123456',
    };
};