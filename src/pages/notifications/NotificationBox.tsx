import { useNavigate } from "react-router-dom";
import { NotificationProps } from ".";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import useTranslation from "hooks/useTranslation";

import styles from "./Notification.module.scss";

export default function NotificationBox({notification}:{notification:NotificationProps}) {
    const navigate = useNavigate();
    const translate = useTranslation();

    const onClickNotification = async (url:string) => {
        //update isRead
        const ref=doc(db, "notifications", notification.id);
        await updateDoc(ref, {
            isRead:true,
        })
        //move to the url
        navigate(url);
    };

    return(
        <div key={notification.id} className={styles.notification}>
            <div onClick={() => onClickNotification(notification?.url) }>
                <div className={styles.notification__flex}>
                    <div className={styles.notification__createdAt}>
                        {notification?.createdAt}
                    </div>
                    {notification?.isRead === false && <div className={styles.notification__unread}/> }
                </div>
                <div className="notification__content">
                    {notification?.content} {(notification?.url?.length > 1) ? ( translate("NOTIFICATION_NEW_COMMENT")) : ( translate("NOTIFICATION_NEW_FOLLOW"))}
                </div>
            </div>
        </div>
    );
};
