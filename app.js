// ==================== STATE & CONFIGURATION ====================
let currentUser = null;
let userClasses = [];
let userTodos = [];
let selectedSlot = null; // Currently selected empty slot

// Pre-seeded accounts database in localStorage
const DEFAULT_ACCOUNTS = [];

// Standard Timetable Configuration
const START_HOUR = 9;  // 09:00
const END_HOUR = 18;   // 18:00
const HOUR_HEIGHT = 60; // 1 hour = 60px height in CSS

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  initAccounts();
  checkSession();
  setupTimetableGrid();
  
  // Set default day in selector based on today's weekday
  setDefaultDay();
});

// Initialize mock accounts if not present
function initAccounts() {
  if (!localStorage.getItem("gonggang_accounts")) {
    localStorage.setItem("gonggang_accounts", JSON.stringify(DEFAULT_ACCOUNTS));
  }
}

// Check if user is logged in
function checkSession() {
  const session = localStorage.getItem("gonggang_session");
  if (session) {
    currentUser = JSON.parse(session);
    showScreen("dashboard-screen");
    loadUserData();
  } else {
    showScreen("auth-screen");
  }
}

// Show/Hide Screens
function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen => {
    screen.classList.remove("active");
  });
  
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
}

// Set default day selector to today if weekday, else Monday
function setDefaultDay() {
  const daySelect = document.getElementById("day-select");
  if (!daySelect) return;

  const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  const dayMapping = ["금", "월", "화", "수", "목", "금", "월"]; // Default weekends to Monday/Friday
  const defaultDay = (currentDayIndex >= 1 && currentDayIndex <= 5) 
    ? ["일", "월", "화", "수", "목", "금", "토"][currentDayIndex]
    : "월";
  
  daySelect.value = defaultDay;
}

// Load current user's timetable and todos
function loadUserData() {
  if (!currentUser) return;

  // Display user name
  document.getElementById("user-display-name").textContent = currentUser.name;

  // Load classes
  const classesKey = `gonggang_classes_${currentUser.id}`;
  userClasses = JSON.parse(localStorage.getItem(classesKey)) || [];

  // Load todos
  const todosKey = `gonggang_todos_${currentUser.id}`;
  userTodos = JSON.parse(localStorage.getItem(todosKey)) || [
    // Pre-populate some demo todos if list is empty
    { id: "demo-1", name: "전공 서적 3챕터 읽기", duration: 60 },
    { id: "demo-2", name: "영어 단어 50개 암기", duration: 30 },
    { id: "demo-3", name: "교양 과제 레포트 작성", duration: 120 },
    { id: "demo-4", name: "가벼운 스트레칭 및 휴식", duration: 15 }
  ];
  if (!localStorage.getItem(todosKey)) {
    localStorage.setItem(todosKey, JSON.stringify(userTodos));
  }

  renderTimetable();
  renderTodoList();
  calculateEmptySlots();
}

// ==================== AUTHENTICATION LOGIC ====================

// Switch tabs between Login and Signup
function switchAuthTab(type) {
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const formLogin = document.getElementById("login-form");
  const formSignup = document.getElementById("signup-form");

  if (type === "login") {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    formLogin.classList.add("active");
    formSignup.classList.remove("active");
    document.getElementById("signup-error").textContent = "";
  } else {
    tabLogin.classList.remove("active");
    tabSignup.classList.add("active");
    formLogin.classList.remove("active");
    formSignup.classList.add("active");
    document.getElementById("login-error").textContent = "";
  }
}

// Handle Login Form Submit
function handleLogin(event) {
  event.preventDefault();
  const idInput = document.getElementById("login-id").value.trim();
  const pwInput = document.getElementById("login-pw").value.trim();
  const errorDiv = document.getElementById("login-error");

  // Reset error
  errorDiv.textContent = "";

  if (!idInput || !pwInput) {
    errorDiv.textContent = "모든 항목을 입력해주세요";
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("gonggang_accounts")) || [];
  const matchedUser = accounts.find(acc => acc.id === idInput && acc.password === pwInput);

  if (matchedUser) {
    currentUser = matchedUser;
    localStorage.setItem("gonggang_session", JSON.stringify(currentUser));
    showScreen("dashboard-screen");
    loadUserData();
    // Clear inputs
    document.getElementById("login-id").value = "";
    document.getElementById("login-pw").value = "";
  } else {
    errorDiv.textContent = "ID 또는 비밀번호가 올바르지 않습니다";
  }
}

// Handle Signup Form Submit
function handleSignup(event) {
  event.preventDefault();
  const idInput = document.getElementById("signup-id").value.trim();
  const nameInput = document.getElementById("signup-name").value.trim();
  const pwInput = document.getElementById("signup-pw").value.trim();
  const errorDiv = document.getElementById("signup-error");

  errorDiv.textContent = "";

  if (!idInput || !nameInput || !pwInput) {
    errorDiv.textContent = "모든 항목을 입력해주세요";
    return;
  }

  if (idInput.length < 5) {
    errorDiv.textContent = "아이디는 5자 이상 입력해주세요";
    return;
  }

  if (pwInput.length < 6) {
    errorDiv.textContent = "비밀번호는 6자 이상 입력해주세요";
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("gonggang_accounts")) || [];
  const isDuplicate = accounts.some(acc => acc.id === idInput);

  if (isDuplicate) {
    errorDiv.textContent = "이미 존재하는 아이디입니다";
    return;
  }

  // Create new account
  const newAccount = { id: idInput, password: pwInput, name: nameInput };
  accounts.push(newAccount);
  localStorage.setItem("gonggang_accounts", JSON.stringify(accounts));

  // Success alert and switch to login tab
  alert("회원가입이 완료되었습니다! 로그인해 주세요.");
  switchAuthTab("login");
  document.getElementById("login-id").value = idInput;
  
  // Clear signup form
  document.getElementById("signup-id").value = "";
  document.getElementById("signup-name").value = "";
  document.getElementById("signup-pw").value = "";
}

// Handle Logout
function handleLogout() {
  localStorage.removeItem("gonggang_session");
  currentUser = null;
  selectedSlot = null;
  
  // Hide details and clear recommendations
  document.getElementById("selected-slot-details").classList.add("hidden");
  document.getElementById("recommendation-results").innerHTML = `
    <div class="empty-state">
      <p>⚡ 공강 목록에서 비어있는 시간을 선택하시면 맞춤형 추천이 표시됩니다.</p>
    </div>
  `;

  showScreen("auth-screen");
}

// ==================== TIMETABLE RENDERING ====================

// Generate background grid hour labels and columns
function setupTimetableGrid() {
  const grid = document.getElementById("timetable-grid");
  if (!grid) return;

  // Clear existing rows (keep first 6 header cells)
  const headers = Array.from(grid.querySelectorAll(".grid-header-cell"));
  grid.innerHTML = "";
  headers.forEach(h => grid.appendChild(h));

  // Create 9 rows (09:00 to 18:00)
  for (let h = START_HOUR; h < END_HOUR; h++) {
    // 1. Time Column Label
    const timeLabel = document.createElement("div");
    timeLabel.className = "time-cell-label";
    timeLabel.textContent = `${String(h).padStart(2, '0')}:00`;
    grid.appendChild(timeLabel);

    // 2. 5 Columns for Mon-Fri
    // We only do this on the first row, creating column wrappers that span vertically!
    if (h === START_HOUR) {
      const days = ["월", "화", "수", "목", "금"];
      days.forEach(day => {
        const col = document.createElement("div");
        col.className = "day-column";
        col.id = `col-${day}`;
        col.style.gridRow = `span ${END_HOUR - START_HOUR}`; // Span all hour rows

        // Draw horizontal grid lines inside each column
        for (let i = 0; i <= END_HOUR - START_HOUR; i++) {
          const line = document.createElement("div");
          line.className = "grid-horizontal-line";
          line.style.top = `${i * HOUR_HEIGHT}px`;
          col.appendChild(line);
        }

        grid.appendChild(col);
      });
    }
  }
}

// Render classes onto the timetable grid
function renderTimetable() {
  // Clear existing class blocks
  const cols = document.querySelectorAll(".day-column");
  cols.forEach(col => {
    // Keep only the grid lines
    const lines = col.querySelectorAll(".grid-horizontal-line");
    col.innerHTML = "";
    lines.forEach(line => col.appendChild(line));
  });

  // Render each class
  userClasses.forEach((cls, index) => {
    const col = document.getElementById(`col-${cls.day}`);
    if (!col) return;

    // Calculate positioning
    const startMin = timeToMins(cls.start);
    const endMin = timeToMins(cls.end);
    const dayStartMin = START_HOUR * 60; // 540 mins

    const topOffset = startMin - dayStartMin;
    const heightOffset = endMin - startMin;

    // Create block element
    const block = document.createElement("div");
    block.className = `class-block class-theme-${index % 5}`;
    block.style.top = `${topOffset}px`;
    block.style.height = `${heightOffset}px`;
    block.onclick = () => confirmDeleteClass(cls.id, cls.name);

    block.innerHTML = `
      <span class="class-name" title="${cls.name}">${cls.name}</span>
      <span class="class-time">${cls.start} - ${cls.end}</span>
    `;

    col.appendChild(block);
  });
}

// ==================== CLASS MANAGEMENT ====================

function openClassModal() {
  document.getElementById("class-error").textContent = "";
  document.getElementById("class-form").reset();
  document.getElementById("class-modal").classList.add("active");
}

function closeClassModal() {
  document.getElementById("class-modal").classList.remove("active");
}

// Handle Save Class
function handleSaveClass(event) {
  event.preventDefault();
  
  const name = document.getElementById("class-name").value.trim();
  const day = document.getElementById("class-day").value;
  const start = document.getElementById("class-start").value;
  const end = document.getElementById("class-end").value;
  const errorDiv = document.getElementById("class-error");

  errorDiv.textContent = "";

  const startMin = timeToMins(start);
  const endMin = timeToMins(end);

  // Validation 1: Start Time must be before End Time
  if (startMin >= endMin) {
    errorDiv.textContent = "시간을 확인해주세요 (시작 시간이 종료 시간보다 같거나 늦습니다)";
    return;
  }

  // Validation 2: Check standard operating bounds (09:00 - 18:00)
  const minBound = START_HOUR * 60;
  const maxBound = END_HOUR * 60;
  if (startMin < minBound || endMin > maxBound) {
    errorDiv.textContent = `수업 등록은 ${String(START_HOUR).padStart(2, '0')}시부터 ${String(END_HOUR).padStart(2, '0')}시 사이에만 가능합니다.`;
    return;
  }

  // Validation 3: Check for overlaps in the same day
  const hasOverlap = userClasses.some(cls => {
    if (cls.day !== day) return false;
    const existingStart = timeToMins(cls.start);
    const existingEnd = timeToMins(cls.end);
    // Overlap condition: startA < endB && startB < endA
    return startMin < existingEnd && existingStart < endMin;
  });

  if (hasOverlap) {
    errorDiv.textContent = "중복된 수업 시간입니다";
    return;
  }

  // Save new class
  const newClass = {
    id: "cls-" + Date.now(),
    name: name,
    day: day,
    start: start,
    end: end
  };

  userClasses.push(newClass);
  saveClasses();
  renderTimetable();
  calculateEmptySlots(); // Recalculate break slots for the current selected day
  closeClassModal();
}

function saveClasses() {
  if (!currentUser) return;
  const classesKey = `gonggang_classes_${currentUser.id}`;
  localStorage.setItem(classesKey, JSON.stringify(userClasses));
}

// Confirm and Delete class
function confirmDeleteClass(id, name) {
  if (confirm(`수업 [${name}]을(를) 삭제하시겠습니까?`)) {
    userClasses = userClasses.filter(cls => cls.id !== id);
    saveClasses();
    renderTimetable();
    
    // Clear details if selected slot is affected or just recalculate
    selectedSlot = null;
    document.getElementById("selected-slot-details").classList.add("hidden");
    
    calculateEmptySlots();
  }
}

// ==================== EMPTY SLOT (GONGGANG) CALCULATION ====================

// Automatically calculates empty slot intervals between classes for the selected day
function calculateEmptySlots() {
  const daySelect = document.getElementById("day-select");
  if (!daySelect) return;

  const selectedDay = daySelect.value;
  const listContainer = document.getElementById("empty-slots-list");
  listContainer.innerHTML = "";

  // Filter and sort classes of selected day by start time
  const dayClasses = userClasses
    .filter(cls => cls.day === selectedDay)
    .sort((a, b) => timeToMins(a.start) - timeToMins(b.start));

  const emptySlots = [];

  // Calculate gaps strictly between sorted classes
  for (let i = 0; i < dayClasses.length - 1; i++) {
    const endCurrent = timeToMins(dayClasses[i].end);
    const startNext = timeToMins(dayClasses[i+1].start);

    if (startNext > endCurrent) {
      emptySlots.push({
        id: `slot-${selectedDay}-${i}`,
        start: dayClasses[i].end,
        end: dayClasses[i+1].start,
        duration: startNext - endCurrent // in minutes
      });
    }
  }

  // Render slots list
  if (emptySlots.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p>📭 이 요일에는 수업 사이의 공강이 존재하지 않습니다.</p>
        <p style="font-size:0.75rem; margin-top:4px;">(수업이 2개 이상이고, 그 사이에 빈 시간이 있어야 공강이 발생합니다.)</p>
      </div>
    `;
    // If no slots exist, reset recommendation details
    selectedSlot = null;
    document.getElementById("selected-slot-details").classList.add("hidden");
    updateRecommendations();
    return;
  }

  emptySlots.forEach(slot => {
    const item = document.createElement("div");
    item.className = "slot-item";
    if (selectedSlot && selectedSlot.id === slot.id) {
      item.classList.add("active");
    }

    item.onclick = () => selectEmptySlot(slot, item);
    item.innerHTML = `
      <span class="slot-time-text">⏳ ${slot.start} ~ ${slot.end}</span>
      <span class="slot-duration-text">${formatDuration(slot.duration)}</span>
    `;
    listContainer.appendChild(item);
  });

  // Keep details/recommendations sync if selectedSlot is still valid
  if (selectedSlot) {
    const activeSlotStillExists = emptySlots.find(s => s.id === selectedSlot.id);
    if (activeSlotStillExists) {
      selectedSlot = activeSlotStillExists; // update duration if changed
      showSlotDetails(selectedSlot);
    } else {
      selectedSlot = null;
      document.getElementById("selected-slot-details").classList.add("hidden");
      updateRecommendations();
    }
  } else {
    updateRecommendations();
  }
}

// Select a specific empty slot
function selectEmptySlot(slot, element) {
  // Toggle active class on list items
  const items = document.querySelectorAll(".slot-item");
  items.forEach(item => item.classList.remove("active"));
  
  if (selectedSlot && selectedSlot.id === slot.id) {
    // Deselect if clicked again
    selectedSlot = null;
    document.getElementById("selected-slot-details").classList.add("hidden");
  } else {
    selectedSlot = slot;
    element.classList.add("active");
    showSlotDetails(slot);
  }

  updateRecommendations();
}

// Display selected slot info
function showSlotDetails(slot) {
  const panel = document.getElementById("selected-slot-details");
  panel.classList.remove("hidden");
  
  document.getElementById("slot-total-duration").textContent = formatDuration(slot.duration);
  document.getElementById("slot-start-time").textContent = slot.start;
  document.getElementById("slot-end-time").textContent = slot.end;
}

// ==================== TODO MANAGEMENT ====================

function openTodoModal() {
  document.getElementById("todo-form").reset();
  document.getElementById("todo-modal").classList.add("active");
}

function closeTodoModal() {
  document.getElementById("todo-modal").classList.remove("active");
}

// Handle Save Todo
function handleSaveTodo(event) {
  event.preventDefault();
  
  const name = document.getElementById("todo-name").value.trim();
  const duration = parseInt(document.getElementById("todo-duration").value);

  const newTodo = {
    id: "todo-" + Date.now(),
    name: name,
    duration: duration
  };

  userTodos.push(newTodo);
  saveTodos();
  renderTodoList();
  
  // Update recommendations immediately if a slot is currently selected
  if (selectedSlot) {
    updateRecommendations();
  }

  closeTodoModal();
}

function saveTodos() {
  if (!currentUser) return;
  const todosKey = `gonggang_todos_${currentUser.id}`;
  localStorage.setItem(todosKey, JSON.stringify(userTodos));
}

// Render Todo items list
function renderTodoList() {
  const todoContainer = document.getElementById("todo-list");
  todoContainer.innerHTML = "";

  if (userTodos.length === 0) {
    todoContainer.innerHTML = `
      <div class="empty-state">
        <p>📝 등록된 할 일이 없습니다. 공강 시간에 할 일을 추가해보세요!</p>
      </div>
    `;
    return;
  }

  userTodos.forEach(todo => {
    const item = document.createElement("div");
    item.className = "todo-item";
    item.innerHTML = `
      <div class="todo-info">
        <span class="todo-title">${todo.name}</span>
        <span class="todo-time-badge">⏱️ 예상 소요 시간: ${formatDuration(todo.duration)}</span>
      </div>
      <button class="delete-btn" onclick="confirmDeleteTodo('${todo.id}', '${todo.name}')" title="할 일 삭제">🗑️</button>
    `;
    todoContainer.appendChild(item);
  });
}

// Confirm and Delete Todo
function confirmDeleteTodo(id, name) {
  if (confirm(`할 일 [${name}]을(를) 삭제하시겠습니까?`)) {
    userTodos = userTodos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodoList();

    if (selectedSlot) {
      updateRecommendations();
    }
  }
}

// ==================== RECOMMENDATION ALGORITHM ====================

// Matches and displays eligible Todos for the selected break period
function updateRecommendations() {
  const recContainer = document.getElementById("recommendation-results");
  
  // Case 1: No slot selected
  if (!selectedSlot) {
    recContainer.innerHTML = `
      <div class="empty-state">
        <p>⚡ 공강 목록에서 비어있는 시간을 선택하시면 맞춤형 추천이 표시됩니다.</p>
      </div>
    `;
    return;
  }

  const breakDuration = selectedSlot.duration;

  // Case 2: Filter todos that take <= selected empty slot duration
  const eligibleTodos = userTodos.filter(todo => todo.duration <= breakDuration);

  // Case 3: If no todos or no todo fits in the selected period
  if (userTodos.length === 0 || eligibleTodos.length === 0) {
    recContainer.innerHTML = `
      <div class="empty-state empty-state-warning">
        <p>⚠️ 현재 공강 시간에 적합한 할 일이 없습니다.</p>
        <p style="font-size:0.75rem; margin-top:4px;">(예상 소요 시간이 공강 시간(${formatDuration(breakDuration)})보다 긴 일만 남았거나 등록된 할 일이 없습니다.)</p>
      </div>
    `;
    return;
  }

  // Render matching recommended todos
  recContainer.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "rec-card-grid";

  // Sort eligible todos: prioritize items that fit closest to the break duration (greedy selection)
  // or sort by name/duration. Sorting by duration descending fits larger tasks first, which is great!
  eligibleTodos
    .sort((a, b) => b.duration - a.duration)
    .forEach((todo, idx) => {
      const card = document.createElement("div");
      card.className = "rec-card";
      card.innerHTML = `
        <div class="rec-badge">${idx + 1}</div>
        <div class="rec-details">
          <div class="rec-title">${todo.name}</div>
          <div class="rec-desc">소요 시간: ${formatDuration(todo.duration)} (여유 시간: +${formatDuration(breakDuration - todo.duration)})</div>
        </div>
      `;
      grid.appendChild(card);
    });

  recContainer.appendChild(grid);
}

// ==================== TIME HELPER FUNCTIONS ====================

// Converts "HH:MM" format string to total minutes
function timeToMins(timeStr) {
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Format minutes to human readable string (e.g. 90 -> "1시간 30분", 30 -> "30분")
function formatDuration(mins) {
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}시간 ${remMins}분` : `${hrs}시간`;
  }
  return `${mins}분`;
}
