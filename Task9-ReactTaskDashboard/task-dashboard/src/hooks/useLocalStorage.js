import { useState, useEffect } from "react";


function useLocalStorage(key, initialValue) {


  const [value, setValue] = useState(() => {


    try {

      const item = localStorage.getItem(key);


      return item 
        ? JSON.parse(item)
        : initialValue;


    } catch (error) {

      return error instanceof SyntaxError
        ? initialValue
        : initialValue;

    }


  });



  useEffect(() => {


    localStorage.setItem(
      key,
      JSON.stringify(value)
    );


  }, [key, value]);



  return [value, setValue];


}


export default useLocalStorage;