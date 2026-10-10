import "../Style/Component.css";


function TaskItem({ task, deleteTask, toggleStatus, editTask }) {
    return (

        <div className="task-item">


            <input

                type="checkbox"

                checked={task.status === "Completed"}

                onChange={() => toggleStatus(task.id)}
            />


            <h3>
                {task.title}
            </h3>
            <p>
                {task.description}
            </p>

            <span>
                Priority: {task.priority}
            </span>

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