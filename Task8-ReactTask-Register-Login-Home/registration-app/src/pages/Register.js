import { useState } from "react";

import APTextBox from "../components/APTextBox";
import APEyePassword from "../components/APEyePassword";
import APButton from "../components/APButton";
import APAlert from "../components/APAlert";
// its better then navigate for the reusability 
export default function Register({goHome}){
// states 

const [fname,setFname] = useState("");

const [lname,setLname] = useState("");

const [email,setEmail] = useState("");

const [phone,setPhone] = useState("");

const [password,setPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");


const [showAlert,setShowAlert] = useState(false);
// handlers
function register(){


if(
    !fname ||
    !lname ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
){

    setPasswordError("Please fill all fields");

    return;

}
if(password !== confirmPassword){

    setPasswordError("Password does not match");

    return;

}

    const userData = {

        fname,
        lname,
        email,
        phone,
        password

    };


    localStorage.setItem(
        "user",
        JSON.stringify(userData)
    );
setPasswordError("");

setShowAlert(true);
}

return (

        <div className="register-container">


            <h1>
                Register
            </h1>



            <APTextBox

                type="text"

                placeholder="First Name"

                value={fname}

                onChange={
                    (e)=>setFname(e.target.value)
                }

            />



            <APTextBox

                type="text"

                placeholder="Last Name"

                value={lname}

                onChange={
                    (e)=>setLname(e.target.value)
                }

            />



            <APTextBox

                type="email"

                placeholder="Email"

                value={email}

                onChange={
                    (e)=>setEmail(e.target.value)
                }

            />



            <APTextBox

                type="number"

                placeholder="Phone Number"

                value={phone}

                onChange={
                    (e)=>setPhone(e.target.value)
                }

            />



            <APEyePassword

                placeholder="Password"

                value={password}

                onChange={
                    (e)=>setPassword(e.target.value)
                }

            />



            <APEyePassword

                placeholder="Confirm Password"

                value={confirmPassword}

                onChange={
                    (e)=>setConfirmPassword(e.target.value)
                }

            />



            {
                passwordError &&

                <p className="error-text">

                    {passwordError}

                </p>

            }



            <APButton

                text="Sign Up"

                onClick={register}

            />




            {
                showAlert &&

                <APAlert

                    image="https://cdn-icons-png.flaticon.com/512/845/845646.png"

                    text="Successfully Registered"

                   buttons={[
                  {
                     text:"OK",
                     action:goHome
                         }
                        ]}

                />

            }



        </div>

    )
}

