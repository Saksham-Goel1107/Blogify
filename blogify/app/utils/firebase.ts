import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export const sendNotification = async (token: string, title: string, body: string) => {
    try {
        const message = {
            token,
            notification: {
                title,
                body,
            },
        };

        const response = await admin.messaging().send(message);
        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

export default admin;
