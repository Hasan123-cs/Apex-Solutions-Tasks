import APButton from "./APButton";
export default function APAlert({
    image,
    text,
    yesText="Yes",
    noText,
    onYes,
    onNo
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
                    <APButton

                    text="Yes"

                    onClick={onYes}

                    />

                    {
                        noText &&

                        <APButton

                        text="No"
                                            
                        onClick={onNo}
                                            
                        />

                    }
                </div>
            </div>
        </div>
    )
}