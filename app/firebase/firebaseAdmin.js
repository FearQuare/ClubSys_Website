import * as admin from 'firebase-admin';
const serviceAccount = require('../../secrets/clubsys-54907-firebase-adminsdk-spa3g-d8fbd903e0.json');

if(!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),

    });
}

export default admin.firestore();