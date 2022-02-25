import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp({
	projectId: "songcontestwiki",
	storageBucket: "songcontestwiki.appspot.com",
	credential: admin.credential.applicationDefault(),
});

export const claimCountry = functions.runWith({ timeoutSeconds: 540, memory: '128MB', maxInstances: 1 })
	.firestore.document('countryclaims/{docId}').onCreate(async (snap, context) => {
		const data = snap.data() as CountryClaim;

		let eddoc = await admin.firestore().collection("contests").doc(data.contestid).collection("hosting").doc("currented").get();
		let eddata = eddoc.data() as HostEdition;

		//user has claimed a country before
		if (eddata.users.indexOf(data.user) !== - 1) { 
			//country is already claimed
			if (eddata.countries.indexOf(data.country) !== -1) {
				await admin.firestore().collection("countryclaims").doc(context.params.docId).set({
					status: "taken"
				})
			}
			//country is not claimed
			else {
				let userindex = eddata.users.indexOf(data.user);
				eddata.countries[userindex] = data.country;
				await admin.firestore().collection("contests").doc(data.contestid).collection("hosting").doc("currented").set(eddata)
			}
		}
		//user has not claimed a country
		else {
			//country is already claimed
			if (eddata.countries.indexOf(data.country) !== -1) {
				await admin.firestore().collection("countryclaims").doc(context.params.docId).set({
					status: "taken"
				})
			}
			//country is not claimed
			else {
				eddata.users.push(data.user);
				eddata.countries.push(data.country);
				await admin.firestore().collection("contests").doc(data.contestid).collection("hosting").doc("currented").set(eddata)
			}
		}
	});


interface CountryClaim {
	contestid: string,
	user: string,
	country: string
}

interface HostEdition {
	ednum: number,
	stage: string,
	phase: string,
	format: string,
	users: string[],
	countries: string[]
}