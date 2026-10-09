import { useState, useRef } from "react";
import "../Style/Component.css";


function TaskForm({ addTask, editingTask, updateTask }) {

    const [formData, setFormData] = useState({

        title: editingTask?.title || "",

        description: editingTask?.description || "",

        priority: editingTask?.priority || "Medium",

        status: editingTask?.status || "Pending"

    });


    const titleInput = useRef();



    function handleChange(e) {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    }



    function handleSubmit(e) {

        e.preventDefault();

        if (editingTask) {

            updateTask({
                ...editingTask,
                ...formData
            });


        }
        else {


            const newTask = {

                id: crypto.randomUUID(),

                ...formData,

                createdAt: new Date().toISOString()

            };


            addTask(newTask);


        }

        setFormData({
            title: "",
            description: "",
            priority: "Medium",
            status: "Pending"
        });


        titleInput.current.focus();

    }



    return (

        <form
            className="task-form"
            onSubmit={handleSubmit}
        >


            <h2>
                Add a New Task
            </h2>



            <div className="form-grid">


                <div className="form-group">

                    <label>
                        Task title
                    </label>


                    <input

                        ref={titleInput}

                        type="text"

                        name="title"

                        placeholder="Task title"

                        value={formData.title}

                        onChange={handleChange}

                    />

                </div>





                <div className="form-group">


                    <label>
                        Priority
                    </label>


                    <select

                        name="priority"

                        value={formData.priority}

                        onChange={handleChange}

                    >

                        <option value="High">
                            High
                        </option>


                        <option value="Medium">
                            Medium
                        </option>


                        <option value="Low">
                            Low
                        </option>


                    </select>


                </div>


            </div>





            <div className="form-group">


                <label>
                    Description
                </label>



                <textarea

                    name="description"

                    placeholder="Description"

                    value={formData.description}

                    onChange={handleChange}

                />


            </div>





            <div className="form-group">


                <label>
                    Status
                </label>



                <select

                    name="status"

                    value={formData.status}

                    onChange={handleChange}

                >


                    <option value="Pending">
                        Pending
                    </option>


                    <option value="In Progress">
                        In Progress
                    </option>


                    <option value="Completed">
                        Completed
                    </option>


                </select>


            </div>





            <button type="submit">

                {editingTask ? "Update Task" : "Save Task"}

            </button>



        </form>

    )

}


export default TaskForm;