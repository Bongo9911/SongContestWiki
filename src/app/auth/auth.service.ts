import { Injectable, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import firebase from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthService implements OnDestroy {
	user?: firebase.User;
	credential: any;
	redirect: string = '';

	durationInSeconds = 2;

	authSubscription: Subscription;

	//https://www.techiediaries.com/angular-firebase/angular-9-firebase-authentication-email-google-and-password/

	constructor(public afAuth: AngularFireAuth, public router: Router,
		private database: AngularFirestore) {
		//Checks the local storage to see if the user is logged in, if they are, it grabs their information.
		this.authSubscription = this.afAuth.authState.subscribe(user => {
			if (user) {
				this.user = user;
				localStorage.setItem('user', JSON.stringify(this.user));
			} else {
				localStorage.setItem('user', '');
			}
		})
	}

	ngOnDestroy(): void {
		this.authSubscription.unsubscribe();
	}

	//Logs a user into their account
	async login(email: string, password: string): Promise<any> {
		//Sets the authentication state to persist forever
		return new Promise((resolve, reject) => {
			firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(async () => {
				let result = await this.afAuth.signInWithEmailAndPassword(email, password).then(async (res) => {
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
		firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(async () => {
			let result = await this.afAuth.signInAnonymously()
			await this.afAuth.currentUser.then(async (u) => {
				if (u) {
					this.user = u;
					localStorage.setItem('user', JSON.stringify(this.user));
				}
			})
		})
	}

	//Can be used if we want to set up logging in with a Google account
	async loginWithGoogle() {
		await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(async (res) => {
			if (res.additionalUserInfo?.isNewUser) {
				await this.afAuth.currentUser.then(async (u) => {
					if (u) {
						this.user = u;
						localStorage.setItem('user', JSON.stringify(this.user));
					}
				});
			}
			else {
				await this.afAuth.currentUser.then(async (u) => {
					if (u) {
						this.user = u;
						localStorage.setItem('user', JSON.stringify(this.user));
						this.router.navigate([this.redirect]);
						this.redirect = ''
					}
				})
			}
		})
	}

	//Creates a new user with an email and password
	async register(email: string, password: string, displayName: string) {
		let result = await this.afAuth.createUserWithEmailAndPassword(email, password);
		await this.afAuth.currentUser.then(u => {
			if (u) {
				u.updateProfile({
					displayName: displayName,
					//photoUrl: "url"
				});
				this.sendEmailVerification();
			}
		});
	}

	//Sends an email to user when they sign up to verify their account
	async sendEmailVerification() {
		await this.afAuth.currentUser.then(u => {
			if (u) {
				u.sendEmailVerification();
			}
		});
		this.router.navigate(['verify-email']);
	}

	//Sends a reset email to the provided email so they can change their password.
	async sendPasswordResetEmail(passwordResetEmail: string) {
		return await this.afAuth.sendPasswordResetEmail(passwordResetEmail);
	}

	//Updates the user's password given their old password and a new password
	async changePassword(oldPassword: string, newPassword: string) {
		let changed: boolean = false;

		firebase.auth()
			//Signs the user in again to make sure their credentials are valid.
			.signInWithEmailAndPassword(this.email(), oldPassword)
			.then(function (user) {
				let currentUser = firebase.auth().currentUser;
				if (currentUser) {
					//Updates the user's password
					currentUser.updatePassword(newPassword).then(function () {
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
		await firebase.auth()
			//Signs the user in again to make sure their credentials are valid.
			.signInWithEmailAndPassword(oldEmail, password)
			.then(async (user) => {
				let currentUser = await firebase.auth().currentUser;
				if (currentUser) {
					//Updates the user's email
					currentUser.updateEmail(newEmail).then(() => {
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
		this.afAuth.signOut();
	}

	//Updates the user's display name to the new name provided
	async updateDisplayName(displayName: string) {
		await this.afAuth.currentUser.then(u => {
			if (u) {
				u.updateProfile({
					displayName: displayName
				});
			}
		});
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
