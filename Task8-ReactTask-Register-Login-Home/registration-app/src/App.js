import { useState } from "react";


import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";



function App(){


const [page,setPage] = useState("register");



function goHome(){

    setPage("home");

}



function goLogin(){

    setPage("login");

}



return (


<>


{
page === "register" &&

<Register

goHome={goHome}

/>

}



{
page === "login" &&

<Login

goHome={goHome}

/>

}



{
page === "home" &&

<Home

goLogin={goLogin}

/>

}



</>


)


}


export default App;