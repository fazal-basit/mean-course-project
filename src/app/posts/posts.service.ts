import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { Post } from "./post.model";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

const BACKEND_URL = environment.apiURL + '/posts/'

@Injectable({providedIn: 'root'})
export class PostsService{
    private posts: any[] = [];
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

    constructor(private http: HttpClient, private router: Router){

    }
    getPosts(postsPerPage: number, currentPage: number){
        const queryParam = `?pagesize=${postsPerPage}&page=${currentPage}`;
       this.http
       .get<{message: string, posts: any, maxPosts: number}>(
        BACKEND_URL + queryParam)
        .pipe(map((postData) => {
            return { posts: postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,                    
                    id: post._id,
                    imagePath: post.imagePath,
                    extraInfo: post.extraInfo,
                    creator: post.creator
                };
            }), 
            maxPosts: postData.maxPosts}
        }))
       .subscribe((transformedPostsData) => {
            this.posts = transformedPostsData.posts;
            this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostsData.maxPosts});
       });
    }

    getPostUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    getPost(id: string){
        return this.http.get<{
            extraInfo: string;_id: string, title: string, content: string, imagePath: string, creator: string
}>(BACKEND_URL +id)
    }

    addPost(title: string, content: string, image: File, extraInfo: string){
        //const post: Post = {id: null,title: title, content:content};
        const postData = new FormData();
        postData.append("title",title);
        postData.append("content",content);
        postData.append("extraInfo", extraInfo);
        postData.append("image", image, title);
        this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
        .subscribe((responseData) => {            
            this.router.navigate(['/']);
        })        
    }

    updatePost(id: string, title: string, content: string, image: File | string, extraInfo: string){
        let postData: Post | FormData;
        if(typeof(image) === 'object'){
            postData = new FormData();
            postData.append("id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title)
        } else {
            postData = {id: id, title: title, content: content, imagePath: image, extraInfo: extraInfo, creator: null}
        }
        this.http.put(BACKEND_URL + id, postData)
        .subscribe(response => {            
            this.router.navigate(['/']);
        });
    }

    deletePost(postId: string){
        return this.http.delete(BACKEND_URL + postId)       
    }
}