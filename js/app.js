const ATALAK = {
  hasiera: { fitxategia: 'templates/hasiera.html' },
  bilatzailea: { fitxategia: 'templates/bilatzaile.html', hasieratu: hasieratuBilatzailea },
  bilduma: { fitxategia: 'templates/bilduma.html', hasieratu: hasieratuBilduma, erakutsi: erakutsiBilduma },
  kudeatuBilduma: { fitxategia: 'templates/kudeatuBilduma.html', hasieratu: hasieratuKudeatuBilduma, erakutsi: erakutsiKudeatuBilduma },
  estatistikak: { fitxategia: 'templates/estatistikak.html', erakutsi: erakutsiEstatistikak }
};

// Atala kargatu ondoren behin bakarrik exekutatzen dira
const HASIERATZAILEAK = {
  bilatzailea: hasieratuBilatzailea,
  bilduma: hasieratuBilduma,
  kudeatuBilduma: hasieratuKudeatuBilduma
};

// Atala erakusten den bakoitzean exekutatzen dira
const ERAKUSTEAN = {
  bilduma: erakutsiBilduma,
  kudeatuBilduma: erakutsiKudeatuBilduma,
  estatistikak: erakutsiEstatistikak
};

async function atalaKargatu(izena) {
  const atalaInfo = ATALAK[izena];
  const edukiontzia = document.getElementById(`atala-${izena}`);
  if (!edukiontzia) return;

  try {
    const emaitza = await fetch(atalaInfo.fitxategia);
    if (!emaitza.ok) throw new Error(`${izena} Ezin izan da kargatu`);

    edukiontzia.innerHTML = await emaitza.text();

    if (HASIERATZAILEAK[izena]) HASIERATZAILEAK[izena]();
  } catch (error) {
    edukiontzia.innerHTML = '<p>Atal hau kargatzean errorea suertatu da.</p>';
    console.error(error);
  }
}

function erakutsiAtala(izena) {
  const atala = document.getElementById(`atala-${izena}`);
  if (!atala) {
    console.error('Ez dago atal honen edukiontzirik:', izena);
    return;
  }

  document.querySelectorAll('.atala').forEach(sec => sec.classList.remove('aktiboa'));
  atala.classList.add('aktiboa');

  document.querySelectorAll('#menu-nagusia button')
    .forEach(btn => btn.classList.remove('active'));
  
  // Bilatu data-atala edo data-seccion atributua duen botoia
  const boton = document.querySelector(`#menu-nagusia button[data-atala="${izena}"]`) || 
                document.querySelector(`#menu-nagusia button[data-seccion="${izena}"]`);
  if (boton) boton.classList.add('active');

  if (ERAKUSTEAN[izena]) ERAKUSTEAN[izena]();
}

async function jaurtiApp() {
  await Promise.all(Object.keys(ATALAK).map(atalaKargatu));
  erakutsiAtala('hasiera');
}

// Menuko klikak kudeatu (onartzen ditu data-atala eta data-seccion)
const menuNagusia = document.getElementById('menu-nagusia');
if (menuNagusia) {
  menuNagusia.addEventListener('click', (event) => {
    const boton = event.target.closest('button[data-atala], button[data-seccion]');
    if (!boton) return;
    const izena = boton.dataset.atala || boton.dataset.seccion;
    erakutsiAtala(izena);
  });
}

// Kudeatu bilduma funtzioak
function hasieratuKudeatuBilduma() {
  const lista = document.getElementById('lista-kudeatu');
  const hustuBtn = document.getElementById('botoia-hustu');

  if (hustuBtn) {
    hustuBtn.onclick = () => {
      if (confirm('Ziur zaude bilduma hustu nahi duzula?')) {
        bildumaStorage.hustu();
        erakutsiKudeatuBilduma();
      }
    };
  }

  if (lista) {
    lista.onclick = (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains('btn-ezabatu')) {
        bildumaStorage.ezabatu(Number(id));
        erakutsiKudeatuBilduma();
      }

      if (e.target.classList.contains('btn-gorde')) {
        const txartela = e.target.closest('.item-kudeatu');
        const balorazioa = Number(txartela.querySelector('.input-balorazioa').value);
        const iruzkina = txartela.querySelector('.input-iruzkina').value;

        const item = bildumaStorage.itemBezalaLortu().find(i => i.id == id);
        if (item) {
          item.balorazioa = balorazioa;
          item.iruzkina = iruzkina;
          bildumaStorage.gorde(item);
          alert('Aldaketak gordet dira.');
          erakutsiKudeatuBilduma();
        }
      }
    };
  }

  erakutsiKudeatuBilduma();
}

function erakutsiKudeatuBilduma() {
  const lista = document.getElementById('lista-kudeatu');
  if (!lista) return;

  const items = bildumaStorage.itemBezalaLortu();

  if (items.length === 0) {
    lista.innerHTML = '<p>Oraindik ez duzu item-ik gorde.</p>';
    return;
  }

  lista.innerHTML = items.map(item => item.toKudeatuHTML()).join('');
}

jaurtiApp();