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

  // Completion checkbox
  const checkbox = document.createElement("button");
  checkbox.className = "checkbox";
  checkbox.innerHTML = isCompleted ? "✓" : "";
  checkbox.title = "Mark as complete";
  if (isCompleted) {
    checkbox.classList.add("checked");
  }

  const span = document.createElement("span");
  span.textContent = text;
  if (isCompleted) {
    span.classList.add("completed");
  }

  // Toggle complete on checkbox click
  checkbox.addEventListener("click", () => {
    span.classList.toggle("completed");
    checkbox.classList.toggle("checked");
    checkbox.innerHTML = checkbox.classList.contains("checked") ? "✓" : "";
    saveTasks();
  });

  // Toggle complete on text click (keep original behavior)
  span.addEventListener("click", () => {
    span.classList.toggle("completed");
    checkbox.classList.toggle("checked");
    checkbox.innerHTML = checkbox.classList.contains("checked") ? "✓" : "";
    saveTasks();
  });

  // Edit button with better icon
  const editBtn = document.createElement("button");
  editBtn.innerHTML = "✎";
  editBtn.className = "edit-btn";
  editBtn.title = "Edit task";
  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    li.replaceChild(input, span);
    input.focus();

    const saveBtn = document.createElement("button");
    saveBtn.innerHTML = "✓";
    saveBtn.className = "save-btn";
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

  // Delete button with trash icon
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "🗑";
  deleteBtn.className = "delete-btn";
  deleteBtn.title = "Delete task";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    li.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => {
      li.remove();
      saveTasks();
    }, 300);
  });

  li.appendChild(checkbox);
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

// === TASK SUMMARY FEATURE ===
const summaryBtn = document.getElementById("summaryBtn");
const summaryOutput = document.getElementById("summaryOutput");

summaryBtn.addEventListener("click", () => {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (tasks.length === 0) {
    summaryOutput.innerHTML = "📝 <strong>No tasks yet!</strong><br><br>Add some tasks to see your productivity summary.";
    return;
  }

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  // Generate motivational message
  let motivation = "";
  let emoji = "";

  if (completionRate === 100) {
    motivation = "Amazing! You've completed everything! 🎉";
    emoji = "🏆";
  } else if (completionRate >= 75) {
    motivation = "Great progress! You're almost there!";
    emoji = "🌟";
  } else if (completionRate >= 50) {
    motivation = "Good work! Keep the momentum going!";
    emoji = "💪";
  } else if (completionRate >= 25) {
    motivation = "You've made a start! Keep pushing forward!";
    emoji = "🚀";
  } else if (completionRate > 0) {
    motivation = "Every journey begins with a single step!";
    emoji = "✨";
  } else {
    motivation = "Time to tackle those tasks!";
    emoji = "🎯";
  }

  // Get task categories (simple keyword detection)
  const categories = {
    work: 0,
    personal: 0,
    urgent: 0,
    other: 0
  };

  tasks.forEach(task => {
    const text = task.text.toLowerCase();
    if (text.includes('work') || text.includes('meeting') || text.includes('email') || text.includes('project')) {
      categories.work++;
    } else if (text.includes('buy') || text.includes('call') || text.includes('home') || text.includes('family')) {
      categories.personal++;
    } else if (text.includes('urgent') || text.includes('asap') || text.includes('important') || text.includes('deadline')) {
      categories.urgent++;
    } else {
      categories.other++;
    }
  });

  // Build summary HTML
  summaryOutput.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">${emoji}</div>
      <strong style="font-size: 1.2rem; color: var(--secondary);">${motivation}</strong>
    </div>
    
    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem;">
      <strong>📊 Task Statistics</strong><br><br>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div>✅ Completed:</div><div><strong>${completedTasks}</strong></div>
        <div>⏳ Pending:</div><div><strong>${pendingTasks}</strong></div>
        <div>📈 Progress:</div><div><strong>${completionRate}%</strong></div>
        <div>📝 Total:</div><div><strong>${totalTasks}</strong></div>
      </div>
    </div>

    ${categories.work > 0 || categories.personal > 0 || categories.urgent > 0 ? `
    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem;">
      <strong>🏷️ Task Breakdown</strong><br><br>
      ${categories.work > 0 ? `💼 Work: ${categories.work}<br>` : ''}
      ${categories.personal > 0 ? `🏠 Personal: ${categories.personal}<br>` : ''}
      ${categories.urgent > 0 ? `🔥 Urgent: ${categories.urgent}<br>` : ''}
      ${categories.other > 0 ? `📌 Other: ${categories.other}<br>` : ''}
    </div>
    ` : ''}

    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.75rem;">
      <strong>💡 Quick Tip:</strong><br>
      ${pendingTasks > 0 ?
      `Focus on completing your ${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''} to boost your productivity!` :
      `You're all caught up! Time to add new goals or take a well-deserved break! 🎉`
    }
    </div>
  `;
});
