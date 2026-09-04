(() => {
  "use strict";

  const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const STORAGE_KEY = "indaco-tuner-preferences-v2";
  const PITCH_LIMITS = {
    guitar: { min: 55, max: 1050, downsample: 2 },
    bass: { min: 24, max: 430, downsample: 4 },
    ukulele: { min: 100, max: 1200, downsample: 2 },
    chromatic: { min: 27, max: 1400, downsample: 2 }
  };

  const TUNINGS = {
    guitar: [
      {
        id: "guitar-standard",
        label: "Standard · E A D G B E",
        shortLabel: "Standard",
        strings: [
          { name: "E", midi: 40, number: 6 },
          { name: "A", midi: 45, number: 5 },
          { name: "D", midi: 50, number: 4 },
          { name: "G", midi: 55, number: 3 },
          { name: "B", midi: 59, number: 2 },
          { name: "E", midi: 64, number: 1 }
        ]
      },
      {
        id: "guitar-flat",
        label: "Mezzo tono sotto · E♭ A♭ D♭ G♭ B♭ E♭",
        shortLabel: "Mezzo tono sotto",
        strings: [
          { name: "E♭", midi: 39, number: 6 },
          { name: "A♭", midi: 44, number: 5 },
          { name: "D♭", midi: 49, number: 4 },
          { name: "G♭", midi: 54, number: 3 },
          { name: "B♭", midi: 58, number: 2 },
          { name: "E♭", midi: 63, number: 1 }
        ]
      },
      {
        id: "guitar-drop-d",
        label: "Drop D · D A D G B E",
        shortLabel: "Drop D",
        strings: [
          { name: "D", midi: 38, number: 6 },
          { name: "A", midi: 45, number: 5 },
          { name: "D", midi: 50, number: 4 },
          { name: "G", midi: 55, number: 3 },
          { name: "B", midi: 59, number: 2 },
          { name: "E", midi: 64, number: 1 }
        ]
      },
      {
        id: "guitar-d-standard",
        label: "Re standard · D G C F A D",
        shortLabel: "Re standard",
        strings: [
          { name: "D", midi: 38, number: 6 },
          { name: "G", midi: 43, number: 5 },
          { name: "C", midi: 48, number: 4 },
          { name: "F", midi: 53, number: 3 },
          { name: "A", midi: 57, number: 2 },
          { name: "D", midi: 62, number: 1 }
        ]
      }
    ],
    bass: [
      {
        id: "bass-4",
        label: "Standard 4 corde · E A D G",
        shortLabel: "Standard 4 corde",
        strings: [
          { name: "E", midi: 28, number: 4 },
          { name: "A", midi: 33, number: 3 },
          { name: "D", midi: 38, number: 2 },
          { name: "G", midi: 43, number: 1 }
        ]
      },
      {
        id: "bass-5",
        label: "Standard 5 corde · B E A D G",
        shortLabel: "Standard 5 corde",
        strings: [
          { name: "B", midi: 23, number: 5 },
          { name: "E", midi: 28, number: 4 },
          { name: "A", midi: 33, number: 3 },
          { name: "D", midi: 38, number: 2 },
          { name: "G", midi: 43, number: 1 }
        ]
      },
      {
        id: "bass-drop-d",
        label: "Drop D 4 corde · D A D G",
        shortLabel: "Drop D",
        strings: [
          { name: "D", midi: 26, number: 4 },
          { name: "A", midi: 33, number: 3 },
          { name: "D", midi: 38, number: 2 },
          { name: "G", midi: 43, number: 1 }
        ]
      }
    ],
    ukulele: [
      {
        id: "ukulele-standard",
        label: "Standard · G C E A",
        shortLabel: "Standard",
        strings: [
          { name: "G", midi: 67, number: 4 },
          { name: "C", midi: 60, number: 3 },
          { name: "E", midi: 64, number: 2 },
          { name: "A", midi: 69, number: 1 }
        ]
      },
      {
        id: "ukulele-low-g",
        label: "Low G · G C E A",
        shortLabel: "Low G",
        strings: [
          { name: "G", midi: 55, number: 4 },
          { name: "C", midi: 60, number: 3 },
          { name: "E", midi: 64, number: 2 },
          { name: "A", midi: 69, number: 1 }
        ]
      },
      {
        id: "ukulele-baritone",
        label: "Baritono · D G B E",
        shortLabel: "Baritono",
        strings: [
          { name: "D", midi: 50, number: 4 },
          { name: "G", midi: 55, number: 3 },
          { name: "B", midi: 59, number: 2 },
          { name: "E", midi: 64, number: 1 }
        ]
      }
    ],
    chromatic: [
      { id: "chromatic", label: "Tutte le note", shortLabel: "Cromatico", strings: [] }
    ]
  };

  const INSTRUMENT_NAMES = {
    guitar: "Chitarra",
    bass: "Basso",
    ukulele: "Ukulele",
    chromatic: "Cromatico"
  };

  const $ = (id) => document.getElementById(id);
  const elements = {
    micDot: $("micDot"),
    micPrivacy: $("micPrivacy"),
    tuningSelect: $("tuningSelect"),
    modeLabel: $("modeLabel"),
    note: $("note"),
    octave: $("octave"),
    freq: $("freq"),
    target: $("target"),
    cents: $("cents"),
    status: $("status"),
    ticks: $("ticks"),
    needle: $("needle"),
    strings: $("strings"),
    stringsHint: $("stringsHint"),
    autoTargetBtn: $("autoTargetBtn"),
    targetHeading: document.querySelector(".target-heading"),
    startBtn: $("startBtn"),
    error: $("error"),
    levelText: $("levelText"),
    levelBar: $("levelBar"),
    confidenceText: $("confidenceText"),
    confidenceBar: $("confidenceBar"),
    referencePitch: $("referencePitch"),
    referenceValue: $("referenceValue"),
    installBtn: $("installBtn"),
    updateAppBtn: $("updateAppBtn"),
    shareBtn: $("shareBtn")
  };

  let instrument = "guitar";
  let tuningId = TUNINGS.guitar[0].id;
  let referencePitch = 440;
  let lockedIndex = null;
  let running = false;
  let audioContext = null;
  let analyser = null;
  let stream = null;
  let animationFrame = null;
  let sampleBuffer = null;
  let lastAnalysisAt = 0;
  let lastPitchAt = 0;
  let lastTargetKey = "";
  let installPrompt = null;
  let toneContext = null;
  let activeTone = null;
  const frequencyHistory = [];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function midiToFrequency(midi) {
    return referencePitch * Math.pow(2, (midi - 69) / 12);
  }

  function frequencyToMidi(frequency) {
    return 69 + 12 * Math.log2(frequency / referencePitch);
  }

  function centsFrom(frequency, targetFrequency) {
    return 1200 * Math.log2(frequency / targetFrequency);
  }

  function octaveForMidi(midi) {
    return Math.floor(midi / 12) - 1;
  }

  function median(values) {
    const ordered = [...values].sort((a, b) => a - b);
    const middle = Math.floor(ordered.length / 2);
    return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  }

  function currentTuning() {
    return TUNINGS[instrument].find((item) => item.id === tuningId) || TUNINGS[instrument][0];
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ instrument, tuningId, referencePitch }));
    } catch {
      // The tuner also works when storage is unavailable.
    }
  }

  function loadPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (Object.hasOwn(TUNINGS, saved.instrument)) instrument = saved.instrument;
      if (TUNINGS[instrument].some((item) => item.id === saved.tuningId)) tuningId = saved.tuningId;
      referencePitch = clamp(Number(saved.referencePitch) || 440, 430, 450);
    } catch {
      instrument = "guitar";
      tuningId = TUNINGS.guitar[0].id;
      referencePitch = 440;
    }
  }

  function buildMeterTicks() {
    for (let index = -5; index <= 5; index += 1) {
      const tick = document.createElement("i");
      const isCenter = index === 0;
      tick.className = "tick" + (index % 5 === 0 ? " major" : "") + (isCenter ? " center" : "");
      tick.style.transform = "translateX(-50%) rotate(" + (index * 9) + "deg) translateY(-90px)";
      elements.ticks.appendChild(tick);
    }
  }

  function renderInstrumentTabs() {
    document.querySelectorAll(".instrument").forEach((button) => {
      const active = button.dataset.instrument === instrument;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function renderTuningSelect() {
    elements.tuningSelect.innerHTML = "";
    TUNINGS[instrument].forEach((tuning) => {
      const option = document.createElement("option");
      option.value = tuning.id;
      option.textContent = tuning.label;
      option.selected = tuning.id === tuningId;
      elements.tuningSelect.appendChild(option);
    });
    elements.tuningSelect.disabled = instrument === "chromatic";
  }

  function renderStrings(activeIndex = lockedIndex) {
    const tuning = currentTuning();
    elements.strings.innerHTML = "";

    if (instrument === "chromatic") {
      elements.targetHeading.hidden = true;
      elements.strings.hidden = true;
      return;
    }

    elements.targetHeading.hidden = false;
    elements.strings.hidden = false;
    elements.strings.style.setProperty("--strings", String(tuning.strings.length));
    elements.autoTargetBtn.classList.toggle("active", lockedIndex === null);
    elements.autoTargetBtn.setAttribute("aria-pressed", String(lockedIndex === null));

    tuning.strings.forEach((string, index) => {
      const button = document.createElement("button");
      const active = index === activeIndex;
      const frequency = midiToFrequency(string.midi);
      button.type = "button";
      button.className = "string" + (active ? " active" : "");
      button.setAttribute("aria-pressed", String(index === lockedIndex));
      button.setAttribute(
        "aria-label",
        "Corda " + string.number + ", " + string.name + octaveForMidi(string.midi) + ", " + frequency.toFixed(1) + " hertz. Tocca per bloccare il target e ascoltare."
      );
      button.innerHTML = "<strong>" + string.name + "<sub>" + octaveForMidi(string.midi) + "</sub></strong><small>" + frequency.toFixed(1) + " Hz</small>";
      button.addEventListener("click", () => selectString(index));
      elements.strings.appendChild(button);
    });
  }

  function resetReading(message = "Tocca “Avvia microfono”") {
    frequencyHistory.length = 0;
    lastTargetKey = "";
    elements.note.textContent = "—";
    elements.octave.textContent = "";
    elements.freq.textContent = message;
    elements.target.textContent = instrument === "chromatic" ? "Target automatico" : (lockedIndex === null ? "Target automatico" : "Target bloccato");
    elements.cents.textContent = "0 cents";
    elements.status.textContent = running ? "IN ASCOLTO" : "PRONTO";
    elements.status.className = "status";
    elements.needle.style.transform = "translateX(-50%) rotate(0deg)";
    elements.needle.style.background = "var(--warn)";
    updateSignal(0, 0);
    renderStrings();
  }

  function renderMode() {
    const tuning = currentTuning();
    elements.modeLabel.textContent = INSTRUMENT_NAMES[instrument] + " · " + tuning.shortLabel;
    elements.stringsHint.textContent = lockedIndex === null
      ? "Tocca una corda per bloccarla e ascoltarla"
      : "Target bloccato · tocca AUTO per sbloccare";
    renderInstrumentTabs();
    renderTuningSelect();
    renderStrings();
  }

  function setInstrument(nextInstrument) {
    if (!Object.hasOwn(TUNINGS, nextInstrument)) return;
    instrument = nextInstrument;
    tuningId = TUNINGS[instrument][0].id;
    lockedIndex = null;
    renderMode();
    resetReading(running ? "Suona una corda…" : "Tocca “Avvia microfono”");
    savePreferences();
  }

  function setTuning(nextTuning) {
    if (!TUNINGS[instrument].some((item) => item.id === nextTuning)) return;
    tuningId = nextTuning;
    lockedIndex = null;
    renderMode();
    resetReading(running ? "Suona una corda…" : "Tocca “Avvia microfono”");
    savePreferences();
  }

  function selectString(index) {
    const tuning = currentTuning();
    if (!tuning.strings[index]) return;
    lockedIndex = lockedIndex === index ? null : index;
    frequencyHistory.length = 0;
    lastTargetKey = "";
    renderMode();
    if (lockedIndex !== null) void playReference(tuning.strings[lockedIndex]);
  }

  function automaticTarget() {
    lockedIndex = null;
    frequencyHistory.length = 0;
    lastTargetKey = "";
    renderMode();
    elements.target.textContent = "Target automatico";
  }

  function makeTarget(string, index, harmonic = 1, measuredFrequency = null) {
    const frequency = midiToFrequency(string.midi);
    return {
      key: instrument + ":" + tuningId + ":" + index,
      index,
      name: string.name,
      midi: string.midi,
      octave: octaveForMidi(string.midi),
      frequency,
      harmonic,
      measuredFrequency
    };
  }

  function targetForFrequency(rawFrequency) {
    if (instrument === "chromatic") {
      const midi = Math.round(frequencyToMidi(rawFrequency));
      return {
        key: "chromatic:" + midi,
        index: -1,
        name: NOTE_NAMES[(midi % 12 + 12) % 12],
        midi,
        octave: octaveForMidi(midi),
        frequency: midiToFrequency(midi),
        harmonic: 1,
        measuredFrequency: rawFrequency
      };
    }

    const strings = currentTuning().strings;
    const indexes = lockedIndex === null ? strings.map((_, index) => index) : [lockedIndex];
    let best = null;

    indexes.forEach((index) => {
      const string = strings[index];
      const targetFrequency = midiToFrequency(string.midi);
      const maxHarmonic = instrument === "bass" ? 4 : 3;
      for (let harmonic = 1; harmonic <= maxHarmonic; harmonic += 1) {
        const normalized = rawFrequency / harmonic;
        const distance = Math.abs(centsFrom(normalized, targetFrequency));
        const score = distance + (harmonic - 1) * 8;
        if (!best || score < best.score) {
          best = { score, target: makeTarget(string, index, harmonic, normalized) };
        }
      }
    });

    return best.target;
  }

  function detectPitch(input, sampleRate) {
    const limits = PITCH_LIMITS[instrument];
    const factor = limits.downsample;
    const size = Math.floor(input.length / factor);
    const samples = new Float32Array(size);
    let mean = 0;

    for (let index = 0; index < size; index += 1) {
      let sum = 0;
      for (let offset = 0; offset < factor; offset += 1) sum += input[index * factor + offset];
      samples[index] = sum / factor;
      mean += samples[index];
    }

    mean /= size;
    let energy = 0;
    for (let index = 0; index < size; index += 1) {
      samples[index] -= mean;
      energy += samples[index] * samples[index];
    }

    const rms = Math.sqrt(energy / size);
    if (rms < 0.006) return { frequency: null, confidence: 0, rms };

    const effectiveRate = sampleRate / factor;
    const minTau = Math.max(2, Math.floor(effectiveRate / limits.max));
    const maxTau = Math.min(Math.floor(effectiveRate / limits.min), Math.floor(size / 2));
    const difference = new Float32Array(maxTau + 1);

    for (let tau = 1; tau <= maxTau; tau += 1) {
      let sum = 0;
      for (let index = 0; index < size - tau; index += 1) {
        const delta = samples[index] - samples[index + tau];
        sum += delta * delta;
      }
      difference[tau] = sum;
    }

    const normalized = new Float32Array(maxTau + 1);
    normalized[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau <= maxTau; tau += 1) {
      runningSum += difference[tau];
      normalized[tau] = runningSum > 0 ? (difference[tau] * tau) / runningSum : 1;
    }

    let estimate = -1;
    const threshold = instrument === "bass" ? 0.2 : 0.16;
    for (let tau = minTau; tau < maxTau; tau += 1) {
      if (normalized[tau] < threshold) {
        while (tau + 1 <= maxTau && normalized[tau + 1] < normalized[tau]) tau += 1;
        estimate = tau;
        break;
      }
    }

    if (estimate < 0) {
      let bestValue = 1;
      for (let tau = minTau; tau <= maxTau; tau += 1) {
        if (normalized[tau] < bestValue) {
          bestValue = normalized[tau];
          estimate = tau;
        }
      }
      if (bestValue > 0.28) return { frequency: null, confidence: 0, rms };
    }

    let refined = estimate;
    if (estimate > minTau && estimate < maxTau) {
      const left = normalized[estimate - 1];
      const middle = normalized[estimate];
      const right = normalized[estimate + 1];
      const denominator = 2 * (2 * middle - right - left);
      if (Math.abs(denominator) > 1e-9) refined += (right - left) / denominator;
    }

    const frequency = effectiveRate / refined;
    const confidence = clamp(1 - normalized[estimate], 0, 1);
    if (!Number.isFinite(frequency) || frequency < limits.min || frequency > limits.max || confidence < 0.54) {
      return { frequency: null, confidence, rms };
    }

    return { frequency, confidence, rms };
  }

  function updateSignal(rms, confidence) {
    const level = clamp(Math.round(rms * 850), 0, 100);
    const stable = clamp(Math.round(confidence * 100), 0, 100);
    elements.levelText.textContent = level + "%";
    elements.levelBar.style.width = level + "%";
    elements.confidenceText.textContent = confidence > 0 ? stable + "%" : "—";
    elements.confidenceBar.style.width = stable + "%";
  }

  function updateReading(rawFrequency, confidence) {
    const initialTarget = targetForFrequency(rawFrequency);
    if (initialTarget.key !== lastTargetKey) {
      frequencyHistory.length = 0;
      lastTargetKey = initialTarget.key;
    }

    frequencyHistory.push(initialTarget.measuredFrequency);
    if (frequencyHistory.length > 7) frequencyHistory.shift();
    const measured = median(frequencyHistory);
    const target = { ...initialTarget, measuredFrequency: measured };
    const cents = centsFrom(measured, target.frequency);
    const visibleCents = Math.round(clamp(cents, -199, 199));
    const pointerCents = clamp(cents, -50, 50);

    elements.note.textContent = target.name;
    elements.octave.textContent = String(target.octave);
    elements.freq.textContent = measured.toFixed(1) + " Hz";
    elements.cents.textContent = (visibleCents > 0 ? "+" : "") + visibleCents + " cents";
    elements.needle.style.transform = "translateX(-50%) rotate(" + (pointerCents * 0.9) + "deg)";

    if (instrument === "chromatic") {
      elements.target.textContent = "Target " + target.frequency.toFixed(1) + " Hz";
    } else {
      const string = currentTuning().strings[target.index];
      const harmonicNote = target.harmonic > 1 ? " · armonica filtrata" : "";
      const lockNote = lockedIndex === null ? "" : " · bloccata";
      elements.target.textContent = "Corda " + string.number + lockNote + " · target " + target.frequency.toFixed(1) + " Hz" + harmonicNote;
      renderStrings(target.index);
    }

    elements.status.className = "status";
    const absolute = Math.abs(cents);
    if (absolute <= 3) {
      elements.status.textContent = "✓ ACCORDATO";
      elements.status.classList.add("ok");
      elements.needle.style.background = "var(--ok)";
    } else if (absolute <= 10) {
      elements.status.textContent = cents < 0 ? "QUASI · ALZA POCO" : "QUASI · ABBASSA POCO";
      elements.status.classList.add("warn");
      elements.needle.style.background = "var(--warn)";
    } else if (cents < 0) {
      elements.status.textContent = "↑ ALZA";
      elements.status.classList.add("warn");
      elements.needle.style.background = "var(--warn)";
    } else {
      elements.status.textContent = "↓ ABBASSA";
      elements.status.classList.add("hot");
      elements.needle.style.background = "var(--hot)";
    }
    elements.confidenceText.textContent = Math.round(confidence * 100) + "%";
  }

  function showWaitingForSignal() {
    elements.freq.textContent = "Segnale debole · suona una corda";
    elements.status.textContent = "IN ASCOLTO";
    elements.status.className = "status";
  }

  function analysisLoop(timestamp) {
    if (!running || !analyser || !audioContext) return;
    animationFrame = requestAnimationFrame(analysisLoop);
    if (timestamp - lastAnalysisAt < 60) return;
    lastAnalysisAt = timestamp;
    analyser.getFloatTimeDomainData(sampleBuffer);
    const detection = detectPitch(sampleBuffer, audioContext.sampleRate);
    updateSignal(detection.rms, detection.confidence);
    if (detection.frequency) {
      lastPitchAt = timestamp;
      updateReading(detection.frequency, detection.confidence);
    } else if (timestamp - lastPitchAt > 850) {
      frequencyHistory.length = 0;
      lastTargetKey = "";
      showWaitingForSignal();
    }
  }

  function microphoneErrorMessage(error) {
    if (!window.isSecureContext) return "Il microfono richiede una connessione HTTPS.";
    if (error && error.name === "NotAllowedError") return "Permesso microfono negato. Apri i permessi del sito e abilita il microfono.";
    if (error && error.name === "NotFoundError") return "Nessun microfono disponibile su questo dispositivo.";
    if (error && error.name === "NotReadableError") return "Il microfono è già utilizzato da un’altra app. Chiudila e riprova.";
    return "Non riesco ad avviare il microfono. Controlla i permessi del browser e riprova.";
  }

  async function startMicrophone() {
    elements.error.textContent = "";
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        }
      });
      audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      sampleBuffer = new Float32Array(analyser.fftSize);
      running = true;
      lastAnalysisAt = 0;
      lastPitchAt = performance.now();
      elements.micDot.classList.add("on");
      elements.micPrivacy.textContent = "Microfono attivo";
      elements.startBtn.textContent = "Ferma microfono";
      elements.startBtn.classList.add("stop");
      elements.freq.textContent = "Suona una corda…";
      elements.status.textContent = "IN ASCOLTO";
      frequencyHistory.length = 0;
      animationFrame = requestAnimationFrame(analysisLoop);
    } catch (error) {
      elements.error.textContent = microphoneErrorMessage(error);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
  }

  async function stopMicrophone() {
    running = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null;
    analyser = null;
    sampleBuffer = null;
    if (audioContext) {
      await audioContext.close().catch(() => {});
      audioContext = null;
    }
    elements.micDot.classList.remove("on");
    elements.micPrivacy.textContent = "Microfono spento";
    elements.startBtn.textContent = "Avvia microfono";
    elements.startBtn.classList.remove("stop");
    resetReading();
  }

  async function toggleMicrophone() {
    if (running) await stopMicrophone();
    else await startMicrophone();
  }

  async function playReference(string) {
    try {
      if (!toneContext || toneContext.state === "closed") {
        toneContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      await toneContext.resume();
      if (activeTone) {
        try { activeTone.stop(); } catch {}
      }
      const fundamental = midiToFrequency(string.midi);
      const audibleFrequency = fundamental < 70 ? fundamental * 2 : fundamental;
      const oscillator = toneContext.createOscillator();
      const gain = toneContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = audibleFrequency;
      gain.gain.setValueAtTime(0.0001, toneContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.13, toneContext.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, toneContext.currentTime + 1.25);
      oscillator.connect(gain);
      gain.connect(toneContext.destination);
      oscillator.start();
      oscillator.stop(toneContext.currentTime + 1.3);
      activeTone = oscillator;
      oscillator.addEventListener("ended", () => {
        if (activeTone === oscillator) activeTone = null;
      });
      if (fundamental < 70) {
        elements.target.textContent = "Corda " + string.number + " bloccata · tono guida un’ottava sopra";
      }
    } catch {
      elements.error.textContent = "Il browser non riesce a riprodurre il tono di riferimento.";
    }
  }

  function setupInstall() {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    elements.installBtn.hidden = standalone;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      elements.installBtn.hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      elements.installBtn.hidden = true;
      elements.error.textContent = "INDACO Tuner installato.";
    });
    elements.installBtn.addEventListener("click", async () => {
      if (installPrompt) {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") elements.installBtn.hidden = true;
        installPrompt = null;
      } else if (isIOS) {
        elements.error.textContent = "Su iPhone: tocca Condividi, poi “Aggiungi alla schermata Home”.";
      } else {
        elements.error.textContent = "Su Chrome: apri il menu ⋮ e scegli “Installa app” o “Aggiungi a schermata Home”.";
      }
    });

    elements.updateAppBtn.addEventListener("click", async () => {
      elements.updateAppBtn.disabled = true;
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) await registration.update();
        }
        await fetch("./index.html?refresh=" + Date.now(), { cache: "no-store" });
        elements.error.textContent = "Aggiornamento controllato. Ricarico l’app…";
        window.setTimeout(() => window.location.reload(), 450);
      } catch {
        elements.error.textContent = "Aggiornamento non riuscito. Controlla la connessione.";
        elements.updateAppBtn.disabled = false;
      }
    });
  }

  async function shareTuner() {
    const shareData = {
      title: "INDACO Tuner",
      text: "Accordatore gratuito per chitarra, basso e ukulele.",
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        elements.error.textContent = "Link copiato.";
      }
    } catch (error) {
      if (!error || error.name !== "AbortError") elements.error.textContent = "Non riesco a condividere il link da questo browser.";
    }
  }

  function setupOptionalSupportLink() {
    const config = window.INDACO_CONFIG || {};
    if (!config.affiliateUrl) return;
    try {
      const url = new URL(config.affiliateUrl);
      if (url.protocol !== "https:") return;
      const box = $("supportBox");
      const link = $("supportLink");
      const disclosure = $("supportDisclosure");
      link.href = url.toString();
      link.textContent = config.affiliateLabel || "Scopri gli accessori";
      if (config.affiliateDisclosure) disclosure.textContent = config.affiliateDisclosure;
      box.hidden = false;
    } catch {
      // Invalid optional configuration remains hidden.
    }
  }

  function initialise() {
    loadPreferences();
    buildMeterTicks();
    elements.referencePitch.value = String(referencePitch);
    elements.referenceValue.textContent = referencePitch + " Hz";
    renderMode();
    resetReading();
    document.querySelectorAll(".instrument").forEach((button) => {
      button.addEventListener("click", () => setInstrument(button.dataset.instrument));
    });
    elements.tuningSelect.addEventListener("change", (event) => setTuning(event.target.value));
    elements.autoTargetBtn.addEventListener("click", automaticTarget);
    elements.startBtn.addEventListener("click", () => void toggleMicrophone());
    elements.shareBtn.addEventListener("click", () => void shareTuner());
    elements.referencePitch.addEventListener("input", (event) => {
      referencePitch = clamp(Number(event.target.value) || 440, 430, 450);
      elements.referenceValue.textContent = referencePitch + " Hz";
      frequencyHistory.length = 0;
      renderStrings();
      savePreferences();
    });
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) {
      elements.error.textContent = "Questo browser non supporta l’accesso audio necessario.";
      elements.startBtn.disabled = true;
    }
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {});
      });
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && running) void stopMicrophone();
    });
    window.addEventListener("pagehide", () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    });
    setupInstall();
    setupOptionalSupportLink();
  }

  initialise();
})();
