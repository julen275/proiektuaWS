const BILDUMA_GAKOA = 'bilduma';

class bildumaStorage {
  // localStorage-ko objektu-arrunten array-a (edo [] ezer ez badago)
  static denakLortu() {
    try {
      const gordeta = localStorage.getItem(BILDUMA_GAKOA);
      const array = gordeta ? JSON.parse(gordeta) : [];
      return Array.isArray(array) ? array : [];
    } catch (error) {
      console.error('Ezin izan da bilduma irakurri:', error);
      return [];
    }
  }

  // ID bereko elementua badago, ordezkatu egiten da (ez da bikoizten)
  static gorde(item) {
    const array = bildumaStorage.denakLortu();
    const objektua = item.toStorageObject();
    const indizea = array.findIndex(e => e.id === objektua.id);

    if (indizea >= 0) {
      array[indizea] = objektua;
    } else {
      array.push(objektua);
    }

    localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(array));
  }

  // Item instantziak itzultzen ditu
  static itemBezalaLortu() {
    return bildumaStorage.denakLortu().map(obj => Item.fromStorageObject(obj));
  }

  static ezabatu(id) {
    const array = bildumaStorage.denakLortu().filter(e => e.id !== id);
    localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(array));
  }

  static hustu() {
    localStorage.removeItem(BILDUMA_GAKOA);
  }

// 3. URRATSA: Elementu bat aldatu eta localStorage-n gordetzeko metodo berria
static eguneratu(item) {
  const array = bildumaStorage.denakLortu();
  const objektua = item.toStorageObject();
  const indizea = array.findIndex(e => e.id === objektua.id);

  if (indizea >= 0) {
    array[indizea] = objektua;
    localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(array));
  }
}

}
