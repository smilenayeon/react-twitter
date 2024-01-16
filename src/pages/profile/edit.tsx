import PostHeader from "components/posts/Header";
import AuthContext from "context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";
import { ref, deleteObject, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "firebaseApp";
import { updateProfile } from "firebase/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useTranslation from "hooks/useTranslation";

export default function ProfileEdit() {
    const [displayName, setDisplayName] = useState<string>("");
    const [imageUrl, setImageUrl]=useState<string | null>(null);
    const {user} = useContext(AuthContext);
    const navigate = useNavigate();
    const translate = useTranslation();
    
    const STORAGE_DOWNLOAD_URL_STRING="https://firebasestorage.googleapis.com";

    const onChange = (e:React.ChangeEvent<HTMLInputElement>)=> {
        const{target:{value}} = e;
        setDisplayName(value);
    };

    const onSubmit = async(e:any) => {
        e.preventDefault();
        let key=`${user?.uid}/${uuidv4()}`;
        let newImageUrl=null;
        const storageRef = ref(storage, key);
        try {
            //delete existing profile image only if it is from firebase storage
            if(user?.photoURL && user?.photoURL?.includes(STORAGE_DOWNLOAD_URL_STRING)){
                const imageRef = ref(storage, user?.photoURL);
                await deleteObject(imageRef).catch((error)=>{console.log(error)});
            }
            //upload a new profile image
            if(imageUrl){
                const data = await uploadString(storageRef, imageUrl, "data_url");
                newImageUrl= await getDownloadURL(data?.ref);   
            }
            //call updateProfile
            if (user){
                await updateProfile(user,{
                    displayName: displayName || "",
                    photoURL: newImageUrl || ""

                }).then(() => {
                    toast.success("Profile is successfully updated")
                    navigate("/profile");
                }).catch((error) => {
                    console.log(error);
                });
            }

        } catch (e:any) {
            console.log(e);
        }
    };

    const handleFileUpload = (e:any) => { 
        const {
            target:{files}
        } = e;
        const file = files?.[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = (e:any)=>{
            const {result} = e?.currentTarget;
            setImageUrl(result);
        };
    };
    const handleDeleteImage= (e:any)=> {
        setImageUrl(null);
    };

    useEffect(()=>{
        if(user?.photoURL) {
            setImageUrl(user?.photoURL);
        }
        if(user?.displayName) {
            setDisplayName(user?.displayName);
        }
    },[user?.photoURL, user?.displayName]);
    
    return(
        <div className="post">
            <PostHeader/>
            <form className="post-form" onSubmit={onSubmit}>
                <div className="post-form__profile">
                    <input 
                        type="text" 
                        name="displayName" 
                        className="post-form__input" 
                        placeholder="name" 
                        onChange={onChange}
                        value={displayName}
                    />
                    {imageUrl && (
                        <div className="post-form__attachment">
                            <img src={imageUrl} alt="attachment" width={100} height={100}/>
                            <button 
                                type="button" 
                                onClick={handleDeleteImage} 
                                className="post-form__clear-btn"
                            >
                                {translate("BUTTON_DELETE")}
                            </button>
                        </div>
                    )}
                </div>
                <div className="post-form__submit-area">
                    <div className="post-form__image-area">
                        <label htmlFor="file-input" className="post-form__file">
                            <FiImage className="post-form__file-icon"/>
                        </label>
                    </div>
                    <input 
                        type="file" 
                        name="file-input" 
                        id="file-input" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <input type="submit" value="Update Profile" className="post-form__submit-btn"/>
                </div>
            </form>
        </div>
    );
};