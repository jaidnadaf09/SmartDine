"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:5000/api';
let authToken = '';
const testAPI = async () => {
    try {
        console.log('--- Starting API Tests ---\n');
        // 1. Test Server Health
        console.log('1. Testing Health Check...');
        const healthRes = await axios_1.default.get('http://localhost:5000/');
        console.log('✅ Health Check Passed:', healthRes.data);
        // 2. Test Login
        console.log('\n2. Testing Login (Admin)...');
        const loginRes = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'admin@smartdine.com',
            password: 'password123'
        });
        authToken = loginRes.data.token;
        console.log('✅ Login Passed. Token received.');
        // 3. Test Get Menu Items (Public)
        console.log('\n3. Testing Get Menu Items...');
        const menuRes = await axios_1.default.get(`${API_URL}/menu`);
        console.log(`✅ Menu Items retrieved: ${menuRes.data.length} items`);
        // 4. Test Get Tables (Public)
        console.log('\n4. Testing Get Tables...');
        const tablesRes = await axios_1.default.get(`${API_URL}/tables`);
        console.log(`✅ Tables retrieved: ${tablesRes.data.length} tables`);
        // 5. Test Get Inventory (Protected - Admin)
        console.log('\n5. Testing Get Inventory (Protected)...');
        const invRes = await axios_1.default.get(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Inventory retrieved: ${invRes.data.length} items`);
        // 6. Test Get Orders (Protected - Staff)
        console.log('\n6. Testing Get Orders (Protected)...');
        const ordersRes = await axios_1.default.get(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Orders retrieved: ${ordersRes.data.length} orders`);
        // 7. Test Admin Stats (Protected - Admin)
        console.log('\n7. Testing Admin Stats...');
        const statsRes = await axios_1.default.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Admin Stats retrieved:`, statsRes.data);
        console.log('\n--- All Tests Passed Successfully! ---');
    }
    catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        }
        else {
            console.error(error.message);
        }
    }
};
testAPI();
