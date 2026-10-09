import "../Style/Component.css";


function TaskFilter({ search, setSearch, filter, setFilter }) {


    return (

        <div className="task-filter">


            <input

                type="text"

                placeholder="Search tasks..."

                value={search}

                onChange={(e) => setSearch(e.target.value)}

            />




            <div className="filter-buttons">


                <button
                    className={filter === "All" ? "active" : ""}
                    onClick={() => setFilter("All")}
                >

                    All Tasks

                </button>



                <button
                    className={filter === "Pending" ? "active" : ""}
                    onClick={() => setFilter("Pending")}
                >

                    Pending

                </button>



                <button
                    className={filter === "In Progress" ? "active" : ""}
                    onClick={() => setFilter("In Progress")}
                >

                    In Progress

                </button>



                <button
                    className={filter === "Completed" ? "active" : ""}
                    onClick={() => setFilter("Completed")}
                >

                    Completed

                </button>



            </div>


        </div>

    )

}


export default TaskFilter;