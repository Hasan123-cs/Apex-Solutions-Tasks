import { useState, useMemo } from "react";

import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskStatistics from "./components/TaskStatistics";
import "./App.css";
import TaskFilter from "./components/TaskFilter";
import useLocalStorage from "./hooks/useLocalStorage";
function App() {


  const [tasks, setTasks] = useLocalStorage(
    "tasks",
    []
  );
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");


  function toggleStatus(id) {

    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
            ...task,
            status:
              task.status === "Completed"
                ? "Pending"
                : "Completed"
          }
          : task
      )
    )

  }
  function editTask(task) {

    setEditingTask(task);

  }

  function updateTask(updatedTask) {


    setTasks(
      tasks.map((task) => {

        if (task.id === updatedTask.id) {

          return updatedTask;

        }

        return task;

      })
    );


    setEditingTask(null);

  }
  const filteredTasks = useMemo(() => {


    const priorityOrder = {

      High: 1,

      Medium: 2,

      Low: 3

    };



    return tasks

      .filter((task) => {


        const matchesSearch =
          task.title
            .toLowerCase()
            .includes(search.toLowerCase());



        const matchesFilter =
          filter === "All" ||
          task.status === filter;



        return matchesSearch && matchesFilter;


      })

      .sort((a, b) => {


        return priorityOrder[a.priority] - priorityOrder[b.priority];


      });


  }, [tasks, search, filter]);

  function addTask(task) {

    setTasks([
      ...tasks,
      task
    ]);

  }



  function deleteTask(id) {

    setTasks(
      tasks.filter(
        task => task.id !== id
      )
    );

  }



  return (

    <div className="app">


      <div className="container">

        <div className="nav">
          <h1>
            Task Dashboard
          </h1>
          <small>My Dashboard</small>
        </div>

        <h2>Task Overview
        </h2>
        <br></br>
        <span style={{
          fontSize: "14px",
          color: "#555",
          marginBottom: "20px",
        }}>Track and organize your daily work
        </span>
        <br></br>
        <br></br>

        <TaskStatistics tasks={tasks} />
        <TaskFilter

          search={search}

          setSearch={setSearch}

          filter={filter}

          setFilter={setFilter}

        />
        <TaskList

          tasks={filteredTasks}

          deleteTask={deleteTask}

          editTask={editTask}

          toggleStatus={toggleStatus}

        />
        <br></br>
        <br></br>

        <div className="card">

          <TaskForm

            key={editingTask ? editingTask.id : "new"}

            addTask={addTask}

            editingTask={editingTask}

            updateTask={updateTask}

          />

        </div>


      </div>


    </div>

  )

}


export default App;