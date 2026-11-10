function erakutsiEstatistikak() {
    const bildumaItems = bildumaStorage.itemBezalaLortu();
    const kopuruaSpan = document.getElementById('estatistika-kopurua');
    const batezbestekoaSpan = document.getElementById('estatistika-batezbestekoa');
    const onenaSpan = document.getElementById('estatistika-onena');
    const txarrenaSpan = document.getElementById('estatistika-txarrena');
    const generoakDiv = document.getElementById('estatistika-generoak');
  
    if (!kopuruaSpan) return;
  
    if (bildumaItems.length === 0) {
      kopuruaSpan.textContent = '0';
      batezbestekoaSpan.textContent = '-';
      onenaSpan.textContent = '-';
      txarrenaSpan.textContent = '-';
      generoakDiv.innerHTML = '<p>Oraindik ez duzu pelikularik gorde estatistikak ikusteko.</p>';
      return;
    }
  
    // 1. Kopuru osoa
    const kopurua = bildumaItems.length;
    kopuruaSpan.textContent = kopurua;
  
    // 2. Batez besteko balorazioa reduce() erabiliz
    const balorazioakDaukatenak = bildumaItems.filter(i => i.balorazioa !== null);
    const batura = balorazioakDaukatenak.reduce((akts, item) => akts + item.balorazioa, 0);
    const batezbestekoa = balorazioakDaukatenak.length > 0 ? (batura / balorazioakDaukatenak.length).toFixed(1) : '-';
    batezbestekoaSpan.textContent = batezbestekoa !== '-' ? `${batezbestekoa} / 5` : 'Baloraziorik ez';
  
    // 3. Balorazio onena eta txarrena reduce() erabiliz
    if (balorazioakDaukatenak.length > 0) {
      const onena = bildumaItems.reduce((max, item) => (item.balorazioa ?? 0) > (max.balorazioa ?? 0) ? item : max);
      const txarrena = bildumaItems.reduce((min, item) => (item.balorazioa ?? 5) < (min.balorazioa ?? 5) ? item : min);
  
      onenaSpan.textContent = `${onena.izena} (${onena.balorazioa}★)`;
      txarrenaSpan.textContent = `${txarrena.izena} (${txarrena.balorazioa}★)`;
    } else {
      onenaSpan.textContent = '-';
      txarrenaSpan.textContent = '-';
    }
  
    // 4. Genero bakoitzeko kopurua (reduce erabiliz)
    const generoKontaketa = bildumaItems.reduce((akts, item) => {
      (item.generoak || []).forEach(g => {
        akts[g] = (akts[g] || 0) + 1;
      });
      return akts;
    }, {});
  
    const generoHtml = Object.entries(generoKontaketa)
      .map(([generoa, kop]) => `<p><strong>${Item.ihes(generoa)}:</strong> ${kop} pelikula</p>`)
      .join('');
  
    generoakDiv.innerHTML = generoHtml || '<p>Ez dago genero daturik.</p>';
  }