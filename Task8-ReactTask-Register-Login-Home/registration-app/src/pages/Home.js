import {useState} from "react";

import APNavbar from "../components/APNavbar";
import APAlert from "../components/APAlert";


function Home({goLogin}){


const [showLogout,setShowLogout]=useState(false);



const user = JSON.parse(
localStorage.getItem("user")
);



function logout(){

// remove it for testing the login 
// localStorage.removeItem("user");


goLogin();


}



return (

<div className="home-container">


<APNavbar

onLogout={()=>setShowLogout(true)}

/>



<h1>
Welcome {user?.fname}
</h1>



{
showLogout &&

<APAlert

image="https://cdn-icons-png.flaticon.com/512/845/845646.png"

text="Are you sure you want to logout?"

buttons={[

    {
        text:"Yes",
        action:logout
    },

    {
        text:"No",
        action:()=>setShowLogout(false)
    }

]}
/>

}



</div>

)

}


export default Home;