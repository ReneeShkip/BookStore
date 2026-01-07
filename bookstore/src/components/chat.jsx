import { useState } from "react";
import "../pages/css/chat.css";

export default function Chat() {
    const [hover, setHover] = useState("/svg/chat.svg");
    const [togle, setTogle] = useState();

    return (
        <div className="chat">
            {togle &&
                <div className="full-chat">
                    <div className="chat-style">Чат з консультантом</div>
                    <div className="message">
                        <div className="system">Вітаємо, ви можете написати своє питання, і консультант відповість вам у робочі години
                            <div style={{ textAlign: "center", marginTop: "5px" }}><b>Графік роботи:</b><br />пн-пт: 10:00-19:00<br /> сб-нд: 11:00-17:00</div>
                        </div>
                    </div>
                    <div></div>
                </div>
            }
            <button className="chat-button"
                onMouseEnter={() => setHover("/svg/chat-hover.svg")}
                onMouseLeave={() => setHover("/svg/chat.svg")}
                onClick={() => setTogle(prev => !prev)}>
                <img src={hover} alt="chat" />
            </button>
        </div>
    );
}