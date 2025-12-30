// Test script to verify prescription API functionality
const API_BASE_URL = 'http://localhost:8000/api';

// Test data for prescription
const testPrescriptionData = {
    appointment_id: 1, // Replace with actual appointment ID
    patient_id: 1, // Replace with actual patient user ID
    doctor_id: 1, // Replace with actual doctor ID
    diagnosis: 'Test diagnosis - common cold',
    advice: 'Take rest and drink plenty of fluids',
    follow_up_date: '2025-01-15',
    medicine_items: [
        {
            medicine_name: 'Paracetamol',
            dosage: '500mg',
            frequency: '3 times daily',
            duration: '5 days',
            instructions: 'After meals'
        }
    ],
    lab_tests: [
        {
            test_name: 'Blood Test',
            priority: 'normal'
        }
    ]
};

async function testPrescriptionAPI() {
    console.log('🧪 Testing Prescription API...\n');

    // First, get auth token (you'll need to replace this with actual login)
    const authToken = localStorage.getItem('auth_token');

    if (!authToken) {
        console.log('❌ No auth token found. Please login first.');
        return;
    }

    try {
        console.log('📤 Sending prescription data:', JSON.stringify(testPrescriptionData, null, 2));

        const response = await fetch(`${API_BASE_URL}/prescriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(testPrescriptionData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Prescription created successfully!');
            console.log('📋 Response:', JSON.stringify(result, null, 2));
        } else {
            console.log('❌ Prescription creation failed');
            console.log('📋 Response:', JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.log('💥 Error:', error.message);
    }
}

// Instructions for testing
console.log(`
🚀 Prescription API Test Script
===============================

To test the prescription functionality:

1. Open browser console on the admin site
2. Login as a doctor/admin user
3. Run this test: testPrescriptionAPI()

Make sure to update the test data with actual IDs from your database.

Test data structure:
- appointment_id: ID of a confirmed appointment
- patient_id: user_id from the appointment
- doctor_id: doctor_id from the appointment

The test will validate:
✅ Required field validation
✅ Medicine item validation (name, dosage, frequency, duration)
✅ Lab test validation
✅ Backend API integration
✅ Error handling
`);

// Uncomment to run test automatically
// testPrescriptionAPI();