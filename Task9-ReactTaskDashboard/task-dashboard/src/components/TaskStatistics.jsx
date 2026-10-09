import "../Style/Component.css";


function TaskStatistics({ tasks }) {


    const total = tasks.length;


    const pending = tasks.filter(
        task => task.status === "Pending"
    ).length;



    const inProgress = tasks.filter(
        task => task.status === "In Progress"
    ).length;



    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;




    return (

        <div className="statistics">


            <div className="stat-card total">

                <div className="stat-line"></div>

                <div>
                    <h4>
                        Total Tasks
                    </h4>

                    <span>
                        {total}
                    </span>
                </div>

            </div>




            <div className="stat-card pending">

                <div className="stat-line"></div>

                <div>
                    <h4>
                        Pending
                    </h4>

                    <span>
                        {pending}
                    </span>
                </div>

            </div>





            <div className="stat-card progress">

                <div className="stat-line"></div>

                <div>
                    <h4>
                        In Progress
                    </h4>

                    <span>
                        {inProgress}
                    </span>
                </div>

            </div>





            <div className="stat-card completed">

                <div className="stat-line"></div>

                <div>
                    <h4>
                        Completed
                    </h4>

                    <span>
                        {completed}
                    </span>
                </div>

            </div>



        </div>

    )
}


export default TaskStatistics;