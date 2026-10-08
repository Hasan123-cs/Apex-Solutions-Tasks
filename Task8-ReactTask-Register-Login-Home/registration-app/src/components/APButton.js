function APButton({
    text,
    onClick,
    type="button"
}) {


    return (

        <button

            className="ap-button"

            type={type}

            onClick={onClick}

        >

            {text}

        </button>

    )

}


export default APButton;