import PostBox from "components/posts/PostBox";
import AuthContext from "context/AuthContext";
import { collection, doc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "firebaseApp";
import { PostProps } from "pages/home";
import { useContext, useEffect, useState } from "react";
import useTranslation from "hooks/useTranslation";

export default function SearchPage () {
    const[posts, setPosts]=useState<PostProps[]>([]);
    const [tagQuery, setTagQuery]=useState<string>("");
    const{user}=useContext(AuthContext);
    const translate =useTranslation();

    const onChange =(e:any) => {
        setTagQuery(e?.target?.value?.trim())
    };

    useEffect(() => {
        if(user){
            let postsRef = collection(db, "posts");
            let postsQuery = query(
                postsRef, 
                where("hashTags", "array-contains-any", [tagQuery]),
                orderBy("createdAt", "desc"),
                );
            onSnapshot(postsQuery, (snapShot) => {
                let dataObj= snapShot?.docs?.map( (doc) =>({
                    ...doc?.data(),
                    id:doc?.id,
                }) );
                setPosts(dataObj as PostProps[]);
            });
        }
    },[tagQuery, user]);

     
    return(
        <div className="home">
            <div className="home__top">
                <div className="home__title">
                    <div className="home__title-text">
                        {translate("MENU_SEARCH")}
                    </div>
                </div>
                <div className="home__search-div">
                    <input className="home__search" placeholder={translate("SEARCH_HASHTAGS")} onChange={onChange}/>
                </div>
            </div>
            <div className="post">
                { posts?.length > 0 ? posts.map( (post)=>(
                    <PostBox post={post} key={post.id}/>
                )) : <div className="post__no-posts">
                        <div className="post__text"> {translate("NO_POSTS")} </div>
                    </div>
                }
            </div>
        </div>
    );
};
