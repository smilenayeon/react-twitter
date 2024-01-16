import { useContext, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { FiImage } from "react-icons/fi";
import { db, storage } from "firebaseApp";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import AuthContext from "context/AuthContext";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useTranslation from "hooks/useTranslation";

export default function PostForm() {
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [hashTag, setHashTag]=useState<string>("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting]=useState<boolean>(false);
  const { user } = useContext(AuthContext);
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


  const onSubmit = async (e: any) => {
    setIsSubmitting(true);
    const key =`${user?.uid}/${uuidv4()}`;
    const storageRef = ref( storage, key)
    e.preventDefault();

    try {
      //first, upload image
      let imageUrl="";
      if(imageFile){
        const data = await uploadString(storageRef, imageFile, "data_url");
        imageUrl = await getDownloadURL(data?.ref);
      }
      //update download url of the uploaded image
      await addDoc(collection(db, "posts"), {
        content: content,
        createdAt: new Date()?.toLocaleDateString('en-US', {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        uid: user?.uid,
        email: user?.email,
        hashTags: tags,
        imageUrl:imageUrl,
      });
      setTags([]);
      setHashTag("");
      setContent("");
      toast.success(translate("MESSAGE_POST_SUCCESS"));
      setImageFile(null);
      setIsSubmitting(false);
    } catch (e: any) {
      console.log(e);
      toast.error(e?.message);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "content") {
      setContent(value);
    }
  };

  const onChangeHashTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHashTag(e?.target?.value?.trim());
  };

  const handleKeyUp = (e:any) => {
    if(e.keyCode === 32 && e.target.value.trim() !== '') {
        if(tags?.includes(e.target.value?.trim())){
            toast.error("Already existing tag.");
        }else{
            setTags( (prev) => (prev?.length > 0 ? ([...prev, hashTag]) : ([hashTag])));
            setHashTag("");
        }
    }
  };

  const removeTag = (tag:string) => {
    setTags(tags?.filter((val)=> val !== tag));
  };

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  return (
    <form className="post-form" onSubmit={onSubmit}>
      <textarea
        className="post-form__textarea"
        required
        name="content"
        id="content"
        placeholder={translate("POST_PLACEHOLDER")}
        onChange={onChange}
        value={content}
      />
      <div className="post-form__hashtags">
        <span className="post-form__hashtags-outputs">
            {tags?.map( (tag,index)=>(
                <span 
                  className="post-form__hashtags-tag" 
                  key={index} 
                  onClick={()=>removeTag(tag)}
                  >
                    #{tag}
                </span>
            ))}
        </span>
        <input 
            className="post-form__input" 
            name="hashtag" 
            id="hashtag" 
            placeholder={translate("POST_HASHTAG")}
            onChange={onChangeHashTag}
            onKeyUp={handleKeyUp}
            value={hashTag}
        />
      </div>
      <div className="post-form__submit-area">
        <div className="post-form__image-area">
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
        </div>
        <input 
          type="submit"
          value={translate("BUTTON_POST")}
          className="post-form__submit-btn"
          disabled={isSubmitting}
         />
      </div>
    </form>
  );
}