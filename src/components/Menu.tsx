import { useNavigate } from "react-router-dom";
import {BsHouse} from 'react-icons/bs';
import {BiUserCircle} from'react-icons/bi';
import {MdLogout, MdLogin} from 'react-icons/md';
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import {getAuth, signOut} from "firebase/auth";
import { app } from "firebaseApp";
import { toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import useTranslation from "hooks/useTranslation";
import { IoMdNotificationsOutline } from "react-icons/io";

export default function MenuList() {
    const navigate = useNavigate();
    const {user} = useContext(AuthContext);
    const translate = useTranslation();

    return(
        <div className="footer">
            <div className="footer__grid">
                <button type="button" onClick={ () => navigate("/")}>
                    <BsHouse/>
                    {translate("MENU_HOME")}
                </button>
                <button type="button"onClick={ () => navigate("/profile")}>
                    <BiUserCircle/>
                    {translate("MENU_PROFILE")}
                </button>
                <button type="button"onClick={ () => navigate("/search")}>
                    <AiOutlineSearch/>
                    {translate("MENU_SEARCH")}
                </button>
                <button type="button"onClick={ () => navigate("/notification")}>
                    <IoMdNotificationsOutline/>
                    {translate("MENU_NOTI")}
                </button>
                {user === null ? (
                    <button type="button"onClick={() => navigate("/users/login")}>
                    <MdLogin/>
                    {translate("MENU_LOGIN")}
                </button>
                ) : (
                    <button type="button"onClick={ async() => {
                        const auth = getAuth(app);
                        await signOut(auth);
                        toast.success(translate("MESSAGE_LOGOUT_SUCCESS"));
                        
                    }}>
                        <MdLogout/>
                        {translate("MENU_LOGOUT")}
                    </button>
                )}
                
            </div>
        </div>
    );
};
