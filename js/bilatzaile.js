const MAX_EMAITZAK = 30;

const BILAKETA_MOTAK = {
  izena: { placeholder: 'Pokemonaren izena (adib. pika)', inputmode: 'text' },
  id: { placeholder: 'Pokedex zenbakia (1-1025)', inputmode: 'numeric' },
  mota: { placeholder: 'Mota (adib. fire)', inputmode: 'text' }
};

let bilaketaZenbakia = 0;   // bilaketa zaharren erantzunak baztertzeko
let xehetasunZenbakia = 0;  // hautaketa zaharren erantzunak baztertzeko
let emaitzaItemak = [];
let hautatutakoItem = null;

function hasieratuBilatzailea() {
  const form = document.getElementById('form-bilatzaile');
  const aukeratzailea = document.getElementById('select-bilaketa-mota');

  document.getElementById('motak-zerrenda').innerHTML =
    MOTAK.map(m => `<option value="${m}"></option>`).join('');

  aukeratzailea.addEventListener('change', egokituBilaketaInputa);
  egokituBilaketaInputa();

  // submit gertaera: botoia sakatzean eta Enter tekla erabiltzean
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    bilatuEtaErakutsi();
  });

  document.getElementById('emaitzak-bilaketa').addEventListener('click', hautatuEmaitza);
  document.getElementById('xehetasunak-item').addEventListener('submit', gehituBildumara);
}

function egokituBilaketaInputa() {
  const mota = document.getElementById('select-bilaketa-mota').value;
  const input = document.getElementById('input-bilaketa');

  input.placeholder = BILAKETA_MOTAK[mota].placeholder;
  input.inputMode = BILAKETA_MOTAK[mota].inputmode;

  if (mota === 'mota') {
    input.setAttribute('list', 'motak-zerrenda');
  } else {
    input.removeAttribute('list');
  }
}

async function bilatuEtaErakutsi() {
  const mota = document.getElementById('select-bilaketa-mota').value;
  const terminoa = document.getElementById('input-bilaketa').value.trim();
  const egoera = document.getElementById('egoera-bilatzen');
  const emaitzak = document.getElementById('emaitzak-bilaketa');

  if (terminoa === '') {
    egoera.textContent = 'Idatzi bilaketa-termino bat.';
    return;
  }
  if (mota === 'id' && !/^\d+$/.test(terminoa)) {
    egoera.textContent = 'ID-a zenbaki oso positiboa izan behar da.';
    return;
  }

  const zenbakia = ++bilaketaZenbakia;
  egoera.textContent = 'Kargatzen...';

  try {
    const datuak = await bilatuApi(terminoa, mota);
    if (zenbakia !== bilaketaZenbakia) return;

    emaitzaItemak = datuak.map(d => new Item(d));
    hautatutakoItem = null;
    xehetasunZenbakia++;
    document.getElementById('xehetasunak-item').innerHTML =
      '<p>Emaitzetako bat aukeratu, bere xehetasunak bistaratzeko.</p>';

    egoera.textContent = '';
    erakutsiEmaitzak();
  } catch (error) {
    if (zenbakia !== bilaketaZenbakia) return;
    console.error(error);
    egoera.textContent = 'Errorea gertatu da APIarekin konektatzean. Saiatu berriro.';
    emaitzak.innerHTML = '';
  }
}

function erakutsiEmaitzak() {
  const emaitzak = document.getElementById('emaitzak-bilaketa');

  if (emaitzaItemak.length === 0) {
    emaitzak.innerHTML = '<p>Ez da emaitzarik aurkitu.</p>';
    return;
  }

  let html = emaitzaItemak
    .slice(0, MAX_EMAITZAK)
    .map(item => item.toHTML())
    .join('');

  if (emaitzaItemak.length > MAX_EMAITZAK) {
    html += `<p>${emaitzaItemak.length} emaitzatik ${MAX_EMAITZAK} lehenak erakusten dira. Zehaztu bilaketa.</p>`;
  }

  emaitzak.innerHTML = html;
}

async function hautatuEmaitza(event) {
  const txartela = event.target.closest('.item-card');
  if (!txartela) return;

  const id = Number(txartela.dataset.id);
  const indizea = emaitzaItemak.findIndex(i => i.id === id);
  if (indizea < 0) return;

  document.querySelectorAll('#emaitzak-bilaketa .item-card.hautatua')
    .forEach(t => t.classList.remove('hautatua'));
  txartela.classList.add('hautatua');

  const panela = document.getElementById('xehetasunak-item');
  const zenbakia = ++xehetasunZenbakia;
  panela.innerHTML = '<p>Kargatzen...</p>';

  try {
    let item = emaitzaItemak[indizea];

    // Zerrendako sarrera laburrek ez dute altuerarik: xehetasun osoak eskatu
    if (item.altuera === null) {
      item = new Item(await lortuXehetasunakApi(id));
      emaitzaItemak[indizea] = item;
    }
    if (zenbakia !== xehetasunZenbakia) return;

    hautatutakoItem = item;
    panela.innerHTML = item.toXehetasunHTML(true);
  } catch (error) {
    if (zenbakia !== xehetasunZenbakia) return;
    console.error(error);
    panela.innerHTML = '<p>Ezin izan dira xehetasunak kargatu. Saiatu berriro.</p>';
  }
}

function gehituBildumara(event) {
  event.preventDefault();
  if (!hautatutakoItem || !event.target.matches('.form-gehitu')) return;

  const datuak = new FormData(event.target);
  hautatutakoItem.balorazioa = Number(datuak.get('balorazioa'));
  hautatutakoItem.iruzkina = String(datuak.get('iruzkina')).trim();
  hautatutakoItem.gordetakoData = new Date().toISOString();

  try {
    bildumaStorage.gorde(hautatutakoItem);
    event.target.querySelector('.mezua').textContent = 'Bildumara gehitu da!';
  } catch (error) {
    console.error(error);
    event.target.querySelector('.mezua').textContent = 'Ezin izan da bildumara gorde.';
  }
}
