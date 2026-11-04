
const API_BASE_URL = "https://api.themoviedb.org/3";

const API_TOKEN = "ZURE_API_TOKENA";

async function bilatuApi(terminoa, mota = "movie") {

  const bilaketa = terminoa.trim();

  if (bilaketa === "") {
    return [];
  }

  const url = `${API_BASE_URL}/search/${mota}?query=${encodeURIComponent(bilaketa)}&language=es-ES`;

  const erantzuna = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`
    }
  });

  if (!erantzuna.ok) {
    throw new Error(`Errorea APIan: ${erantzuna.status}`);
  }

  const datuak = await erantzuna.json();

  return datuak.results;
}
