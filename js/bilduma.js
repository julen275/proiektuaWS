let bildumaItems = [];
let bildumaHautatutakoId = null;

function hasieratuBilduma() {
  ['iragazki-balorazioa', 'iragazki-mota', 'ordena-eremua', 'ordena-norabidea']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', errenderizatuBilduma);
    });

  const lista = document.getElementById('lista-bilduma');
  if (lista) {
    lista.addEventListener('click', hautatuBildumaItema);
  }
}

// Atala erakusten den bakoitzean deitzen da (bilatzailean gordetako elementu berriak ager daitezen)
function erakutsiBilduma() {
  const lista = document.getElementById('lista-bilduma');
  if (!lista) return;

  bildumaItems = bildumaStorage.itemBezalaLortu();

  if (!bildumaItems.some(i => i.id === bildumaHautatutakoId)) {
    bildumaHautatutakoId = null;
    const xehetasuna = document.getElementById('xehetasun-bilduma');
    if (xehetasuna) {
      xehetasuna.innerHTML = '<p>Item bat aukeratu bere xehetasunak bistaratzeko.</p>';
    }
  }

  eguneratuMotaIragazkia();
  errenderizatuBilduma();
}

// Iragazkiaren aukerak bildumako elementuen generoetatik sortzen dira
function eguneratuMotaIragazkia() {
  const select = document.getElementById('iragazki-mota');
  if (!select) return;

  const aukeratuta = select.value;
  // 'motaks' ordez 'generoak' erabiltzen dugu TMDB-rekin
  const generoak = [...new Set(bildumaItems.flatMap(i => i.generoak || []))].sort();

  select.innerHTML = '<option value="">Guztiak</option>' +
    generoak.map(g => `<option value="${Item.ihes(g)}">${Item.ihes(g)}</option>`).join('');

  select.value = generoak.includes(aukeratuta) ? aukeratuta : '';
}

function konparatuItemak(a, b, eremua) {
  const x = a[eremua];
  const y = b[eremua];

  if (typeof x === 'string' && typeof y === 'string') {
    return x.localeCompare(y, 'eu', { sensitivity: 'base' });
  }
  return (x ?? 0) - (y ?? 0);
}

function errenderizatuBilduma() {
  const lista = document.getElementById('lista-bilduma');
  const kopurua = document.getElementById('bilduma-kopurua');
  if (!lista || !kopurua) return;

  const gutxienekoBalorazioa = Number(document.getElementById('iragazki-balorazioa')?.value || 0);
  const mota = document.getElementById('iragazki-mota')?.value || '';
  const eremua = document.getElementById('ordena-eremua')?.value || 'izena';
  const norabidea = document.getElementById('ordena-norabidea')?.value === 'beherantz' ? -1 : 1;

  const emaitza = bildumaItems
    .filter(item => (item.balorazioa ?? 0) >= gutxienekoBalorazioa)
    .filter(item => mota === '' || (item.generoak && item.generoak.includes(mota)))
    .sort((a, b) =>
      konparatuItemak(a, b, eremua) * norabidea || a.izena.localeCompare(b.izena));

  kopurua.textContent = `${emaitza.length} / ${bildumaItems.length} item erakusten`;

  if (bildumaItems.length === 0) {
    lista.innerHTML = '<p>Oraindik ez duzu item-ik gorde.</p>';
  } else if (emaitza.length === 0) {
    lista.innerHTML = '<p>Iragazkiekin bat datorren item-ik ez dago.</p>';
  } else {
    lista.innerHTML = emaitza.map(item => item.toHTML()).join('');
  }

  markatuBildumaHautatua();
}

function markatuBildumaHautatua() {
  const txartela = document.querySelector(
    `#lista-bilduma .item-card[data-id="${bildumaHautatutakoId}"]`
  );
  if (txartela) txartela.classList.add('hautatua');
}

function hautatuBildumaItema(event) {
  const txartela = event.target.closest('.item-card');
  if (!txartela) return;

  const item = bildumaItems.find(i => i.id === Number(txartela.dataset.id));
  if (!item) return;

  bildumaHautatutakoId = item.id;
  document.querySelectorAll('#lista-bilduma .item-card.hautatua')
    .forEach(t => t.classList.remove('hautatua'));
  markatuBildumaHautatua();

  const xehetasuna = document.getElementById('xehetasun-bilduma');
  if (xehetasuna) {
    xehetasuna.innerHTML = item.toXehetasunHTML();
  }
}