let baseUrl = "http://dev.thanqminh.com:3000/";
var user = null;
var selectedTasklist;
var selectedTask;
var taskListHash = {};
var taskHash = {};
var selectedUser;

// TASK LISTS
const onSelectTaskList = async function (event) {
  selectedTasklist = event.target.value;
  updateListname.value = taskListHash[selectedTasklist].name;
  refreshTasks();
};

const fetchTasklist = async () => {
  createListName.value = "";

  let form = document.getElementById("tasklistForm");
  form.innerHTML = "";
  if (user) {
    const taskListRequest = await fetch(`${baseUrl}/task_lists`, {
      headers: {
        ...user,
      },
    });
    const taskLists = await taskListRequest.json();

    for (let list of taskLists) {
      taskListHash[list.id] = list;

      let formCheck = document.createElement("div");
      formCheck.setAttribute("class", "form-check");

      let input = document.createElement("input");
      input.name = "selectedTasklist";
      input.value = list.id;
      input.id = `tasklist_${list.id}`;
      input.type = "radio";
      input.oninput = onSelectTaskList;
      input.setAttribute("class", "form-check-input");
      formCheck.appendChild(input);

      let label = document.createElement("label");
      label.setAttribute("for", list.id);
      label.innerHTML = `${list.name}`;
      label.setAttribute("class", "form-check-label");
      formCheck.appendChild(label);

      form.appendChild(formCheck);
    }
    if (selectedTasklist)
      document.getElementById(`tasklist_${selectedTasklist}`).checked = true;
  } else {
    ul.innerHTML = "Please Login to continue";
  }
};

const createTaskList = async () => {
  const name = document.getElementById("createListName").value;
  const createListRequest = await fetch(`${baseUrl}/task_lists`, {
    method: "POST",
    headers: {
      ...user,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
    }),
  });
  fetchTasklist();
};

const updateTaskList = async () => {
  if (selectedTasklist) {
    const name = document.getElementById("updateListname").value;
    const updateListRequest = await fetch(
      `${baseUrl}/task_lists/${selectedTasklist}`,
      {
        method: "PUT",
        headers: {
          ...user,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
        }),
      }
    );

    if (updateListRequest.ok) {
      titleDiary.innerHTML = name;
      fetchTasklist();
    } else {
      alert("Update failed.Please choose a task.");
    }
  } else {
    alert("Please choose a task to update~");
  }
};

const deleteTaskList = async () => {
  if (selectedTasklist) {
    if (confirm("Are you sure to delete the selected task!")) {
      const deleteListRequest = await fetch(
        `${baseUrl}/task_lists/${selectedTasklist}`,
        {
          method: "DELETE",
          headers: {
            ...user,
          },
        }
      );

      if (deleteListRequest.ok) {
        updateListname.value = "";
        tasks.innerHTML = "";

        updateTaskname.value = "";
        updateTaskDescription.value = "";

        titleDiary.innerHTML = "Title task";
        fetchTasklist();
      } else {
        alert("Delete failed");
      }
    }
  } else {
    alert("Please select a task to delete.");
  }
};

// Subtasks
const onSelectTask = async function (event) {
  selectedTask = event.target.value;
  updateTaskname.value = taskHash[selectedTask].name;
  updateTaskDescription.value = taskHash[selectedTask].description;
};

const refreshTasks = async () => {
  createTaskname.value = "";
  createTaskDescription.value = "";

  if (selectedTasklist) {
    const taskRequest = await fetch(
      `${baseUrl}/task_lists/${selectedTasklist}/todos`,
      {
        headers: {
          ...user,
        },
      }
    );
    const tasks = await taskRequest.json();
    console.log(tasks);

    const titleDiary = document.getElementById("titleDiary");
    titleDiary.innerHTML = taskListHash[selectedTasklist].name;

    const form = document.getElementById("tasks");
    form.innerHTML = "";
    for (let task of tasks) {
      taskHash[task.id] = task;

      let formCheck = document.createElement("div");
      formCheck.setAttribute("class", "form-check");

      let input = document.createElement("input");
      input.setAttribute("class", "form-check-input btn-check");
      input.name = "selectedTask options-outlined";
      input.value = task.id;
      input.id = `task_${task.id}`;
      input.type = "radio";
      input.oninput = onSelectTask;
      formCheck.appendChild(input);

      let label = document.createElement("label");
      label.setAttribute("class", "form-check-label btn btn-outline-secondary");
      label.setAttribute("for", input.id);
      label.innerHTML = `${task.name}`;
      formCheck.appendChild(label);

      let p = document.createElement("p");
      p.innerHTML = `${task.description ?? ""}`;
      label.appendChild(p);

      form.appendChild(formCheck);
    }
  }
};

const createTask = async () => {
  const name = document.getElementById("createTaskname").value;
  const description = document.getElementById("createTaskDescription").value;
  const createTaskRequest = await fetch(
    `${baseUrl}task_lists/${selectedTasklist}/todos`,
    {
      method: "POST",
      headers: {
        ...user,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    }
  );
  fetchTasklist();
  refreshTasks();
};

const updateTask = async () => {
  if (selectedTask) {
    const name = document.getElementById("updateTaskname").value;
    const description = document.getElementById("updateTaskDescription").value;
    const createTaskRequest = await fetch(
      `${baseUrl}task_lists/${selectedTasklist}/todos/${selectedTask}`,
      {
        method: "PUT",
        headers: {
          ...user,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: description,
        }),
      }
    );

    if (createTaskRequest.ok) {
      refreshTasks();
    } else {
      alert("Update failed.Please choose a task.");
    }
  } else {
    alert("Please choose a task to update~");
  }
};

const deleteTask = async () => {
  if (selectedTask) {
    if (confirm("Are you sure you want to delete the selected task?")) {
      const deleteTaskRequest = await fetch(
        `${baseUrl}task_lists/${selectedTasklist}/todos/${selectedTask}`,
        {
          method: "DELETE",
          headers: {
            ...user,
          },
        }
      );

      if (deleteTaskRequest.ok) {
        updateTaskname.value = "";
        updateTaskDescription.value = "";
        refreshTasks();
      } else {
        alert("Delete failed");
      }
    }
  } else {
    alert("Please select a subtask to delete.");
  }
};

function onLoadInit() {
  if (user == null) {
    try {
      user = JSON.parse(localStorage.getItem("user"));
      document.getElementById("currentUser").innerHTML = user.uid;
      fetchTasklist();
    } catch {}
  }
}

// SHARE
// const fetchUsers = async () => {
//   const fetchUserRequest = await fetch(`${baseUrl}/users`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...user,
//     },
//   });
//   const users = await fetchUserRequest.json();
//   const form = document.getElementById("users");
//   form.innerHTML = "";

//   for (let u of users) {
//     let formCheck = document.createElement("div");
//     formCheck.setAttribute("class", "form-check");

//     let input = document.createElement("input");
//     input.name = "selectedUser";
//     input.value = u.id;
//     input.id = `user_${u.id}`;
//     input.type = "radio";
//     input.oninput = onSelectUser;
//     input.setAttribute("class", "form-check-input");
//     formCheck.appendChild(input);

//     let label = document.createElement("label");
//     label.setAttribute("for", u.id);
//     label.innerHTML = u.email;
//     label.setAttribute("class", "form-check-label");
//     formCheck.appendChild(label);

//     form.appendChild(formCheck);
//   }
// };

// const onSelectUser = async function (event) {
//   selectedUser = event.target.value;
// };

// const shareTask = async () => {
//   const createListRequest = await fetch(
//     `${baseUrl}/task_lists/${selectedTasklist}/share`,
//     {
//       method: "POST",
//       headers: {
//         ...user,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user_id: selectedUser,
//         task_list_id: selectedTasklist,
//         is_write: true,
//       }),
//     }
//   );

//   if (createListRequest.ok) {
//     alert("Shared successfully");
//   } else {
//     alert("Cannot share");
//   }
// };
