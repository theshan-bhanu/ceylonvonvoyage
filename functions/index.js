const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

admin.initializeApp();

// Secure Stripe Checkout Callable
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { amount, serviceName } = data;

    try {
        // 2. Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: 'usd',
            metadata: { 
                userId: context.auth.uid, 
                serviceName: serviceName,
                artifactAppId: 'ceylon-voyage-v8'
            },
            automatic_payment_methods: { enabled: true },
        });

        // 3. Return Client Secret to Frontend
        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id
        };
    } catch (error) {
        console.error("Stripe Error:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Secure Admin Data Export (Backend Only)
exports.secureDataExport = functions.https.onCall(async (data, context) => {
    // Verify Admin Role from Custom Claims or Firestore
    const userDoc = await admin.firestore()
        .collection('artifacts').doc('ceylon-voyage-v8')
        .collection('users').doc(context.auth.uid)
        .collection('profile').doc('data').get();

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access only.');
    }

    // Logic to compile and return sensitive data
    return { status: "Success", timestamp: new Date().toISOString() };
});
