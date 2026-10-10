import TaskItem from "./TaskItem";
import "../Style/Component.css";


function TaskList({ tasks, deleteTask, toggleStatus, editTask }) {


    return (

        <div className="task-list">


            {
                tasks.map((task) => (
                    <TaskItem
                        key={task.id}

                        task={task}

                        deleteTask={deleteTask}

                        toggleStatus={toggleStatus}

                        editTask={editTask}

                    />

                ))
            }


        </div>

    )

}


export default TaskList;