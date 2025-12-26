const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Add task on button click
addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText !== "") {
    addTask(taskText);
    taskInput.value = "";
  }
});

// Add task on Enter key
taskInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

function addTask(text, isCompleted = false) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;
  if (isCompleted) {
    span.classList.add("completed");
  }

  // Toggle complete
  span.addEventListener("click", () => {
    span.classList.toggle("completed");
    saveTasks();
  });

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.innerHTML = "✎";
  editBtn.title = "Edit task";
  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    li.replaceChild(input, span);
    input.focus();

    const saveBtn = document.createElement("button");
    saveBtn.innerHTML = "✓";
    saveBtn.title = "Save";
    li.replaceChild(saveBtn, editBtn);

    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        saveEdit();
      }
    });

    saveBtn.addEventListener("click", saveEdit);

    function saveEdit() {
      span.textContent = input.value.trim();
      li.replaceChild(span, input);
      li.replaceChild(editBtn, saveBtn);
      saveTasks();
    }
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
    saveTasks();
  });

  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
  saveTasks();
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const span = li.querySelector("span");
    if (span) {
      tasks.push({
        text: span.textContent.trim(),
        completed: span.classList.contains("completed")
      });
    }
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => {
    addTask(task.text, task.completed);
  });
}

loadTasks();

// === AI SUMMARY FEATURE ===
const summaryBtn = document.getElementById("summaryBtn");
const summaryOutput = document.getElementById("summaryOutput");

summaryBtn.addEventListener("click", async () => {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (tasks.length === 0) {
    summaryOutput.textContent = "📝 Add some tasks first to get a summary!";
    return;
  }

  summaryOutput.textContent = "✨ Generating AI summary...";

  const taskListText = tasks.map((t, i) =>
    `${i + 1}. ${t.text} (${t.completed ? "✓ done" : "⏳ pending"})`
  ).join("\n");

  // Check if API key is configured
  const apiKey = "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";

  if (apiKey === "YOUR_API_KEY_HERE") {
    summaryOutput.innerHTML = `
      <strong>🔑 API Key Not Configured</strong><br><br>
      To enable AI summaries:<br>
      1. Get an API key from <a href="https://platform.openai.com/api-keys" target="_blank" style="color: var(--primary)">OpenAI</a><br>
      2. Replace "YOUR_API_KEY_HERE" in app.js with your key<br><br>
      <em>Your tasks:</em><br>
      ${taskListText.split('\n').join('<br>')}
    `;
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a friendly productivity assistant." },
          { role: "user", content: `Summarize my day based on these tasks:\n${taskListText}` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;
    summaryOutput.textContent = summary;
  } catch (error) {
    console.error("Error:", error);
    summaryOutput.innerHTML = `
      <strong>⚠️ Unable to generate summary</strong><br><br>
      ${error.message}<br><br>
      <em>Your tasks:</em><br>
      ${taskListText.split('\n').join('<br>')}
    `;
  }
});
