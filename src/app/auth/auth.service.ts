import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "./auth-data.model";
import { Observable, Subject } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
    providedIn: "root"
})
export class AuthService{
    private token: string;
    private authStatusListener = new Subject<boolean>();
    private isAuthenticated = false;
    private tokenTimer: any;
    private userId: string;

    constructor(private http: HttpClient, private router: Router){

    }
    getToken(){
        return this.token;
    }
    getIsAuth(){
        return this.isAuthenticated;
    }

    getUserId(){
        return this.userId;
    }
    getAuthStatusListener(): Observable<any>{
        return this.authStatusListener.asObservable();
    }
    createUser(email: string, password: string){
        const authData: AuthData = {
            email: email,
            password: password
        }
       this.http.post('http://localhost:3000/api/user/signup', authData).subscribe(() => {
        this.router.navigate(["/"]);
       },
        (error) => {
            this.authStatusListener.next(false);
        });
    }

    login(email: string, password: string){
        const authData: AuthData = {
            email: email,
            password: password
        }
        this.http.post<{token: string, expiresIn: number, userId: string}>('http://localhost:3000/api/user/login', authData).subscribe(response => {
                const token = response.token;
                this.token  = token;
                if(token){
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.tokenTimer = window.setTimeout(() => {
                        this.logout();
                    }, expiresInDuration * 1000);
                    this.isAuthenticated = true;
                    this.userId = response.userId;
                    this.authStatusListener.next(true);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    console.log(expirationDate);
                    this.saveAuthData(token, expirationDate, this.userId);
                    this.router.navigate(['/']);
                }                                
        }, (error) => {
            this.authStatusListener.next(false);
        });
    }

    autoAuthUser(){
        const authInformation = this.getAuthData();
        if(!authInformation){
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if(expiresIn > 0){
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    logout(){
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = null;
        this.router.navigate(['/']);        
    }

    private setAuthTimer(duration: number){
        console.log('seeting timer:' + duration);
        this.tokenTimer = window.setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string){
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData(){
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    private getAuthData(){
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');
        if(!token || !expirationDate){
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }
    
}