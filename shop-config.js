window.PetitConfig = {
  shopName: 'Petit Nuvem',
  shopEmail: 'encomendas@petitnuvem.pt',
  currency: 'EUR',
  locale: 'pt-PT',
  ivaRate: 0.23,
  pricesIncludeVat: true,
  freeShippingFrom: 40,
  shipping: {
    continente: { id: 'continente', label: 'CTT Continente', detail: '2 a 4 dias úteis', price: 3.9 },
    ilhas: { id: 'ilhas', label: 'Açores e Madeira', detail: '4 a 8 dias úteis', price: 8.9 },
    pickup: { id: 'pickup', label: 'Levantamento', detail: 'Combinado por e-mail', price: 0 }
  },
  bank: {
    name: 'Petit Nuvem, Lda.',
    iban: 'PT50 0000 0000 0000 0000 0000 0',
    nif: '000000000'
  },
  stripePublishableKey: '',
  acceptOrders: true
};
