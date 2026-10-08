import APButton from "./APButton";


export default function APNavbar({onLogout}) {


    return (

        <nav className="navbar">


            <h2>
                My App
            </h2>


            <APButton

                text="Logout"

                onClick={onLogout}

            />


        </nav>

    )


}

