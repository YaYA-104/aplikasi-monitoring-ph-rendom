// Simulator data pH tanah seolah-olah dibaca dari alat IoT ESP32.
// Pakai file ini di browser untuk menambah data baru setiap beberapa detik.

const SENSOR_CONFIG = {
  deviceId: "ESP32-PH-01",
  lokasi: "Lahan Pertanian A",
  intervalMs: 5000,
  storageKey: "iot_ph_readings",
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function getStatusTanah(ph) {
  if (ph < 5.5) return "Asam";
  if (ph > 7.0) return "Basa";
  return "Netral";
}

function randomBetween(min, max, digits = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(digits));
}

function generateIoTReading() {
  const now = new Date();
  const hour = now.getHours();

  let suhuMin = 21;
  let suhuMax = 29;

  if (hour >= 6 && hour < 10) {
    suhuMin = 21;
    suhuMax = 24;
  } else if (hour >= 10 && hour < 15) {
    suhuMin = 24;
    suhuMax = 31;
  } else if (hour >= 15 && hour < 18) {
    suhuMin = 25;
    suhuMax = 29;
  }

  const suhuTanah = randomBetween(suhuMin, suhuMax);
  const kelembabanTanah = randomBetween(72, 94);
  const phTanah = randomBetween(6.25, 6.85);

  return {
    id: `IOT-${Date.now()}`,
    device_id: SENSOR_CONFIG.deviceId,
    lokasi: SENSOR_CONFIG.lokasi,
    tanggal: `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`,
    waktu: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    timestamp: now.toISOString(),
    ph_tanah: phTanah,
    suhu_tanah_c: suhuTanah,
    kelembaban_tanah_persen: kelembabanTanah,
    status_tanah: getStatusTanah(phTanah),
    battery_persen: randomBetween(76, 100, 1),
    tegangan_baterai_v: randomBetween(3.75, 4.15),
    rssi_dbm: Math.round(randomBetween(-78, -45, 0)),
    sumber_data: "Simulasi pembacaan sensor IoT ESP32",
  };
}

function getStoredReadings() {
  return JSON.parse(localStorage.getItem(SENSOR_CONFIG.storageKey) || "[]");
}

function saveReading(reading) {
  const readings = getStoredReadings();
  readings.unshift(reading);
  localStorage.setItem(SENSOR_CONFIG.storageKey, JSON.stringify(readings.slice(0, 200)));
  return readings;
}

function startIoTSimulator(callback) {
  const createAndSave = () => {
    const reading = generateIoTReading();
    saveReading(reading);

    if (typeof callback === "function") {
      callback(reading, getStoredReadings());
    }

    console.log("Data IoT baru:", reading);
  };

  createAndSave();
  return setInterval(createAndSave, SENSOR_CONFIG.intervalMs);
}
