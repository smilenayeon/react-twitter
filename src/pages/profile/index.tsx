import { languageState } from "components/comments/atom";
import PostBox from "components/posts/PostBox";
import AuthContext from "context/AuthContext";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "firebaseApp";
import { PostProps } from "pages/home";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState} from "recoil";
import useTranslation from "hooks/useTranslation";

const PROFILE_DEFAULT_URL="/logo512.png";
type TabType = 'my' | 'like';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<TabType>("my");
    const[myPosts, setMyPosts]=useState<PostProps[]>([]);
    const[likePosts, setLikePosts]=useState<PostProps[]>([]);
    const [language, setLanguage]=useRecoilState(languageState)
    const {user} = useContext(AuthContext);
    const navigate = useNavigate();
    const translate = useTranslation();

    const onClickLanguage = () => {
        setLanguage(language === "en" ? "ko" : "en");
        localStorage.setItem("language", language === "en" ? "ko" : "en");
    };

    useEffect( () => {
        if (user) {
            let postsRef = collection(db, "posts");
            const myPostsQuery = query(
                postsRef, 
                where("uid", "==", user.uid), 
                orderBy("createdAt", "desc")
            );
            const likePostsQuery = query(
                postsRef, 
                where("likes", "array-contains", user.uid), 
                orderBy("createdAt", "desc")
            );

            onSnapshot(myPostsQuery, (snapShot) => {
                let dataObj = snapShot.docs.map((doc)=>({
                    ...doc.data(),
                    id:doc?.id,
                }))
                setMyPosts(dataObj as PostProps[]);
            });

            onSnapshot(likePostsQuery, (snapShot) => {
                let dataObj = snapShot.docs.map((doc)=>({
                    ...doc.data(),
                    id:doc?.id,
                }))
                setLikePosts(dataObj as PostProps[]);
            });
        }
    },[user]);

    return(
        <div className="home">
            <div className="home__top">
                <div className="home__title"> {translate("MENU_PROFILE")}</div>
                <div className="profile">
                    <img 
                        src={user?.photoURL || PROFILE_DEFAULT_URL} 
                        alt="profile" 
                        className="profile__image"
                        width={100}
                        height={100}
                    />
                    <div className="profile__flex">
                        <button 
                            type="button" 
                            className="profile__btn" 
                            onClick={()=>{navigate("/profile/edit")}}
                        >
                            {translate("BUTTON_EDIT_PROFILE")}
                        </button>
                        <button 
                            type="button" 
                            className="profile__btn--language" 
                            onClick={onClickLanguage}
                        >
                            {language === "en" ? "Korean" : "영어"}
                        </button>
                    </div>
                </div>
                <div className="profile__text">
                    <div className="profile__name">{user?.displayName || translate("PROFILE_NAME") }</div>
                    <div className="profile__email">{user?.email}</div>
                </div>
                <div className="home__tabs">
                    <div 
                    className={`home__tab ${(activeTab === "my")&&"__tab--active"}`}
                    onClick={() => {setActiveTab("my")}}
                    >
                        {translate("TAB_MY")}
                    </div>
                    <div 
                    className={`home__tab ${(activeTab === "like")&&"__tab--active"}`}
                    onClick={() => {setActiveTab("like")}}
                    >
                        {translate("TAB_LIKES")}
                    </div>
                </div>
               
                    {activeTab === "my" && (
                        <div className="post"> 
                            {myPosts?.length > 0 ? (
                                myPosts?.map((post)=>(<PostBox post={post} key={post.id}/>))
                            ) : (
                                <div className="post__no-posts">
                                    <div className="post__text">{translate("NO_POSTS")}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "like" && (
                        <div className="post"> 
                            {likePosts?.length > 0 ? (
                                likePosts?.map((post)=>(<PostBox post={post} key={post.id}/>))
                            ) : (
                                <div className="post__no-posts">
                                    <div className="post__text">{translate("NO_POSTS")}</div>
                                </div>
                            )}
                        </div>
                    )}
                    
            </div>
        </div>
    );
};
