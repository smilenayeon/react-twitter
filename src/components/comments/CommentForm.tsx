import AuthContext from "context/AuthContext";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { PostProps } from "pages/home";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import useTranslation from "hooks/useTranslation";

export interface CommentFormProps{
    post: PostProps | null;
}

export default function CommentForm({post}: CommentFormProps) {
    const [comment, setComment]=useState<string>("");
    const {user}=useContext(AuthContext); 
    const translate = useTranslation();

    const truncate = (str:string) => {
        return (str?.length > 10) ? (str?.substring(0,10) + "...") : (str);
    }

    const onSubmit = async (e:any) => {
        e.preventDefault();

        if(post && user){
            try {
                const postRef = doc(db, "posts", post?.id);
                const commentObj = {
                    comment:comment,
                    uid: user?.uid,
                    email: user?.email,
                    createdAt: new Date()?.toLocaleDateString('en-US', {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }),
                };
                await updateDoc(postRef, {
                    comments: arrayUnion(commentObj)
                });
                //create comment notification
                if(user?.uid !== post?.id){
                   await addDoc(collection(db,"notifications"), {
                    createdAt: new Date()?.toLocaleDateString("en-US",{
                        hour:"2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        }),
                    uid: post?.uid,
                    isRead: false,
                    url: `/posts/${post?.id}`,
                    content: `${truncate(post?.content)}`
,
                }); 
                }
                

                toast.success(translate("MESSAGE_POST_SUCCESS"));
                setComment("");

            } catch (error:any) {
                console.log(error);
            }
        }

    };
    const onChange=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        const {
            target:{name, value}
        } = e;

        if(name === "comment"){
            setComment(value);

        }
        
    };

    return(
        <form className="post-form" onSubmit={onSubmit}>
            <textarea 
                className="post-form__textarea" 
                name="comment" 
                id="comment" 
                required 
                placeholder= {translate("COMMENT_PLACEHOLDER")}
                onChange={onChange}
                value={comment}
            />
            <div className="post-form__submit-area">
            <div/> {/*  post-form__submit-area has flex,justify space-between so add an empty div for style */}
                <input 
                    type="submit" 
                    value= {translate("BUTTON_COMMENT")}
                    className="post-form__submit-btn" 
                    disabled={!comment}
                />
                
            </div>
        </form>
    );
};
