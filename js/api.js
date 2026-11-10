// TMDB (The Movie Database) API
const API_KEY = '60cd32703941e18f6b57177e188f993b';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// GET eskaera TMDB APIra
async function eskatuApi(bidea) {
  const banatzailea = bidea.includes('?') ? '&' : '?';
  const url = `${API_BASE_URL}/${bidea}${banatzailea}api_key=${API_KEY}&language=es-ES`;

  const erantzuna = await fetch(url);

  if (erantzuna.status === 404) {
    return null;
  }
  if (!erantzuna.ok) {
    throw new Error(`Errorea TMDB APIan: ${erantzuna.status}`);
  }
  return erantzuna.json();
}

// Bilaketa egiteko funtzioa (filmen izenaren edo IDaren arabera)
async function bilatuApi(terminoa, mota = 'izena') {
  const bilaketa = terminoa.trim();
  if (bilaketa === '') return [];

  if (mota === 'id') {
    const filma = await eskatuApi(`movie/${encodeURIComponent(bilaketa)}`);
    return filma ? [filma] : [];
  }

  // TMDB-n izenez bilatzeko endpoint-a: /search/movie
  const datuak = await eskatuApi(`search/movie?query=${encodeURIComponent(bilaketa)}`);
  return datuak && datuak.results ? datuak.results : [];
}

// Film baten xehetasun osoak lortzeko ID bidez
async function lortuXehetasunakApi(id) {
  const filma = await eskatuApi(`movie/${id}`);
  if (!filma) {
    throw new Error(`Ez da ${id} ID-a duen filma aurkitu`);
  }
  return filma;
}