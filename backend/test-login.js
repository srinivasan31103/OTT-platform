import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('🧪 Testing Login API...\n');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo@streamverse.com',
      password: 'demo123'
    });

    console.log('✅ LOGIN SUCCESS!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ LOGIN FAILED!\n');

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Backend is not running!');
      console.log('Start backend: cd backend && npm run dev');
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();
