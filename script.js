let supabaseClient = null;
let activeProfile = null;

function getPage() {
  return document.body.dataset.page || '';
}

function setMessage(elementId, message, type = 'success') {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = message || '';
  element.className = `form-message ${type}`;
}

async function initSupabase() {
  if (supabaseClient) return supabaseClient;

  const response = await fetch('/api/config');
  const config = await response.json().catch(() => null);

  if (!response.ok || !config?.supabaseUrl || !config?.supabaseAnonKey) {
    throw new Error(config?.message || 'Konfigurasi Supabase belum tersedia. Cek Environment Variables di Vercel.');
  }

  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return supabaseClient;
}

async function getSessionOrRedirect() {
  const sb = await initSupabase();
  const { data, error } = await sb.auth.getSession();

  if (error || !data.session) {
    window.location.href = 'login.html';
    return null;
  }

  return data.session;
}

async function loadOrCreateProfile(user) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('id, full_name, email, role, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const { data: inserted, error: insertError } = await sb
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      role: 'user'
    })
    .select('id, full_name, email, role, created_at, updated_at')
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function setupLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  try {
    const sb = await initSupabase();
    const { data } = await sb.auth.getSession();
    if (data.session) window.location.href = 'index.html';
  } catch (error) {
    setMessage('loginMessage', error.message, 'error');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const sb = await initSupabase();
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    setMessage('loginMessage', 'Memeriksa akun melalui Supabase Auth...', 'success');

    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadOrCreateProfile(data.user);
      setMessage('loginMessage', 'Login berhasil. Membuka dashboard...', 'success');
      window.location.href = 'index.html';
    } catch (error) {
      setMessage('loginMessage', translateAuthError(error.message), 'error');
    }
  });
}

async function setupRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  try {
    await initSupabase();
  } catch (error) {
    setMessage('registerMessage', error.message, 'error');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const sb = await initSupabase();
    const formData = new FormData(form);
    const fullName = String(formData.get('full_name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    setMessage('registerMessage', 'Mendaftarkan akun ke Supabase Auth...', 'success');

    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.session && data.user) {
        await loadOrCreateProfile(data.user);
        setMessage('registerMessage', 'Akun berhasil dibuat. Membuka dashboard...', 'success');
        window.location.href = 'index.html';
        return;
      }

      setMessage(
        'registerMessage',
        'Akun berhasil dibuat. Jika email confirmation aktif di Supabase, silakan cek email untuk verifikasi sebelum login.',
        'success'
      );
    } catch (error) {
      setMessage('registerMessage', translateAuthError(error.message), 'error');
    }
  });
}

function translateAuthError(message = '') {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Email atau password salah.';
  if (lower.includes('already registered') || lower.includes('already exists')) return 'Email sudah terdaftar.';
  if (lower.includes('email not confirmed')) return 'Email belum dikonfirmasi. Silakan cek inbox email.';
  if (lower.includes('password')) return 'Password tidak valid. Gunakan minimal 6 karakter.';
  return message || 'Terjadi kesalahan autentikasi.';
}

function getInitialReadings() {
  const stored = localStorage.getItem('soil_command_readings');

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      localStorage.removeItem('soil_command_readings');
    }
  }

  if (typeof dataPhIoTRandom !== 'undefined' && Array.isArray(dataPhIoTRandom)) {
    return dataPhIoTRandom.slice(-60);
  }

  return [];
}

function saveReadings(readings) {
  localStorage.setItem('soil_command_readings', JSON.stringify(readings.slice(-180)));
}

function average(items, key) {
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length;
}

function classifyPh(ph) {
  if (ph < 5.5) return 'Asam';
  if (ph > 7) return 'Basa';
  return 'Netral';
}

function randomBetween(min, max, digits = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(digits));
}

function formatDate(date) {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
}

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\./g, ':');
}

function generateReading(readings) {
  const now = new Date();
  const ph = randomBetween(6.18, 6.92);
  const suhu = randomBetween(21.2, 29.4);
  const kelembaban = randomBetween(75.0, 91.5);
  const batteryBase = readings.length > 0 ? Number(readings[readings.length - 1].battery_persen || 98) : 98;

  return {
    id: `LIVE-${String(Date.now()).slice(-8)}`,
    device_id: 'ESP32-PH-01',
    lokasi: 'Lahan Pertanian A',
    tanggal: formatDate(now),
    waktu: formatTime(now),
    timestamp: now.toISOString(),
    ph_tanah: ph,
    suhu_tanah_c: suhu,
    kelembaban_tanah_persen: kelembaban,
    status_tanah: classifyPh(ph),
    battery_persen: Math.max(15, Number((batteryBase - randomBetween(0.01, 0.08)).toFixed(2))),
    tegangan_baterai_v: randomBetween(3.76, 4.11),
    rssi_dbm: Math.round(randomBetween(-74, -48, 0)),
    sumber_data: 'Simulasi pembacaan sensor IoT ESP32 realtime'
  };
}

function readingToDbRow(reading) {
  return {
    device_id: reading.device_id,
    location_name: reading.lokasi,
    ph_value: reading.ph_tanah,
    soil_temperature_c: reading.suhu_tanah_c,
    soil_moisture_percent: reading.kelembaban_tanah_persen,
    soil_status: reading.status_tanah,
    battery_percent: reading.battery_persen,
    battery_voltage_v: reading.tegangan_baterai_v,
    rssi_dbm: reading.rssi_dbm,
    reading_source: reading.sumber_data,
    metadata: {
      local_id: reading.id,
      tanggal: reading.tanggal,
      waktu: reading.waktu
    }
  };
}

function dbRowToReading(row) {
  const created = new Date(row.created_at);
  return {
    id: row.metadata?.local_id || `DB-${row.id}`,
    device_id: row.device_id,
    lokasi: row.location_name,
    tanggal: row.metadata?.tanggal || formatDate(created),
    waktu: row.metadata?.waktu || formatTime(created),
    timestamp: row.created_at,
    ph_tanah: Number(row.ph_value),
    suhu_tanah_c: Number(row.soil_temperature_c),
    kelembaban_tanah_persen: Number(row.soil_moisture_percent),
    status_tanah: row.soil_status,
    battery_persen: Number(row.battery_percent || 0),
    tegangan_baterai_v: Number(row.battery_voltage_v || 0),
    rssi_dbm: row.rssi_dbm,
    sumber_data: row.reading_source || 'Supabase soil_readings'
  };
}

async function loadReadingsFromSupabase() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('soil_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);

  if (error) throw error;
  return (data || []).reverse().map(dbRowToReading);
}

async function saveReadingToSupabase(reading) {
  const sb = await initSupabase();
  const { error } = await sb
    .from('soil_readings')
    .insert(readingToDbRow(reading));

  if (error) throw error;
}

function renderMetrics(readings) {
  const visible = readings.slice(-60);
  const avgPh = average(visible, 'ph_tanah');
  const avgTemp = average(visible, 'suhu_tanah_c');
  const avgMoisture = average(visible, 'kelembaban_tanah_persen');

  document.getElementById('totalReadings').textContent = readings.length;
  document.getElementById('avgPh').textContent = avgPh.toFixed(2);
  document.getElementById('avgPhGauge').textContent = avgPh.toFixed(2);
  document.getElementById('avgTemp').textContent = `${avgTemp.toFixed(1)}°C`;
  document.getElementById('avgMoisture').textContent = `${avgMoisture.toFixed(1)}%`;
}

function renderStream(readings) {
  const stream = document.getElementById('streamLine');
  if (!stream) return;

  const latest = readings.slice(-12);
  stream.innerHTML = latest.map((item) => {
    const height = Math.max(28, Math.min(220, (Number(item.ph_tanah) - 6.0) * 250));
    return `
      <div class="stream-bar" style="height:${height}px">
        <span>${Number(item.ph_tanah).toFixed(2)}</span>
      </div>
    `;
  }).join('');
}

function renderTable(readings) {
  const table = document.getElementById('readingsTable');
  if (!table) return;

  const latest = readings.slice(-40).reverse();
  table.innerHTML = latest.map((item) => `
    <tr>
      <td><strong>${item.id}</strong></td>
      <td>${item.tanggal} ${item.waktu}</td>
      <td>${Number(item.ph_tanah).toFixed(2)}</td>
      <td>${Number(item.suhu_tanah_c).toFixed(2)}°C</td>
      <td>${Number(item.kelembaban_tanah_persen).toFixed(2)}%</td>
      <td>${Number(item.battery_persen).toFixed(1)}%</td>
      <td>${item.rssi_dbm} dBm</td>
      <td><span class="status-pill">${item.status_tanah}</span></td>
    </tr>
  `).join('');
}

function renderDashboardData(readings) {
  renderMetrics(readings);
  renderStream(readings);
  renderTable(readings);
}

function downloadReadingsCsv(readings) {
  const header = [
    'id',
    'device_id',
    'lokasi',
    'tanggal',
    'waktu',
    'ph_tanah',
    'suhu_tanah_c',
    'kelembaban_tanah_persen',
    'status_tanah',
    'battery_persen',
    'rssi_dbm',
    'sumber_data'
  ];

  const rows = readings.map((item) => header.map((key) => item[key] ?? ''));
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'soil-command-center-readings.csv';
  link.click();
  URL.revokeObjectURL(url);
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(path, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({
    ok: false,
    message: 'Respons server tidak valid.'
  }));

  if (!response.ok) {
    throw new Error(payload.message || 'Permintaan gagal diproses.');
  }

  return payload;
}

async function refreshDatabaseInfo(session) {
  try {
    const health = await apiRequest('/api/health', { method: 'GET' });
    document.getElementById('dbStatusLabel').textContent = 'Supabase Aktif';
    document.getElementById('dbStatusText').textContent = `${health.profiles_total} profil · ${health.readings_total} data sensor`;
    document.getElementById('totalUsers').textContent = health.profiles_total;
  } catch (error) {
    document.getElementById('dbStatusLabel').textContent = 'Supabase Belum Tersambung';
    document.getElementById('dbStatusText').textContent = 'Cek SUPABASE_URL dan SERVICE_ROLE_KEY';
  }

  try {
    const result = await apiRequest('/api/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    document.getElementById('totalUsers').textContent = result.total;
    const container = document.getElementById('recentUsers');
    container.innerHTML = result.users.map((user) => `
      <div class="recent-user-item">
        <div>
          <b>${user.full_name || 'Tanpa nama'}</b>
          <span>${user.email}</span>
        </div>
        <span>${user.role}</span>
      </div>
    `).join('');
  } catch (error) {
    const container = document.getElementById('recentUsers');
    container.innerHTML = `<p class="form-message error">${error.message}</p>`;
  }
}

function setupQuickAccountForm(session) {
  const form = document.getElementById('quickAccountForm');
  if (!form) return;

  if (activeProfile?.role !== 'admin') {
    setMessage('quickAccountMessage', 'Login sebagai admin untuk menambah akun dari dashboard. Ubah role akun pertama menjadi admin di Supabase SQL Editor.', 'error');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const body = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role') || 'user'
    };

    setMessage('quickAccountMessage', 'Menambahkan akun melalui Supabase Admin API...', 'success');

    try {
      await apiRequest('/api/admin-create-user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      });

      form.reset();
      setMessage('quickAccountMessage', 'Akun baru berhasil dibuat di Supabase Auth dan tabel profiles.', 'success');
      await refreshDatabaseInfo(session);
    } catch (error) {
      setMessage('quickAccountMessage', error.message, 'error');
    }
  });
}

async function setupDashboardPage() {
  const session = await getSessionOrRedirect();
  if (!session) return;

  try {
    activeProfile = await loadOrCreateProfile(session.user);
  } catch (error) {
    clearSupabaseSession();
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('currentUserName').textContent = activeProfile.full_name || 'User';
  document.getElementById('currentUserEmail').textContent = `${activeProfile.email || session.user.email} · ${activeProfile.role}`;
  document.getElementById('userInitial').textContent = (activeProfile.full_name || 'U').slice(0, 1).toUpperCase();

  document.getElementById('logoutButton').addEventListener('click', async () => {
    await clearSupabaseSession();
    window.location.href = 'login.html';
  });

  let readings = getInitialReadings();

  try {
    const dbReadings = await loadReadingsFromSupabase();
    if (dbReadings.length > 0) readings = dbReadings;
  } catch (error) {
    setMessage('readingSaveMessage', 'Tabel soil_readings belum siap atau RLS belum diatur. Aplikasi memakai data lokal sementara.', 'error');
  }

  let timer = null;
  const simulatorButton = document.getElementById('toggleSimulator');

  renderDashboardData(readings);
  await refreshDatabaseInfo(session);
  setupQuickAccountForm(session);

  async function addReading() {
    const reading = generateReading(readings);
    readings.push(reading);
    readings = readings.slice(-180);
    saveReadings(readings);
    renderDashboardData(readings);

    try {
      await saveReadingToSupabase(reading);
      setMessage('readingSaveMessage', 'Data sensor baru tersimpan ke tabel soil_readings Supabase.', 'success');
    } catch (error) {
      setMessage('readingSaveMessage', `Data tampil lokal, tetapi belum tersimpan ke Supabase: ${error.message}`, 'error');
    }
  }

  document.getElementById('generateReading').addEventListener('click', addReading);

  simulatorButton.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      simulatorButton.textContent = 'Mulai Simulasi';
      return;
    }

    timer = setInterval(addReading, 4000);
    simulatorButton.textContent = 'Hentikan Simulasi';
  });

  document.getElementById('downloadCsv').addEventListener('click', () => {
    downloadReadingsCsv(readings);
  });
}

async function clearSupabaseSession() {
  try {
    const sb = await initSupabase();
    await sb.auth.signOut();
  } catch (error) {
    // Abaikan error logout agar user tetap bisa keluar dari halaman.
  }
}

(async function boot() {
  const page = getPage();

  try {
    if (page === 'login') await setupLoginPage();
    if (page === 'register') await setupRegisterPage();
    if (page === 'dashboard') await setupDashboardPage();
  } catch (error) {
    const fallbackId = page === 'login' ? 'loginMessage' : page === 'register' ? 'registerMessage' : 'readingSaveMessage';
    setMessage(fallbackId, error.message, 'error');
  }
})();
