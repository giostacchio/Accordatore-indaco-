(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const bpmValue = $("metroBpmValue");
  const bpmRange = $("metroBpm");
  const startBtn = $("metroStart");
  const tapBtn = $("metroTap");
  const minusBtn = $("metroMinus");
  const plusBtn = $("metroPlus");
  const soundBtn = $("metroSound");
  const signatureSelect = $("metroSignature");
  const flash = $("metroFlash");
  const beatDots = $("metroBeats");
  const status = $("metroStatus");

  if (!bpmValue || !bpmRange || !startBtn || !tapBtn || !signatureSelect || !flash || !beatDots) return;

  const STORAGE_KEY = "giostacchio-metronome-v1";
  const LOOKAHEAD_MS = 25;
  const SCHEDULE_AHEAD = 0.12;

  let bpm = 100;
  let beatsPerBar = 4;
  let running = false;
  let soundEnabled = true;
  let audioContext = null;
  let timerId = null;
  let nextBeatTime = 0;
  let beatIndex = 0;
  let tapTimes = [];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function loadPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      bpm = clamp(Number(saved.bpm) || 100, 40, 240);
      beatsPerBar = [2, 3, 4, 6].includes(Number(saved.beatsPerBar)) ? Number(saved.beatsPerBar) : 4;
      soundEnabled = saved.soundEnabled !== false;
    } catch {
      bpm = 100;
      beatsPerBar = 4;
      soundEnabled = true;
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ bpm, beatsPerBar, soundEnabled }));
    } catch {}
  }

  function renderBeats(active = -1) {
    beatDots.innerHTML = "";
    for (let i = 0; i < beatsPerBar; i += 1) {
      const dot = document.createElement("span");
      dot.className = "metro-beat" + (i === 0 ? " accent" : "") + (i === active ? " active" : "");
      dot.setAttribute("aria-label", "Movimento " + (i + 1));
      beatDots.appendChild(dot);
    }
  }

  function updateUI() {
    bpmValue.textContent = String(bpm);
    bpmRange.value = String(bpm);
    signatureSelect.value = String(beatsPerBar);
    soundBtn.textContent = soundEnabled ? "🔊 Suono ON" : "🔇 Solo visivo";
    soundBtn.setAttribute("aria-pressed", String(soundEnabled));
    startBtn.textContent = running ? "Ferma" : "Avvia";
    startBtn.classList.toggle("stop", running);
    status.textContent = running ? (soundEnabled ? "IN ESECUZIONE · CLICK + VISIVO" : "IN ESECUZIONE · SOLO VISIVO") : "PRONTO";
    if (!running) renderBeats(-1);
  }

  function setBpm(value) {
    bpm = Math.round(clamp(Number(value) || 100, 40, 240));
    updateUI();
    savePreferences();
  }

  function ensureAudioContext() {
    if (!audioContext || audioContext.state === "closed") {
      audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
    }
    return audioContext.resume();
  }

  function scheduleClick(time, accent) {
    if (!soundEnabled || !audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(accent ? 1450 : 950, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.18 : 0.11, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.06);
  }

  function scheduleVisual(time, beat) {
    if (!audioContext) return;
    const delay = Math.max(0, (time - audioContext.currentTime) * 1000);
    window.setTimeout(() => {
      if (!running) return;
      flash.classList.remove("pulse", "accent");
      void flash.offsetWidth;
      if (beat === 0) flash.classList.add("accent");
      flash.classList.add("pulse");
      renderBeats(beat);
    }, delay);
  }

  function scheduler() {
    if (!running || !audioContext) return;
    while (nextBeatTime < audioContext.currentTime + SCHEDULE_AHEAD) {
      const currentBeat = beatIndex;
      scheduleClick(nextBeatTime, currentBeat === 0);
      scheduleVisual(nextBeatTime, currentBeat);
      nextBeatTime += 60 / bpm;
      beatIndex = (beatIndex + 1) % beatsPerBar;
    }
  }

  async function start() {
    if (!(window.AudioContext || window.webkitAudioContext)) {
      status.textContent = "Audio non supportato da questo browser";
      return;
    }
    await ensureAudioContext();
    running = true;
    beatIndex = 0;
    nextBeatTime = audioContext.currentTime + 0.06;
    scheduler();
    timerId = window.setInterval(scheduler, LOOKAHEAD_MS);
    updateUI();
  }

  function stop() {
    running = false;
    if (timerId) window.clearInterval(timerId);
    timerId = null;
    beatIndex = 0;
    flash.classList.remove("pulse", "accent");
    renderBeats(-1);
    updateUI();
  }

  function tapTempo() {
    const now = performance.now();
    if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 2200) tapTimes = [];
    tapTimes.push(now);
    if (tapTimes.length > 6) tapTimes.shift();
    if (tapTimes.length < 2) {
      status.textContent = "TAP: ancora un colpo…";
      return;
    }
    const intervals = [];
    for (let i = 1; i < tapTimes.length; i += 1) intervals.push(tapTimes[i] - tapTimes[i - 1]);
    const average = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    setBpm(60000 / average);
    status.textContent = "TAP TEMPO · " + bpm + " BPM";
  }

  loadPreferences();
  renderBeats();
  updateUI();

  bpmRange.addEventListener("input", (event) => setBpm(event.target.value));
  minusBtn.addEventListener("click", () => setBpm(bpm - 1));
  plusBtn.addEventListener("click", () => setBpm(bpm + 1));
  tapBtn.addEventListener("click", tapTempo);
  startBtn.addEventListener("click", () => running ? stop() : void start());
  soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateUI();
    savePreferences();
  });
  signatureSelect.addEventListener("change", (event) => {
    beatsPerBar = Number(event.target.value) || 4;
    beatIndex = 0;
    renderBeats(-1);
    savePreferences();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) stop();
  });
})();
