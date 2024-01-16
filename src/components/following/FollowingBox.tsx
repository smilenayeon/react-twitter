import AuthContext from "context/AuthContext";
import { addDoc, arrayRemove, arrayUnion, collection, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { PostProps } from "pages/home";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useTranslation from "hooks/useTranslation";


interface FollowingProps{
    post:PostProps;
}

interface UserProps {
    id: string;
  }

export default function FollowingBox({post}:FollowingProps) {
    
    const {user} = useContext(AuthContext);
    const[postFollowers, setPostFollowers]=useState<any>([]);
    const translate = useTranslation();

    const onClickFollow= async(e:any) => {
        e.preventDefault();

        try {
            if (user?.uid) {
                //create or update following collection(what accounts the user follows)
                const followingRef = doc(db, "following", user?.uid);

                await setDoc(
                    followingRef,
                    {
                        users:arrayUnion({id: post?.uid}),
                    },
                    { merge:true }
                    );
                //create or update follow collection(what accounts follow the user)
                const followerRef = doc(db, "follower", post?.uid);

                await setDoc(
                    followerRef,
                    { users:arrayUnion({id: user?.uid}) },
                    { merge:true }
                );
                
                //create notification for new follow
                await addDoc(collection(db, "notifications"), {
                    createdAt: new Date()?.toLocaleDateString("en-US", {
                        hour:"2-digit",
                        minute: "2-digit",
                        second:"2-digit",
                    }),
                    content: `${user?.displayName || user?.email}`,
                    url:"#",
                    isRead:false,
                    uid:post?.uid,
                });


                toast.success(translate("MESSAGE_FOLLOW_SUCCESS"));
            }
        } catch (error:any) {
            console.log(error);
            
        }
    };

    const onClickCancelFollow = async(e:any) => {
        e.preventDefault();
        try {
            if(user?.uid){
                const followingRef = doc(db, "following",user?.uid);
                await updateDoc(followingRef, {
                    users: arrayRemove({id:post?.uid}),
                });

                const followerRef = doc(db, "follower", post?.uid);
                await updateDoc(followerRef, {
                    users: arrayRemove({id: user.uid}),
                });

                toast.success(translate("MESSAGE_UNFOLLOW_SUCCESS"));
            }
        } catch (error:any) {
            console.log(error);
            
        }
    };

    const getFollowers = useCallback( () => {
        if (post.uid) {
          const ref = doc(db, "follower", post.uid);
          onSnapshot(ref, (doc) => {
            setPostFollowers([]);
            doc
              ?.data()
              ?.users?.map((user: UserProps) =>
                setPostFollowers((prev: UserProps[]) =>
                  prev ? [...prev, user?.id] : []
                )
              );
          });
        }
      }, [post.uid]);

    useEffect(() => {
        if (post.uid) getFollowers();
    },[getFollowers, post.uid]);
    
    return(
        <>
            {user?.uid !== post.uid && 
            (postFollowers?.includes(user?.uid) ? (
                <button 
                    type="button" 
                    className="post__following-btn" 
                    onClick={onClickCancelFollow}
                >
                    {translate("BUTTON_FOLLOWING")}
                </button>
            ) : (
                <button 
                    type="button" 
                    className="post__follow-btn" 
                    onClick={onClickFollow}
                >
                    {translate("BUTTON_FOLLOW")}
                </button>
            ))}
        </>
    );
};
