import { FiImage } from "react-icons/fi";
import {useCallback, useContext, useEffect, useState} from 'react';
import { db, storage } from "firebaseApp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import AuthContext from "context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { PostProps } from "pages/home";
import { getDownloadURL, ref, uploadString, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import PostHeader from "./Header";
import useTranslation from "hooks/useTranslation";



export default function PostEditForm() {
    const params = useParams();
    const [post, setPost] = useState<PostProps | null >(null);
    const [content, setContent] = useState<string>("");
    const[tags, setTags] = useState<string[]>([]);
    const [hashTag, setHashTag]=useState<string>("");
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting]=useState<boolean>(false);
    const navigate = useNavigate();
    const {user} =useContext(AuthContext);
    const translate = useTranslation();

    const handleFileUpload = (e:any) => {
        const{
          target:{files}
        } = e;
       
        const file = files?.[0];
        const fileReader = new FileReader();
        fileReader?.readAsDataURL(file);
    
        fileReader.onloadend = (e:any) => {
          const {result} = e?.currentTarget;
          setImageFile(result);
        };
      };

    const getPost = useCallback(async () => {
        if (params.id) {
            const docRef = doc(db, "posts", params.id);
            const docSnap = await getDoc(docRef);
            setPost({ ...(docSnap?.data() as PostProps), id: docSnap.id });
            setContent(docSnap?.data()?.content);
            setTags(docSnap?.data()?.hashTags);
            setImageFile(docSnap?.data()?.imageUrl);
        }
    }, [params.id]); 
    
    const onSubmit = async (e:any) => {
        setIsSubmitting(true);
        const key =`${user?.uid}/${uuidv4()}`;
        const storageRef = ref( storage, key)
        e.preventDefault();
        try {
            if(post) {
                //delete the existing picture then upload the new picture
                if(post?.imageUrl){
                    let imageRef=ref(storage, post?.imageUrl);
                    await deleteObject(imageRef).catch((error)=>{console.log(error)});
                }
                //if there' new image file, upload the new image file
                let imageUrl="";
                if(imageFile){
                    const data = await uploadString(storageRef, imageFile, "data_url");
                    imageUrl = await getDownloadURL(data?.ref);
                }
                            const postRef = doc(db, "posts", post?.id);
                            await updateDoc(postRef, {
                                content: content,
                                hashTags:tags,
                                imageUrl:imageUrl,
                            });
                            navigate(`/posts/${post?.id}`);
                            toast.success(translate("MESSAGE_POST_SUCCESS"));
                        }
                        setImageFile(null);
                        setIsSubmitting(false);
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

    const onChangeHashTag = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHashTag(e?.target?.value?.trim());
      };

    const handleKeyUp = (e:any) => {
        if(e.keyCode === 32 && e.target.value.trim() !== '') {
            if(tags?.includes(e.target.value?.trim())){
                toast.error(translate("MESSAGE_EXISTING_TAG"));
            }else{
                setTags( (prev) => (prev?.length > 0 ? ([...prev, hashTag]) : ([hashTag])));
                setHashTag("");
            }
        }
    };

    const removeTag = (tag:string) => {
        setTags(tags?.filter((val)=> val !== tag));
      };

    useEffect(() => {
        if (params.id)getPost();
    }, [getPost, params.id] );

    const handleDeleteImage = () => {
        setImageFile(null);
      };


    return(
        <div className="post">
          <PostHeader/>  
        <form className="post-form" onSubmit={onSubmit}>
            <textarea 
                className="post-form__textarea"
                required
                name="content"
                id="content"
                placeholder= {translate("POST_PLACEHOLDER")}
                onChange={onChange}
                value={content}
            />
            <div className="post-form__hashtags">
            <span className="post-form__hashtags-outputs">
                {tags?.map( (tag,index)=>(
                    <span className="post-form__hashtags-tag" key={index} onClick={()=>removeTag(tag)}>
                        #{tag}
                    </span>
                ))}
            </span>
            <input 
                className="post-form__input" 
                name="hashtag" 
                id="hashtag" 
                placeholder="hashtag + spacebar"
                onChange={onChangeHashTag}
                onKeyUp={handleKeyUp}
                value={hashTag}
            />
            </div>
        <div className="post-form__submit-area">
            <label htmlFor="file-input" className="post-form__file">
                <FiImage className="post-form__file-icon" />
            </label>
            <input
                type="file"
                name="file-input"
                id="file-input"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />
            {imageFile && (
            <div className="post-form__attachment">
                <img  src={imageFile} alt="attachment" width={100} height={100}/>
                <button 
                className="post-form__clear-btn" 
                onClick={handleDeleteImage}
                type="button"
                >
                    {translate("BUTTON_DELETE")}
                </button>
            </div>
            )}
            <input 
                type="submit" 
                value={translate("BUTTON_EDIT")} 
                className="post-form__submit-btn" 
                disabled={isSubmitting}
            />
        </div>  
    </form>
    </div>
    )
};
