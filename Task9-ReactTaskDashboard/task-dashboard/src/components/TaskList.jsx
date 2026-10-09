import TaskItem from "./TaskItem";
import "../Style/Component.css";


function TaskList({ tasks, deleteTask, setTasks, editTask }) {
    function setCompleted(id) {
        setTasks(tasks.map(task => task.id === id ? { ...task, status: "Completed" } : task));
    }

    return (

        <div className="task-list">


            {
                tasks.map((task) => (
                    <TaskItem

                        task={task}

                        deleteTask={deleteTask}

                        setCompleted={setCompleted}

                        editTask={editTask}

                    />

                ))
            }


        </div>

    )

}


export default TaskList;