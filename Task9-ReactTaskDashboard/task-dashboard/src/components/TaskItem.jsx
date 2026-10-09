import "../Style/Component.css";


function TaskItem({ task, deleteTask, setCompleted, editTask }) {

    return (

        <div className="task-item">


            <input
                type="checkbox"
                checked={task.status === "Completed"}
                readOnly
                onClick={() => setCompleted(task.id)}
            />


            <h3>
                {task.title}
            </h3>

            <div style={{ display: "flex", gap: "15px" }}>


                <p className={task.status.replace(" ", "-")}>
                    {task.status}
                </p>


                <button
                    className="edit-btn"
                    onClick={() => editTask(task)}
                >
                    Edit
                </button>



                <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                >
                    Delete
                </button>


            </div>

        </div>

    )

}


export default TaskItem;