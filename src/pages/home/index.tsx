import { useCallback, useContext, useEffect, useState } from 'react';
import PostForm from 'components/posts/PostForm';
import PostBox from 'components/posts/PostBox';
import { collection, query, where, onSnapshot, orderBy, doc } from "firebase/firestore";
import AuthContext from 'context/AuthContext';
import { db } from 'firebaseApp';
import useTranslation from 'hooks/useTranslation';


export interface PostProps{
    id: string;
    email:string;
    content: string;
    createdAt: string;
    uid: string;
    profileUrl?: string;
    likes?: string[];
    likeCount?: number;
    comments?: any;
    hashTags?: string[];
    imageUrl?: string;
}

interface UserProps{
    id:string;
}

type tabType = "all" | "following";

export default function HomePage() {
    const [posts, setPosts]=useState<PostProps[]>([]);
    const [activeTab, setActiveTab]=useState<tabType>("all");
    const [followingPosts, setFollowingPosts]=useState<PostProps[]>([]);
    const [followingIds, setFollowingIds]=useState<string[]>([""]);
    const {user}=useContext(AuthContext);
    const translate = useTranslation();
    

    //Fetch the array of user's following IDs through real-time synchronization
    const getFollowingIds = useCallback(async() => {
        if(user?.uid){
            const ref = doc(db, "following", user?.uid);
            onSnapshot(ref, (doc)=>{
                setFollowingIds([""]);
                doc
                ?.data()
                ?.users?.map((user:UserProps) => 
                    setFollowingIds((prev:string[]) => (prev ? [...prev, user?.id] : []) ));
            });
        }
    },[user?.uid]);

    useEffect( () => {
        if (user) {
            let postsRef = collection(db, "posts");
            let postsQuery = query(postsRef, orderBy("createdAt", "desc"));
            let followingQuery = query(
                postsRef, 
                where("uid", "in", followingIds), 
                orderBy("createdAt", "desc")
            );

            onSnapshot(postsQuery, (snapShot) => {
                let dataObj = snapShot.docs.map((doc)=>({
                    ...doc.data(),
                    id:doc?.id,
                }))
                setPosts(dataObj as PostProps[]);
            });

            onSnapshot(followingQuery, (snapShot) => {
                let dataObj = snapShot.docs.map((doc)=>({
                    ...doc.data(),
                    id:doc?.id,
                }))
                setFollowingPosts(dataObj as PostProps[]);
            });
        }
    },[followingIds, user]);
    
    useEffect( () => {
        if(user?.uid) getFollowingIds();
    },[getFollowingIds, user?.uid]);

    return(
        <div className="home">
            <div className="home__top">
                <div className="home__title">{translate("MENU_HOME")}</div>
                <div className="home__tabs">
                    <div 
                        className={`home__tab ${
                            activeTab === "all" && "home__tab--active"
                        }`}
                        onClick={()=>{setActiveTab("all")}}
                    >
                        {translate("TAB_ALL")}
                    </div>
                    <div 
                        className={`home__tab ${
                            activeTab === "following" && "home__tab--active"
                        }`} 
                        onClick={()=>{setActiveTab("following")}}
                    >
                        {translate("TAB_FOLLOWING")}
                    </div>
                </div>
            </div>
            
            <PostForm/>
            {activeTab === "all" && (
                <div className="post">
                    { posts?.length > 0 ? posts.map( (post)=>(
                        <PostBox post={post} key={post.id}/>
                    )) : <div className="post__no-posts">
                            <div className="post__text">{translate("NO_POSTS")}</div>
                        </div>
                    }
                </div>
            )}

            {activeTab === "following" && (
                <div className="post">
                    { followingPosts?.length > 0 ? followingPosts.map( (post)=>(
                        <PostBox post={post} key={post.id}/>
                    )) : <div className="post__no-posts">
                            <div className="post__text">{translate("NO_POSTS")}</div>
                        </div>
                    }
                </div>
            )}      
            
            
        </div>
    );
};
