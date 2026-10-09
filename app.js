// Each unit's factor converts it to the category's base unit.
const CATEGORIES = {
  length: {
    label: "Length",
    units: {
      m: { name: "Meter (m)", factor: 1 },
      km: { name: "Kilometer (km)", factor: 1000 },
      cm: { name: "Centimeter (cm)", factor: 0.01 },
      mm: { name: "Millimeter (mm)", factor: 0.001 },
      um: { name: "Micrometer (µm)", factor: 1e-6 },
      in: { name: "Inch (in)", factor: 0.0254 },
      ft: { name: "Foot (ft)", factor: 0.3048 },
      yd: { name: "Yard (yd)", factor: 0.9144 },
      mi: { name: "Mile (mi)", factor: 1609.344 },
      nmi: { name: "Nautical mile (nmi)", factor: 1852 },
    },
    defaults: ["m", "ft"],
  },
  mass: {
    label: "Mass",
    units: {
      kg: { name: "Kilogram (kg)", factor: 1 },
      g: { name: "Gram (g)", factor: 0.001 },
      mg: { name: "Milligram (mg)", factor: 1e-6 },
      t: { name: "Metric ton (t)", factor: 1000 },
      lb: { name: "Pound (lb)", factor: 0.45359237 },
      oz: { name: "Ounce (oz)", factor: 0.028349523125 },
      slug: { name: "Slug", factor: 14.59390294 },
    },
    defaults: ["kg", "lb"],
  },
  pressure: {
    label: "Pressure",
    units: {
      Pa: { name: "Pascal (Pa)", factor: 1 },
      kPa: { name: "Kilopascal (kPa)", factor: 1e3 },
      MPa: { name: "Megapascal (MPa)", factor: 1e6 },
      bar: { name: "Bar", factor: 1e5 },
      atm: { name: "Atmosphere (atm)", factor: 101325 },
      psi: { name: "PSI (lbf/in²)", factor: 6894.757293 },
      mmHg: { name: "mmHg", factor: 133.322387 },
      torr: { name: "Torr", factor: 101325 / 760 },
    },
    defaults: ["bar", "psi"],
  },
  energy: {
    label: "Energy",
    units: {
      J: { name: "Joule (J)", factor: 1 },
      kJ: { name: "Kilojoule (kJ)", factor: 1e3 },
      MJ: { name: "Megajoule (MJ)", factor: 1e6 },
      cal: { name: "Calorie (cal)", factor: 4.184 },
      kcal: { name: "Kilocalorie (kcal)", factor: 4184 },
      Wh: { name: "Watt-hour (Wh)", factor: 3600 },
      kWh: { name: "Kilowatt-hour (kWh)", factor: 3.6e6 },
      BTU: { name: "BTU", factor: 1055.05585 },
      ftlbf: { name: "Foot-pound (ft·lbf)", factor: 1.3558179483 },
      eV: { name: "Electronvolt (eV)", factor: 1.602176634e-19 },
    },
    defaults: ["kWh", "BTU"],
  },
  temperature: {
    label: "Temperature",
    // Temperature needs offsets, so each unit converts to/from Kelvin.
    units: {
      C: { name: "Celsius (°C)", toBase: (v) => v + 273.15, fromBase: (k) => k - 273.15 },
      F: { name: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9 + 273.15, fromBase: (k) => (k - 273.15) * 9 / 5 + 32 },
      K: { name: "Kelvin (K)", toBase: (v) => v, fromBase: (k) => k },
      R: { name: "Rankine (°R)", toBase: (v) => v * 5 / 9, fromBase: (k) => k * 9 / 5 },
    },
    defaults: ["C", "F"],
  },
};

const tabsEl = document.querySelector(".tabs");
const fromValue = document.getElementById("fromValue");
const toValue = document.getElementById("toValue");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const swapBtn = document.getElementById("swap");
const formulaEl = document.getElementById("formula");

let current = "length";

function convert(value, category, from, to) {
  const units = CATEGORIES[category].units;
  if (units[from].toBase) {
    return units[to].fromBase(units[from].toBase(value));
  }
  return (value * units[from].factor) / units[to].factor;
}

function format(n) {
  if (!isFinite(n)) return "";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9 || abs < 1e-6) return n.toExponential(6);
  return parseFloat(n.toPrecision(10)).toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function update() {
  const value = parseFloat(fromValue.value);
  if (isNaN(value)) {
    toValue.value = "";
    formulaEl.textContent = "";
    return;
  }
  toValue.value = format(convert(value, current, fromUnit.value, toUnit.value));
  const one = convert(1, current, fromUnit.value, toUnit.value);
  formulaEl.textContent = current === "temperature"
    ? `${format(value)} ${fromUnit.value} = ${toValue.value} ${toUnit.value}`
    : `1 ${fromUnit.value} = ${format(one)} ${toUnit.value}`;
}

function fillSelect(select, units, selected) {
  select.innerHTML = Object.entries(units)
    .map(([key, u]) => `<option value="${key}">${u.name}</option>`)
    .join("");
  select.value = selected;
}

function selectCategory(key) {
  current = key;
  const cat = CATEGORIES[key];
  document.querySelectorAll(".tab").forEach((t) => {
    const active = t.dataset.key === key;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active);
  });
  fillSelect(fromUnit, cat.units, cat.defaults[0]);
  fillSelect(toUnit, cat.units, cat.defaults[1]);
  update();
}

tabsEl.innerHTML = Object.entries(CATEGORIES)
  .map(([key, c]) => `<button class="tab" role="tab" data-key="${key}">${c.label}</button>`)
  .join("");

tabsEl.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (tab) selectCategory(tab.dataset.key);
});

fromValue.addEventListener("input", update);
fromUnit.addEventListener("change", update);
toUnit.addEventListener("change", update);

swapBtn.addEventListener("click", () => {
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
  update();
});

selectCategory(current);

// Mechanical power: P = T × ω
const torqueEl = document.getElementById("torque");
const torqueUnit = document.getElementById("torqueUnit");
const speedEl = document.getElementById("speed");
const speedUnit = document.getElementById("speedUnit");
const powerKw = document.getElementById("powerKw");
const powerHp = document.getElementById("powerHp");
const omegaEl = document.getElementById("omega");
const powerFormula = document.getElementById("powerFormula");

const WATTS_PER_HP = 745.69987158; // mechanical horsepower

function updatePower() {
  const torque = parseFloat(torqueEl.value);
  const speed = parseFloat(speedEl.value);
  if (isNaN(torque) || isNaN(speed)) {
    powerKw.textContent = powerHp.textContent = omegaEl.textContent = "—";
    powerFormula.textContent = "";
    return;
  }
  const torqueNm = torque * parseFloat(torqueUnit.value);
  const omega = speedUnit.value === "rpm" ? (speed * 2 * Math.PI) / 60 : speed;
  const watts = torqueNm * omega;

  powerKw.textContent = Math.abs(watts) >= 1000 ? `${format(watts / 1000)} kW` : `${format(watts)} W`;
  powerHp.textContent = `${format(watts / WATTS_PER_HP)} hp`;
  omegaEl.textContent = `${format(omega)} rad/s`;
  powerFormula.textContent = `P = ${format(torqueNm)} N·m × ${format(omega)} rad/s = ${format(watts)} W`;
}

[torqueEl, speedEl].forEach((el) => el.addEventListener("input", updatePower));
[torqueUnit, speedUnit].forEach((el) => el.addEventListener("change", updatePower));
updatePower();

// Dark mode: the initial theme is set by the inline script in <head>.
const themeToggle = document.getElementById("themeToggle");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function savedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  themeToggle.textContent = dark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

applyTheme(document.documentElement.getAttribute("data-theme"));

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// Follow the computer's theme until the user picks one.
systemDark.addEventListener("change", (e) => {
  if (!savedTheme()) applyTheme(e.matches ? "dark" : "light");
});
