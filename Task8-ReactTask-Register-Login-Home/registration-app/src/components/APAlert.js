import APButton from "./APButton";
export default function APAlert({
    image,
    text,
     buttons = []
}) {


    return (
        <div className="alert-container">
            <div className="alert-box">
                <img
                    src={image}
                    className="alert-image"
                />
                <h2>
                    {text}
                </h2>
                <div className="alert-buttons">
                    
                    
                    {
                        buttons.map((btn,index)=>(

                            <APButton

                                key={index}

                                text={btn.text}

                                onClick={btn.action}

                            />

                        ))
                    }

                </div>
            </div>
        </div>
    )
}