const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma'];

// Atala kargatu ondoren behin bakarrik exekutatzen dira
const HASIERATZAILEAK = {
  bilatzaile: hasieratuBilatzailea,
  bilduma: hasieratuBilduma,
  kudeatuBilduma: () => {}
};

// Atala erakusten den bakoitzean exekutatzen dira (edukia eguneratzeko)
const ERAKUSTEAN = {
  bilduma: erakutsiBilduma
};

async function atalaKargatu(izena) {
  const edukiontzia = document.getElementById(`atala-${izena}`);

  try {
    const emaitza = await fetch(`templates/${izena}.html`);
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
  const boton = document.querySelector(`#menu-nagusia button[data-seccion="${izena}"]`);
  if (boton) boton.classList.add('active');

  if (ERAKUSTEAN[izena]) ERAKUSTEAN[izena]();
}

async function jaurtiApp() {
  await Promise.all(ATALAK.map(atalaKargatu));
  erakutsiAtala('hasiera');
}

document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;
  erakutsiAtala(boton.dataset.seccion);
});

jaurtiApp();
