import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    signInWithPopup, 
    GoogleAuthProvider,  
    GithubAuthProvider 
} from "firebase/auth";
import { app } from "firebaseApp";
import { toast } from "react-toastify";
import useTranslation from "hooks/useTranslation";

export default function LoginForm() {
    const[error, setError]=useState<string>("");
    const[email, setEmail]=useState<string>("");
    const[password, setPassword]=useState<string>("");
    const navigate = useNavigate();
    const translate = useTranslation(); 

    const onSubmit = async(e:any) => {
        e.preventDefault();
        try {
            const auth = getAuth(app);
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
            toast.success(translate("MESSAGE_SIGNUP_SUCCESS"));

            
        } catch (error:any) {
            toast.error(error?.code);
            
        }
    };
    const onChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {target:{name, value}} = e;
        if(name === "email"){
            setEmail(value);
            const validRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

            if(!value?.match(validRegex)){
                setError(translate("MESSAGE_EMAIL_ERROR"))
            }else {
                setError("");
            }
        }

        if(name === "password"){
            setPassword(value);

            if(value?.length < 8) {
                setError(translate("MESSAGE_PASSWORD_ERROR"));
            }else{
                setError("");
            }
        }
    };

    const onClickSocialLogin = async (e: any) => {
        const {
            target: { name }
        } = e;

        let provider;
        const auth = getAuth(app);

        if ( name === "google") {
            provider = new GoogleAuthProvider();
        }
        if ( name === "github") {
            provider= new GithubAuthProvider();
        }

        await signInWithPopup(
            auth, 
            provider as GithubAuthProvider | GoogleAuthProvider
        )
        .then((result) => {
            console.log(result);
            toast.success(translate("MESSAGE_LOGIN_SUCCESS"));
        })
        .catch((error) => {
            console.log(error);
            const errorMessage = error?.message;
            toast.error(errorMessage);
        });
    };

    return(
        <form className="form form__lg" onSubmit={onSubmit}>
            <div className="form__title">{translate("MENU_LOGIN")}</div>
            <div className="form__block">
                <label htmlFor="email">{translate("FORM_EMAIL")}</label>
                <input type="text" name="email" id="email" value={email} required onChange={onChange}/>
            </div>
            <div className="form__block">
                <label htmlFor="password">{translate("FORM_PASSWORD")}</label>
                <input type="password" name="password" id="password" value={password} required onChange={onChange}/>
            </div>
            {error && error.length > 0 && (
                 <div className="form__block">
                 <div className="form__error">{error}</div>
             </div>
            )}
           
            <div className="form__block">
            {translate("NO_ACCOUNT")}
                <Link to="/users/signup" className="form__link">
                    {translate("SIGNUP_LINK")}
                </Link>
            </div>
            <div className="form__block--lg">
                <button 
                    type="submit" 
                    className="form__btn--submit" 
                    disabled={error?.length > 0 }
                >
                    {translate("SIGNIN_LINK")}
                </button>
            </div>
            <div className="form__block">
                <button 
                    type="button" 
                    name="google" 
                    className="form__btn--google" 
                    onClick={onClickSocialLogin}
                >
                    {translate("LOGIN_WITH_GOOGLE")}
                </button>
            </div>
            <div className="form__block">
                <button 
                    type="button" 
                    name="github" 
                    className="form__btn--github" 
                    onClick={onClickSocialLogin}
                >
                     {translate("LOGIN_WITH_GITHUB")}
                </button>
            </div>
        </form>
    );
};
