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

export default function LoginForm() {
    const[error, setError]=useState<string>("");
    const[email, setEmail]=useState<string>("");
    const[password, setPassword]=useState<string>("");
    const navigate = useNavigate();
    
    const onSubmit = async(e:any) => {
        e.preventDefault();
        try {
            const auth = getAuth(app);
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
            toast.success("Successfully signed up.");

            
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
                setError("Incorrect Email format.")
            }else {
                setError("");
            }
        }

        if(name === "password"){
            setPassword(value);

            if(value?.length < 8) {
                setError("Password should be longer than 8 characters.");
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
            toast.success("Successfully logged in.");
        })
        .catch((error) => {
            console.log(error);
            const errorMessage = error?.message;
            toast.error(errorMessage);
        });
    };

    return(
        <form className="form form__lg" onSubmit={onSubmit}>
            <div className="form__title">Login</div>
            <div className="form__block">
                <label htmlFor="email">Email</label>
                <input type="text" name="email" id="email" value={email} required onChange={onChange}/>
            </div>
            <div className="form__block">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" value={password} required onChange={onChange}/>
            </div>
            {error && error.length > 0 && (
                 <div className="form__block">
                 <div className="form__error">{error}</div>
             </div>
            )}
           
            <div className="form__block">
                Do you not have an account?
                <Link to="/users/signup" className="form__link">Signup</Link>
            </div>
            <div className="form__block--lg">
                <button 
                    type="submit" 
                    className="form__btn--submit" 
                    disabled={error?.length > 0 }
                >
                    Log In
                </button>
            </div>
            <div className="form__block">
                <button 
                    type="button" 
                    name="google" 
                    className="form__btn--google" 
                    onClick={onClickSocialLogin}
                >
                    Log in with Google Account
                </button>
            </div>
            <div className="form__block">
                <button 
                    type="button" 
                    name="github" 
                    className="form__btn--github" 
                    onClick={onClickSocialLogin}
                >
                    Log in with Github Account
                </button>
            </div>
        </form>
    );
};
