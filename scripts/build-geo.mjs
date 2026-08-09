// Generates the static country / state / city files served from public/geo.
//
// Data by Countries States Cities Database
// https://github.com/dr5hn/countries-states-cities-database | ODbL v1.0
//
// Run manually whenever the upstream dataset should be refreshed:
//   node scripts/build-geo.mjs
// The generated files are committed, so a normal `npm run dev` / `npm run build`
// never touches the network.

import { readFileSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'geo');

const BASE = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json';
const COUNTRIES_URL = `${BASE}/countries.json`;
// The only export with the full three-level nesting we need. It is ~46 MB, which
// is why this is a one-off prep step rather than something the app does at runtime.
const NESTED_URL = `${BASE}/countries+states+cities.json`;
// The nested export omits `parent_id`, and without it the two administrative
// levels some countries have are indistinguishable — Bangladesh's 8 divisions
// and its 64 districts are all just "states" there. This export carries the
// hierarchy, so it decides which entries belong in the State dropdown.
const STATES_URL = `${BASE}/states.json`;

async function fetchJson(url) {
  process.stdout.write(`  fetching ${url} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const text = await res.text();
  console.log(`${(text.length / 1_048_576).toFixed(1)} MB`);
  return JSON.parse(text);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Upstream place names arrive with typographic apostrophes ("Lu’an" beside
 * "Lu'an"), stray trailing punctuation ("Yulin,") and doubled spaces, which show
 * up as the same place listed twice. Only punctuation and whitespace are
 * touched — accents are left alone, because Tapira and Tapiraí really are two
 * different Brazilian municipalities.
 */
function cleanName(raw) {
  return (raw ?? '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;.\-]+|[\s,;.\-]+$/g, '')
    .trim();
}

/**
 * Bangladesh is this product's home market, and the dataset serves it badly: it
 * carries both the historic and current spellings of the same district (Bogra
 * *and* Bogura, Chittagong *and* Chattogram), giving 71 entries for 64 real
 * districts. The backend already ships a curated district→division table, so
 * Bangladesh is built from that instead — 8 divisions, 64 districts, current
 * official spellings, and identical to what `profiles.district` already stores.
 */
const BD_GEO_PATH = join(ROOT, '..', 'backend', 'src', 'common', 'data', 'bd-geo.json');

function buildBangladesh() {
  const entries = JSON.parse(readFileSync(BD_GEO_PATH, 'utf-8'));
  const cities = {};
  for (const { district, division } of entries) {
    (cities[division] ??= []).push(district);
  }
  for (const list of Object.values(cities)) list.sort((a, b) => a.localeCompare(b));

  const states = Object.keys(cities)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ code: name, name }));

  return { states, cities, districtCount: entries.length };
}

async function writeJson(relPath, data) {
  const file = join(OUT, relPath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data), 'utf-8');
  return file;
}

async function main() {
  console.log('Building public/geo from the dr5hn countries-states-cities database\n');

  const [countriesRaw, nested, statesRaw] = await Promise.all([
    fetchJson(COUNTRIES_URL),
    fetchJson(NESTED_URL),
    fetchJson(STATES_URL),
  ]);

  // id -> parent id, for every state that sits below another one. `id` is a
  // number upstream while `parent_id` is a string, so both are coerced.
  const parentOf = new Map();
  for (const s of statesRaw) {
    if (s.parent_id != null && s.parent_id !== '') {
      parentOf.set(Number(s.id), Number(s.parent_id));
    }
  }

  /** Walks up to the top-level administrative division a state belongs to. */
  function topLevelIdOf(stateId) {
    let id = Number(stateId);
    const seen = new Set();
    while (parentOf.has(id) && !seen.has(id)) {
      seen.add(id);
      id = parentOf.get(id);
    }
    return id;
  }

  // Wipe first so a country dropped upstream doesn't linger. Windows keeps a
  // lock on the directory while a dev server is watching public/, so a failed
  // clean is not fatal — every file below is rewritten unconditionally.
  try {
    await rm(OUT, { recursive: true, force: true });
  } catch (err) {
    console.warn(`\n  could not clear ${OUT} (${err.code}) — overwriting in place`);
  }
  await mkdir(OUT, { recursive: true });

  // countries.json — trimmed to what the dropdown actually renders.
  const countries = countriesRaw
    .filter((c) => c.iso2 && c.name)
    .map((c) => ({
      iso2: c.iso2,
      name: cleanName(c.name),
      emoji: c.emoji ?? '',
      phonecode: String(c.phonecode ?? ''),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  await writeJson('countries.json', countries);
  console.log(`\n  countries.json — ${countries.length} countries`);

  let stateCount = 0;
  let cityCount = 0;
  let countriesWithoutStates = 0;

  for (const country of nested) {
    const iso2 = country.iso2;
    if (!iso2) continue;

    if (iso2 === 'BD') {
      const bd = buildBangladesh();
      stateCount += bd.states.length;
      cityCount += bd.districtCount;
      await writeJson(join('states', 'BD.json'), bd.states);
      await writeJson(join('cities', 'BD.json'), bd.cities);
      console.log(`  BD          — curated: ${bd.states.length} divisions, ${bd.districtCount} districts`);
      continue;
    }

    const rawStates = Array.isArray(country.states) ? country.states : [];

    // 22 countries model two administrative levels as "states": Bangladesh has
    // 8 divisions *and* the 64 districts inside them, the UK has 4 countries and
    // 217 councils, and so on. Only the top level belongs in a field labelled
    // State/Division — listing both put "Rajbari" (a district) next to
    // "Rajshahi" (a division) and read as nonsense.
    //
    // So: top-level entries become the states, and everything below them folds
    // into the parent's city list, which is where a district-sized place
    // actually belongs in a country → state → city cascade.
    const topLevel = new Map(); // id -> { name, cities:Set }
    const orphans = new Map(); // name -> Set, for states whose parent is missing

    for (const state of rawStates) {
      const name = cleanName(state.name);
      if (!name) continue;
      if (parentOf.has(Number(state.id))) continue;
      topLevel.set(Number(state.id), { name, cities: new Set() });
    }

    for (const state of rawStates) {
      const name = cleanName(state.name);
      if (!name) continue;
      const cityNames = (Array.isArray(state.cities) ? state.cities : [])
        .map((c) => cleanName(c.name))
        .filter(Boolean);

      const isChild = parentOf.has(Number(state.id));
      const bucket = topLevel.get(topLevelIdOf(state.id));

      if (!bucket) {
        // One upstream row — Spain's "Asturias" province — has a parent_id
        // pointing at itself, so the walk above cannot resolve it. Fold such a
        // state into the top-level entry that names it ("Asturias, Principality
        // of") rather than listing the same region twice; all 77 of its cities
        // hang off the province, so dropping it instead would lose them.
        const host = [...topLevel.values()].find(
          (b) => b.name === name || new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i').test(b.name),
        );
        if (host) {
          host.cities.add(name);
          cityNames.forEach((c) => host.cities.add(c));
          continue;
        }
        // Genuinely parentless — keep the state rather than drop it.
        const set = orphans.get(name) ?? new Set();
        cityNames.forEach((c) => set.add(c));
        orphans.set(name, set);
        continue;
      }

      // A child state is itself a place worth picking (Rajbari, Camden), so it
      // joins its parent's city list alongside the cities it contains.
      if (isChild) bucket.cities.add(name);
      cityNames.forEach((c) => bucket.cities.add(c));
    }

    for (const [name, set] of orphans) {
      if (![...topLevel.values()].some((b) => b.name === name)) {
        topLevel.set(`orphan:${name}`, { name, cities: set });
      }
    }

    // Upstream names carry stray whitespace ("Dhaka "), and trimming can leave
    // two top-level entries with the same name — merge those city lists.
    const byName = new Map();
    for (const { name, cities: set } of topLevel.values()) {
      const existing = byName.get(name);
      if (existing) set.forEach((c) => existing.add(c));
      else byName.set(name, new Set(set));
    }

    // states/{ISO2}.json — [{ code, name }]
    // The trimmed name doubles as the code: state_code is absent or ambiguous
    // for a lot of countries, and the name is what gets stored on the profile
    // anyway, so keying the city index by it keeps the two in sync.
    const states = [...byName.keys()].sort((a, b) => a.localeCompare(b)).map((name) => ({ code: name, name }));

    // cities/{ISO2}.json — { [stateCode]: string[] }
    // One file per country rather than per state: the picker fetches it once and
    // then switching between that country's states costs nothing.
    const cities = {};
    for (const [name, set] of byName) {
      if (!set.size) continue;
      const names = [...set].sort((a, b) => a.localeCompare(b));
      cities[name] = names;
      cityCount += names.length;
    }

    // 21 countries (Vatican, Pitcairn, Macao, …) have neither states nor cities
    // upstream. Their files are written empty on purpose — LocationPicker falls
    // back to a free-text city input whenever there are no options to offer.
    if (states.length === 0) countriesWithoutStates += 1;

    stateCount += states.length;
    await writeJson(join('states', `${iso2}.json`), states);
    await writeJson(join('cities', `${iso2}.json`), cities);
  }

  await writeFile(
    join(OUT, 'ATTRIBUTION.txt'),
    [
      'Data by Countries States Cities Database',
      'https://github.com/dr5hn/countries-states-cities-database | ODbL v1.0',
      '',
      'Generated by scripts/build-geo.mjs — do not edit these files by hand.',
      '',
    ].join('\n'),
    'utf-8',
  );

  console.log(`  states/     — ${stateCount} states across ${nested.length} countries`);
  console.log(`  cities/     — ${cityCount} cities (${countriesWithoutStates} countries have no states)`);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nbuild-geo failed:', err);
  process.exit(1);
});
