import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,  
    GithubAuthProvider 
} from "firebase/auth";
import { app } from "firebaseApp";
import { toast } from "react-toastify";

export default function SignupForm() {
    const[error, setError]=useState<string>("");
    const[email, setEmail]=useState<string>("");
    const[password, setPassword]=useState<string>("");
    const[passwordConfirmation, setPasswordConfirmation]=useState<string>("");
    const navigate = useNavigate();
    
    const onSubmit = async(e:any) => {
        e.preventDefault();
        try {
            const auth = getAuth(app);
            await createUserWithEmailAndPassword(auth, email, password);
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
            }else if (value !== passwordConfirmation){
                setError("Password should match password confirmation.");
            }else{
                setError("");
            }
        }

        if(name === "password_confirmation"){
            setPasswordConfirmation(value);
            if(value?.length < 8) {
                setError("Password should be 8 characters or more.");
            }else if (value !== password) {
                setError("Password Confirmation should match with the password.");
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
            <div className="form__title">Signup</div>
            <div className="form__block">
                <label htmlFor="email">Email</label>
                <input 
                    type="text" 
                    name="email" 
                    id="email" 
                    value={email} 
                    required 
                    onChange={onChange}
                    />
            </div>
            <div className="form__block">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" value={password} required onChange={onChange}/>
            </div>
            <div className="form__block">
                <label htmlFor="password_confirmation">Password Confirmation</label>
                <input 
                    type="password" 
                    name="password_confirmation" 
                    id="password_confirmation" 
                    value={passwordConfirmation} 
                    required 
                    onChange={onChange}
                />
            </div>
            {error && error?.length > 0 && (
                 <div className="form__block">
                 <div className="form__error">{error}</div>
             </div>
            )}
           
            <div className="form__block">
                Do you aleady have an account?
                <Link to="/users/login" className="form__link">
                    Login
                </Link>
            </div>
            <div className="form__block--lg">
                <button 
                    type="submit" 
                    className="form__btn--submit" 
                    disabled={error?.length > 0 }
                    >
                    Sign Up
                </button>
            </div>
            <div className="form__block">
                <button 
                    type="button" 
                    name="google" 
                    className="form__btn--google" 
                    onClick={onClickSocialLogin}
                >
                    Sign up with Google Account
                </button>
                <button 
                    type="button" 
                    name="github" 
                    className="form__btn--github" 
                    onClick={onClickSocialLogin}
                >
                    Sign up with Github Account
                </button>
            </div>
        </form>
    );
};
