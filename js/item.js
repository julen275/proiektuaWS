class Item {
  static IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // ApiDatuak: TMDB-k itzulitako JSONa. Bi forma izan ditzake:
  //  - zerrendako sarrera laburra / bilaketa: { id, title, poster_path, release_date, vote_average, ... }
  //  - elementu osoa (/movie/{id}): { id, title, poster_path, release_date, vote_average, runtime, genres, ... }
  static GENERO_ITZULPENAK = {
    'Acción': 'Akzioa',
    'Aventura': 'Abentura',
    'Ciencia ficción': 'Zientzia fikzioa',
    'Comedia': 'Komedia',
    'Drama': 'Drama',
    'Terror': 'Beldurra',
    'Animación': 'Animazioa',
    'Familia': 'Familia',
    'Misterio': 'Misterioa',
    'Suspense': 'Suspensea',
    'Fantasía': 'Fantasia'
  };

  static itzuliGeneroa(generoa) {
    return Item.GENERO_ITZULPENAK[generoa] || generoa;
  }
  
  constructor(ApiDatuak) {
    this.id = ApiDatuak.id;
    this.izena = ApiDatuak.title || ApiDatuak.name; // Filmen izenburua
    
    // Irudiaren kudeaketa TMDB-rekin
    if (ApiDatuak.poster_path) {
      this.irudia = `${Item.IMG_BASE_URL}${ApiDatuak.poster_path}`;
    } else {
      this.irudia = 'img/placeholder.png'; // Irudirik ez badago
    }

    // Generoak (TMDB-n array objektuak dira: [{id, name}, ...])
    this.generoak = (ApiDatuak.genres ?? []).map(g => g.name);
    
    // Filmen datu erabilgarriak altuera/pisuaren ordez
    this.data = ApiDatuak.release_date ?? '-';
    this.puntuazioa = ApiDatuak.vote_average != null ? ApiDatuak.vote_average : null;

    this.balorazioa = null;
    this.iruzkina = '';
    this.gordetakoData = null;
  }

  static ihes(testua) {
    const ordezkoak = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(testua ?? '').replace(/[&<>"']/g, c => ordezkoak[c]);
  }

  // Txartel laburra (emaitzen zerrendan eta bildumaren zerrendan erabiltzeko)
 // Txartel laburra (emaitzen zerrendan eta bildumaren zerrendan erabiltzeko)
  toHTML() {
    const balorazioa = this.balorazioa !== null
      ? `<p class="item-balorazioa">${'★'.repeat(this.balorazioa)}${'☆'.repeat(5 - this.balorazioa)}</p>`
      : '';

    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${Item.ihes(this.irudia)}" alt="${Item.ihes(this.izena)}" loading="lazy">
        <h3>${Item.ihes(this.izena)}</h3>
        <p class="item-data">${Item.ihes(this.data)}</p>
        ${balorazioa}
      </div>
    `;
  }

  // Propietate guztiak. formularioa = true bada, balorazioa eta iruzkina sartzeko formularioa gehitzen da.
 toXehetasunHTML(formularioa = false) {
    const generoak = this.generoak.length
      ? this.generoak
          .map(g => `<span class="etiketa">${Item.ihes(Item.itzuliGeneroa(g))}</span>`)
          .join(' ')
      : '-';
    const puntuazioaTestua = this.puntuazioa !== null ? `${this.puntuazioa} / 10` : '-';

    let erabiltzailearenDatuak = '';
    if (this.balorazioa !== null) {
      const data = this.gordetakoData
        ? new Date(this.gordetakoData).toLocaleString('eu')
        : '-';
      erabiltzailearenDatuak = `
        <p><strong>Nire balorazioa:</strong> ${this.balorazioa}/5</p>
        <p><strong>Iruzkina:</strong> ${Item.ihes(this.iruzkina) || '-'}</p>
        <p><strong>Gordetako data:</strong> ${data}</p>
      `;
    }

    const form = formularioa ? `
      <form class="form-gehitu">
        <p>
          <label>Balorazioa (1-5)
            <select name="balorazioa" required>
              <option value="" disabled selected>Aukeratu...</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
        </p>
        <p>
          <label>Iruzkina<br>
            <textarea name="iruzkina" rows="3" maxlength="300"></textarea>
          </label>
        </p>
        <button type="submit">Gehitu bildumara</button>
        <p class="mezua" role="status"></p>
      </form>
    ` : '';

    return `
      <div class="item-xehetasunak" data-id="${this.id}">
        <img src="${Item.ihes(this.irudia)}" alt="${Item.ihes(this.izena)}">
        <h4>${Item.ihes(this.izena)}</h4>
        <p><strong>ID:</strong> ${this.id}</p>
        <p><strong>Estreinaldia:</strong> ${Item.ihes(this.data)}</p>
        <p><strong>Puntuazioa (TMDB):</strong> ${puntuazioaTestua}</p>
        <p><strong>Generoak:</strong> ${generoak}</p>
        ${erabiltzailearenDatuak}
        ${form}
      </div>
    `;
  }

  toStorageObject() {
    return {
      id: this.id,
      izena: this.izena,
      irudia: this.irudia,
      generoak: this.generoak,
      data: this.data,
      puntuazioa: this.puntuazioa,
      balorazioa: this.balorazioa,
      iruzkina: this.iruzkina,
      gordetakoData: this.gordetakoData
    };
  }

  static fromStorageObject(obj) {
    const item = new Item({ id: obj.id, title: obj.izena });
    item.irudia = obj.irudia ?? item.irudia;
    item.generoak = obj.generoak ?? [];
    item.data = obj.data ?? '-';
    item.puntuazioa = obj.puntuazioa ?? null;
    item.balorazioa = obj.balorazioa ?? null;
    item.iruzkina = obj.iruzkina ?? '';
    item.gordetakoData = obj.gordetakoData ?? null;
    return item;
  }

  toKudeatuHTML() {
    return `
      <div class="item-kudeatu" data-id="${this.id}">
        <img src="${this.irudia}" alt="${this.izena}" width="70">
        <h3>${this.izena}</h3>
        
        <label>Balorazioa:</label>
        <input type="number" class="input-balorazioa" min="1" max="5" value="${this.balorazioa || 1}">
        
        <label>Iruzkina:</label>
        <textarea class="input-iruzkina">${this.iruzkina || ''}</textarea>
        
        <button class="btn-gorde" data-id="${this.id}">Gorde</button>
        <button class="btn-ezabatu" data-id="${this.id}">Ezabatu</button>
      </div>
    `;
  }
}