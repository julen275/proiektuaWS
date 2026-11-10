class Item {
  static IRUDI_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  // ApiDatuak: PokéAPIk itzulitako JSONa. Bi forma izan ditzake:
  //  - zerrendako sarrera laburra: { name, url }
  //  - elementu osoa (/pokemon/{id}): { id, name, types, height, weight, ... }
  constructor(ApiDatuak) {
    this.id = ApiDatuak.id ?? Item.idLortuUrltik(ApiDatuak.url);
    this.izena = ApiDatuak.name;
    this.irudia = `${Item.IRUDI_URL}${this.id}.png`;

    this.motaks = (ApiDatuak.types ?? []).map(t => t.type.name);
    // PokéAPIk altuera dezimetrotan eta pisua hektogramotan ematen ditu
    this.altuera = ApiDatuak.height != null ? ApiDatuak.height / 10 : null;
    this.pisua = ApiDatuak.weight != null ? ApiDatuak.weight / 10 : null;

    this.balorazioa = null;
    this.iruzkina = '';
    this.gordetakoData = null;
  }

  static idLortuUrltik(url) {
    return Number(url.split('/').filter(Boolean).pop());
  }

  static ihes(testua) {
    const ordezkoak = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(testua ?? '').replace(/[&<>"']/g, c => ordezkoak[c]);
  }

  // Txartel laburra (emaitzen zerrendan eta bildumaren zerrendan erabiltzeko)
  toHTML() {
    const balorazioa = this.balorazioa !== null
      ? `<p class="item-balorazioa">${'★'.repeat(this.balorazioa)}${'☆'.repeat(5 - this.balorazioa)}</p>`
      : '';

    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${Item.ihes(this.irudia)}" alt="${Item.ihes(this.izena)}" loading="lazy">
        <h3>${Item.ihes(this.izena)}</h3>
        ${balorazioa}
      </div>
    `;
  }

  // Propietate guztiak. formularioa = true bada, balorazioa eta iruzkina sartzeko formularioa gehitzen da.
  toXehetasunHTML(formularioa = false) {
    const motak = this.motaks.length
      ? this.motaks.map(m => `<span class="etiketa">${Item.ihes(m)}</span>`).join(' ')
      : '-';
    const altuera = this.altuera !== null ? `${this.altuera} m` : '-';
    const pisua = this.pisua !== null ? `${this.pisua} kg` : '-';

    let erabiltzailearenDatuak = '';
    if (this.balorazioa !== null) {
      const data = this.gordetakoData
        ? new Date(this.gordetakoData).toLocaleString('eu')
        : '-';
      erabiltzailearenDatuak = `
        <p><strong>Balorazioa:</strong> ${this.balorazioa}/5</p>
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
        <p><strong>Motak:</strong> ${motak}</p>
        <p><strong>Altuera:</strong> ${altuera}</p>
        <p><strong>Pisua:</strong> ${pisua}</p>
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
      motaks: this.motaks,
      altuera: this.altuera,
      pisua: this.pisua,
      balorazioa: this.balorazioa,
      iruzkina: this.iruzkina,
      gordetakoData: this.gordetakoData
    };
  }

  static fromStorageObject(obj) {
    const item = new Item({ id: obj.id, name: obj.izena });
    item.irudia = obj.irudia ?? item.irudia;
    item.motaks = obj.motaks ?? [];
    item.altuera = obj.altuera ?? null;
    item.pisua = obj.pisua ?? null;
    item.balorazioa = obj.balorazioa ?? null;
    item.iruzkina = obj.iruzkina ?? '';
    item.gordetakoData = obj.gordetakoData ?? null;
    return item;
  }
}
