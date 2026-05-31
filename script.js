const USER_STORAGE_KEY = "ph_users";
const SESSION_STORAGE_KEY = "ph_current_user";

function encodePassword(password) {
  return btoa(unescape(encodeURIComponent(password)));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      loginAt: new Date().toISOString(),
    })
  );
}

function seedDefaultUser() {
  const users = readUsers();
  const defaultEmail = "admin@phsoil.local";
  const alreadyExists = users.some((user) => user.email === defaultEmail);

  if (!alreadyExists) {
    users.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: "Admin Monitoring",
      email: defaultEmail,
      password: encodePassword("admin123"),
      createdAt: new Date().toISOString(),
    });

    saveUsers(users);
  }
}

function showMessage(elementId, message, type = "error") {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.className = `form-message ${type}`;
}

function initLoginPage() {
  const form = document.getElementById("loginForm");
  const currentUser = readCurrentUser();

  if (currentUser) {
    window.location.href = "index.html";
    return;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = normalizeEmail(document.getElementById("loginEmail").value);
    const password = document.getElementById("loginPassword").value;
    const users = readUsers();
    const user = users.find(
      (item) => item.email === email && item.password === encodePassword(password)
    );

    if (!user) {
      showMessage("loginMessage", "Email atau password salah.");
      return;
    }

    setCurrentUser(user);
    showMessage("loginMessage", "Login berhasil. Mengalihkan ke dashboard...", "success");
    window.location.href = "index.html";
  });
}

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  const currentUser = readCurrentUser();

  if (currentUser) {
    window.location.href = "index.html";
    return;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = normalizeEmail(document.getElementById("registerEmail").value);
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    if (name.length < 3) {
      showMessage("registerMessage", "Nama minimal 3 karakter.");
      return;
    }

    if (password.length < 6) {
      showMessage("registerMessage", "Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("registerMessage", "Konfirmasi password tidak sama.");
      return;
    }

    const users = readUsers();
    const emailExists = users.some((user) => user.email === email);

    if (emailExists) {
      showMessage("registerMessage", "Email sudah terdaftar. Gunakan email lain.");
      return;
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      email,
      password: encodePassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    showMessage("registerMessage", "Pendaftaran berhasil. Mengalihkan ke dashboard...", "success");
    window.location.href = "index.html";
  });
}

function initDashboardPage() {
  const currentUser = readCurrentUser();

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const label = document.getElementById("currentUserLabel");
  const logoutButton = document.getElementById("logoutBtn");

  if (label) {
    label.textContent = currentUser.name || currentUser.email;
    label.title = currentUser.email;
  }

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = "login.html";
  });
}

seedDefaultUser();

const page = document.body.dataset.page;

if (page === "login") {
  initLoginPage();
}

if (page === "register") {
  initRegisterPage();
}

if (page === "dashboard") {
  initDashboardPage();
  initIoTSimulationPanel();
}


function formatReadingDate(reading) {
  if (reading.timestamp && reading.timestamp.includes("T")) {
    return new Date(reading.timestamp).toLocaleString("id-ID");
  }

  return `${reading.tanggal} ${reading.waktu}`;
}

function renderLiveReading(reading) {
  if (!reading) return;

  const livePh = document.getElementById("livePh");
  const liveSuhu = document.getElementById("liveSuhu");
  const liveKelembaban = document.getElementById("liveKelembaban");
  const liveBattery = document.getElementById("liveBattery");
  const liveSignal = document.getElementById("liveSignal");
  const liveStatus = document.getElementById("liveStatus");
  const liveTimestamp = document.getElementById("liveTimestamp");

  if (livePh) livePh.textContent = reading.ph_tanah;
  if (liveSuhu) liveSuhu.textContent = `${reading.suhu_tanah_c}°C`;
  if (liveKelembaban) liveKelembaban.textContent = `${reading.kelembaban_tanah_persen}%`;
  if (liveBattery) liveBattery.textContent = `${reading.battery_persen}%`;
  if (liveSignal) liveSignal.textContent = `RSSI: ${reading.rssi_dbm} dBm`;
  if (liveStatus) liveStatus.textContent = `Status: ${reading.status_tanah}`;
  if (liveTimestamp) liveTimestamp.textContent = formatReadingDate(reading);
}

function renderLiveTable(readings) {
  const body = document.getElementById("liveTableBody");
  if (!body) return;

  const rows = readings.slice(0, 15).map((item) => {
    return `
      <tr>
        <td>${item.id}</td>
        <td>${formatReadingDate(item)}</td>
        <td>${item.ph_tanah}</td>
        <td>${item.suhu_tanah_c}°C</td>
        <td>${item.kelembaban_tanah_persen}%</td>
        <td><span>${item.status_tanah}</span></td>
        <td>${item.battery_persen}%</td>
        <td>${item.rssi_dbm} dBm</td>
      </tr>
    `;
  });

  body.innerHTML = rows.join("");
}

function initIoTSimulationPanel() {
  const generateOneBtn = document.getElementById("generateOneBtn");
  const toggleSimulatorBtn = document.getElementById("toggleSimulatorBtn");
  const simulatorStatus = document.getElementById("simulatorStatus");

  if (!generateOneBtn || !toggleSimulatorBtn) return;

  let timerId = null;
  let readings = [];

  if (typeof dataPhIoTRandom !== "undefined" && Array.isArray(dataPhIoTRandom)) {
    readings = [...dataPhIoTRandom].reverse();
    renderLiveReading(readings[0]);
    renderLiveTable(readings);
  }

  generateOneBtn.addEventListener("click", () => {
    const reading = generateIoTReading();
    saveReading(reading);
    readings.unshift(reading);
    renderLiveReading(reading);
    renderLiveTable(readings);
  });

  toggleSimulatorBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      toggleSimulatorBtn.textContent = "Mulai Simulator Otomatis";
      if (simulatorStatus) {
        simulatorStatus.textContent = "Simulator Berhenti";
        simulatorStatus.classList.remove("running");
      }
      return;
    }

    timerId = startIoTSimulator((reading) => {
      readings.unshift(reading);
      renderLiveReading(reading);
      renderLiveTable(readings);
    });

    toggleSimulatorBtn.textContent = "Stop Simulator Otomatis";
    if (simulatorStatus) {
      simulatorStatus.textContent = "Membaca Sensor Tiap 5 Detik";
      simulatorStatus.classList.add("running");
    }
  });
}
