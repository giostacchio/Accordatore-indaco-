import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const marker = "  initialise();\n})();";
assert.ok(source.includes(marker), "test hook marker missing");

const hooked = source.replace(
  marker,
  "  globalThis.__INDACO_TEST__ = {\n" +
  "    detectPitch,\n" +
  "    targetForFrequency,\n" +
  "    midiToFrequency,\n" +
  "    setState(nextInstrument, nextTuning, nextReference = 440) {\n" +
  "      instrument = nextInstrument;\n" +
  "      tuningId = nextTuning;\n" +
  "      referencePitch = nextReference;\n" +
  "      lockedIndex = null;\n" +
  "    }\n" +
  "  };\n" +
  "})();"
);

function fakeElement() {
  return {
    classList: { add() {}, remove() {}, toggle() {} },
    style: { setProperty() {} },
    addEventListener() {},
    appendChild() {},
    setAttribute() {},
    querySelectorAll() { return []; },
    hidden: false,
    value: "",
    textContent: "",
    innerHTML: ""
  };
}

const sandbox = {
  console,
  document: {
    getElementById() { return fakeElement(); },
    querySelector() { return fakeElement(); },
    querySelectorAll() { return []; },
    createElement() { return fakeElement(); },
    addEventListener() {}
  },
  window: {}
};

vm.createContext(sandbox);
vm.runInContext(hooked, sandbox);
const tuner = sandbox.__INDACO_TEST__;

function sine(frequency, sampleRate = 48000, size = 8192) {
  const samples = new Float32Array(size);
  for (let index = 0; index < size; index += 1) {
    const time = index / sampleRate;
    samples[index] =
      0.62 * Math.sin(2 * Math.PI * frequency * time) +
      0.16 * Math.sin(4 * Math.PI * frequency * time);
  }
  return samples;
}

function expectPitch(instrument, tuning, frequency, tolerance) {
  tuner.setState(instrument, tuning);
  const result = tuner.detectPitch(sine(frequency), 48000);
  assert.ok(result.frequency, instrument + " pitch was not detected");
  assert.ok(
    Math.abs(result.frequency - frequency) <= tolerance,
    instrument + " expected " + frequency + " Hz, got " + result.frequency
  );
  assert.ok(result.confidence >= 0.54, instrument + " confidence too low");
}

expectPitch("bass", "bass-5", 30.8677, 0.5);
expectPitch("bass", "bass-4", 41.2034, 0.5);
expectPitch("guitar", "guitar-standard", 82.4069, 0.5);
expectPitch("ukulele", "ukulele-standard", 392, 0.8);
expectPitch("chromatic", "chromatic", 440, 0.8);

tuner.setState("bass", "bass-5");
const harmonicTarget = tuner.targetForFrequency(61.7354);
assert.equal(harmonicTarget.midi, 23);
assert.equal(harmonicTarget.harmonic, 2);
assert.ok(Math.abs(harmonicTarget.measuredFrequency - 30.8677) < 0.01);

tuner.setState("ukulele", "ukulele-standard");
assert.equal(tuner.targetForFrequency(392).midi, 67);

console.log("pitch detector and tuning maps ok");
