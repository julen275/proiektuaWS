// PokéAPI: https://pokeapi.co/docs/v2  (ez du key-rik behar)
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_KOPURUA = 1025; // forma alternatiboak (id > 10000) kanpoan uzten dira

const MOTAK = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

let izenenZerrenda = null; // cachea: izenaren bilaketarako zerrenda osoa behin bakarrik eskatzen da

// GET eskaera; 404 bada null itzultzen du (ez dago elementurik)
async function eskatuApi(bidea) {
  const erantzuna = await fetch(`${API_BASE_URL}/${bidea}`);

  if (erantzuna.status === 404) {
    return null;
  }
  if (!erantzuna.ok) {
    throw new Error(`Errorea APIan: ${erantzuna.status}`);
  }
  return erantzuna.json();
}

async function lortuIzenenZerrenda() {
  if (!izenenZerrenda) {
    const datuak = await eskatuApi(`pokemon?limit=${POKEMON_KOPURUA}`);
    izenenZerrenda = datuak.results;
  }
  return izenenZerrenda;
}

// mota: "izena" (izenaren zati baten arabera), "id" (Pokedex zenbakia) edo "mota" (mota elementala)
// Item konstruktoreak jasotzen duen JSON-ak dituen array bat itzultzen du.
async function bilatuApi(terminoa, mota = 'izena') {
  const bilaketa = terminoa.trim().toLowerCase();

  if (bilaketa === '') {
    return [];
  }

  if (mota === 'id') {
    const pokemona = await eskatuApi(`pokemon/${encodeURIComponent(bilaketa)}`);
    return pokemona ? [pokemona] : [];
  }

  if (mota === 'mota') {
    const datuak = await eskatuApi(`type/${encodeURIComponent(bilaketa)}`);
    if (!datuak) return [];
    return datuak.pokemon
      .map(p => p.pokemon)
      .filter(p => Item.idLortuUrltik(p.url) <= POKEMON_KOPURUA);
  }

  const zerrenda = await lortuIzenenZerrenda();
  return zerrenda.filter(p => p.name.includes(bilaketa));
}

// Pokemon baten xehetasun osoak (motak, altuera, pisua...)
async function lortuXehetasunakApi(id) {
  const pokemona = await eskatuApi(`pokemon/${id}`);
  if (!pokemona) {
    throw new Error(`Ez da ${id} ID-a duen elementurik aurkitu`);
  }
  return pokemona;
}
