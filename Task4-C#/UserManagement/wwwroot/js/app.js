const apiUrl = "/api/users";



async function loadUsers() {

    try {

        const response = await fetch(apiUrl);


        const users = await response.json();


        const table =
            document.getElementById("usersTable");


        table.innerHTML = "";


        users.forEach(user => {


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${user.id}</td>

                <td>${user.firstName}</td>

                <td>${user.lastName}</td>

                <td>${new Date(user.birthDate).toLocaleDateString()}</td>

                <td>${user.email}</td>

                <td>${user.gender}</td>


                <td>

                    <button 
                    onclick="deleteUser(${user.id}, this)">
                    Delete
                    </button>


                    <span class="timer"></span>

                </td>

            `;


            table.appendChild(row);


        });


    }
    catch (error) {

        console.log(error);

    }

}






function deleteUser(id, button) {


    let seconds = 30;


    button.disabled = true;


    const timer =
        button.nextElementSibling;



    timer.innerHTML =
        seconds + " sec";



    const interval =
        setInterval(async () => {


            seconds--;


            timer.innerHTML =
                seconds + " sec";



            if (seconds <= 0) {


                clearInterval(interval);



                await fetch(
                    `${apiUrl}/${id}`,
                    {
                        method: "DELETE"
                    }
                );



                loadUsers();

            }



        }, 1000);


}




// Start

loadUsers();