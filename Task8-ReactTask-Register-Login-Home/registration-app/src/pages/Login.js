import {useState} from "react";

import APTextBox from "../components/APTextBox";
import APEyePassword from "../components/APEyePassword";
import APButton from "../components/APButton";


export default function Login({goHome}){


const [email,setEmail]=useState("");

const [password,setPassword]=useState("");

const [error,setError]=useState("");



function login(){


const user = JSON.parse(
localStorage.getItem("user")
);



if(
user &&
user.email === email &&
user.password === password
){


setError("");

goHome();


}
else{


setError(
"Email or password incorrect"
);


}



}



return (

<div className="login-container">


<h1>
Login
</h1>


<APTextBox

type="email"

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>



<APEyePassword

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



{
error &&

<p className="error-text">
{error}
</p>

}



<APButton

text="Login"

onClick={login}

/>


</div>

)

}

