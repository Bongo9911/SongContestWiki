import { Injectable, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import "firebase/compat/auth";
import {
	getAuth, onAuthStateChanged, Auth, User, setPersistence, browserLocalPersistence,
	browserSessionPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
	sendEmailVerification, sendPasswordResetEmail, updatePassword, updateEmail, signOut, Unsubscribe,
	signInAnonymously
} from "firebase/auth";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../credentials';

@Injectable({
	providedIn: 'root'
})
export class AuthService implements OnDestroy {
	user?: User;
	credential: any;
	redirect: string = '';

	durationInSeconds = 2;

	authSubscription: Unsubscribe;
	firebaseApp: FirebaseApp;
	auth: Auth;

	//https://www.techiediaries.com/angular-firebase/angular-9-firebase-authentication-email-google-and-password/

	constructor(public router: Router) {
		this.firebaseApp = initializeApp(firebaseConfig);
		//Checks the local storage to see if the user is logged in, if they are, it grabs their information.
		this.auth = getAuth(this.firebaseApp);
		this.authSubscription = onAuthStateChanged(this.auth, user => {
			if (user) {
				this.user = user;
				localStorage.setItem('user', JSON.stringify(this.user));
			} else {
				this.loginAsGuest();
				//localStorage.setItem('user', JSON.stringify(this.user));
			}
		})
	}

	ngOnDestroy(): void {
		this.authSubscription(); //unsubscribe from subscription
	}

	//Logs a user into their account
	async login(email: string, password: string): Promise<any> {
		//Sets the authentication state to persist forever
		return new Promise((resolve, reject) => {
			setPersistence(this.auth, browserLocalPersistence).then(async () => {
				let result = signInWithEmailAndPassword(this.auth, email, password).then(async (res) => {
					await res.user;
					if (res.user) {
						this.user = res.user
						await delay(1);
						this.router.navigate([this.redirect]);
						this.redirect = ''
					}
					resolve(1);
				}).catch(() => {
					resolve(0);
				});
			});
		})
	}

	//Logs a user into a guest account
	async loginAsGuest() {
		//Sets the authentication state to persist until the window is closed
		setPersistence(this.auth, browserSessionPersistence).then(async () => {
			let result = await signInAnonymously(this.auth).then(async (res) => {
				await res.user;
				if (res.user) {
					this.user = res.user
					await delay(1);
					this.router.navigate([this.redirect]);
					this.redirect = ''
				}
			}).catch(() => {
			});
		})
	}

	//Can be used if we want to set up logging in with a Google account
	// async loginWithGoogle() {
	// 	await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(async (res) => {
	// 		if (res.additionalUserInfo?.isNewUser) {
	// 			await this.afAuth.currentUser.then(async (u) => {
	// 				if (u) {
	// 					this.user = u;
	// 					localStorage.setItem('user', JSON.stringify(this.user));
	// 				}
	// 			});
	// 		}
	// 		else {
	// 			await this.afAuth.currentUser.then(async (u) => {
	// 				if (u) {
	// 					this.user = u;
	// 					localStorage.setItem('user', JSON.stringify(this.user));
	// 					this.router.navigate([this.redirect]);
	// 					this.redirect = ''
	// 				}
	// 			})
	// 		}
	// 	})
	// }

	//Creates a new user with an email and password
	async register(email: string, password: string, displayName: string) {
		let result = await createUserWithEmailAndPassword(this.auth, email, password);

		let user = await this.auth.currentUser;

		if (user) {
			updateProfile(user, {
				displayName: displayName,
				//photoUrl: "url"
			});
			this.sendEmailVerification();
		}
	}

	//Sends an email to user when they sign up to verify their account
	async sendEmailVerification() {
		let user = await this.auth.currentUser;
		if (user) {
			sendEmailVerification(user);
		}
		this.router.navigate(['verify-email']);
	}

	//Sends a reset email to the provided email so they can change their password.
	async sendPasswordResetEmail(passwordResetEmail: string) {
		return await sendPasswordResetEmail(this.auth, passwordResetEmail);
	}

	//Updates the user's password given their old password and a new password
	async changePassword(oldPassword: string, newPassword: string) {
		let changed: boolean = false;
		//Signs the user in again to make sure their credentials are valid.
		signInWithEmailAndPassword(this.auth, this.email(), oldPassword)
			.then(function (user) {
				let currentUser = this.auth.currentUser;
				if (currentUser) {
					//Updates the user's password
					updatePassword(currentUser, newPassword).then(function () {
						//Password change successful
						changed = true;
					}).catch(function (err) {
						//Error
					});
				}
			}).catch(function (err) {
				//Error
			});

		if (changed) this.router.navigate(['account']);
	}

	//Changes the user's email to the provided email
	async changeEmail(newEmail: string, oldEmail: string, password: string): Promise<boolean> {
		let success = false;
		//Signs the user in again to make sure their credentials are valid.
		signInWithEmailAndPassword(this.auth, oldEmail, password)
			.then(async (user) => {
				let currentUser = await this.auth.currentUser;
				if (currentUser) {
					//Updates the user's email
					updateEmail(currentUser, newEmail).then(() => {
						//Email change successful
						return true;
					}).catch((err) => {
						//console.log(err)
					});


				}
			}).catch(function (err) {
				//console.log(err)
			});

		return success;
	}

	//Logs a user out of their account
	async logout() {
		localStorage.removeItem('user');
		this.router.navigate(['login']);
		signOut(this.auth);
	}

	//Updates the user's display name to the new name provided
	async updateDisplayName(displayName: string) {
		let user = await this.auth.currentUser
		if (user) {
			updateProfile(user, {
				displayName: displayName
			});
		}
	}

	//Checks if a user is logged in.
	isLoggedIn(): boolean {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user !== null;
	}

	//Checks if a user is a guest account.
	isGuest(): boolean {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.isAnonymous;
	}

	//Returns the diplay name for the user
	displayName(): string {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.displayName;
	}

	//Returns the email for the user
	email(): string {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.email;
	}

	//Returns the UID for the user
	uid(): string {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.uid;
	}

	//Checks if a user is logged in using normal login or a special service like Google.
	isNormalAccount(): boolean {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.providerData[0].providerId !== "google.com";
	}

	setRedirect(page: string): void {
		this.redirect = page;
	}
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
