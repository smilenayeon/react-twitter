import AuthContext from "context/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "firebaseApp";
import { PostProps } from "pages/home";
import { useContext } from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ref, deleteObject } from "firebase/storage";


interface PostBoxProps{
    post:PostProps;
}
export default function PostBox({ post }:PostBoxProps) {
    const {user} = useContext(AuthContext);
    const navigate = useNavigate();
    const imageRef = ref(storage, post?.imageUrl);
    
    
     const handleDelete = async() => {
        const confirm = window.confirm("Do you want to delete the post?")
        if (confirm) {
            //first delete the image from the storage
            
            if(post?.imageUrl){
                deleteObject(imageRef).catch((error)=>{console.log(error)})
            }

            await deleteDoc(doc(db, "posts",post.id));
            toast.success("Successfully deleted.");
            navigate("/");

        }
     };
     
     
     return(
        <div className="post__box" key={post?.id}>
                        <Link to={`/posts/${post.id}`}>
                            <div className="post__box-profile">
                                <div className="post__flex">
                                    {post?.profileUrl ? (
                                        <img src={post?.profileUrl} alt="profile" className="post__box-profile-img" />
                                    ) : (
                                        <FaUserCircle className="post__box-profile-icon"/>
                                    )}
                                    <div className="post__email"> {post?.email} </div>
                                    <div className="post__createdAt"> {post?.createdAt} </div>
                                </div>
                                <div className="post__box-content"> {post?.content} </div>
                                {post?.imageUrl && (
                                    <div className="post__image-div">
                                        <img 
                                        src  ={post?.imageUrl} 
                                        alt="post img"
                                        className="post__image"
                                        width={100}
                                        height={100}
                                        />
                                    </div>
                                )}
                                <div className="post-form__hashtags-outputs">
                                    {post?.hashTags?.map((tag, index)=>(
                                        <span className="post-form__hashtags-tag" key={index}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                        <div className="post__box-footer">
                            { post?.uid === user?.uid && (
                                 <>
                                 <button 
                                     type="button" 
                                     className="post__delete" 
                                     onClick={handleDelete}
                                 >
                                     Delete
                                 </button>
                                 <button 
                                     type="button" 
                                     className="post__edit" 
                                 >
                                     <Link to={`/posts/edit/${post?.id}`}>Edit</Link>
                                 </button>
                             </>
                            )}
                           
                            <button 
                                type="button" 
                                className="post__likes" 
                            >
                                <AiFillHeart/>
                                {post?.likeCount || 0}
                            </button>
                            <button 
                                type="button" 
                                className="post_comments" 
                            >
                                <FaRegComment/>
                                {post?.comments?.length || 0}
                            </button>
                        </div>
                    </div>
    )
};
