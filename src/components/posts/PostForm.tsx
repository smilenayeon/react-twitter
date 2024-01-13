import { FiImage } from "react-icons/fi";
import {useContext, useState} from 'react';
import { getAuth } from "firebase/auth";
import { app, db } from "firebaseApp";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import AuthContext from "context/AuthContext";


export default function PostForm() {
    const handleFileUpload = () => {};
    const [content, setContent] = useState<string>("");
    const {user} = useContext(AuthContext);
    
    const onSubmit = async (e:any) => {
        e.preventDefault();
       
        try {
            await addDoc(collection(db, "posts"), {
              content: content,
              createdAt: new Date().toDateString(),
              email:user?.email,
              uid:user?.uid,
            });
            setContent("");
            toast.success("Successfully posted.");
          } catch (e:any) {
            console.error("Error adding document: ", e);
          }

    };
    const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
        const {target:{name, value}} = e;

        if(name === "content"){
            setContent(value);
        }
    };

    return(
        <form className="post-form" onSubmit={onSubmit}>
        <textarea 
            className="post-form__textarea"
            required
            name="content"
            id="content"
            placeholder="What is happeing?"
            onChange={onChange}
            value={content}
        />
        <div className="post-form__submit-area">
            <label htmlFor="file-input" className="post-form__file">
                <FiImage className="post-form__file-icon"/>
            </label>
            <input 
                type="file" 
                name="file-input" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden"
            />
            <input type="submit" value="Tweet" className="post-form__submit-btn"/>
        </div>  
    </form>
    )
};
