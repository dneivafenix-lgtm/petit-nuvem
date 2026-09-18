window.PetitCatalog = (() => {
  const products = [
    {id:1,name:'Caixinhas para sopa',category:'meal',price:12.90,desc:'Um conjunto de pequenos recipientes com tampa para organizar as porções das primeiras refeições.',tag:'Primeiras colheradas'},
    {id:2,name:'Os primeiros talheres',category:'meal',price:8.90,desc:'Uma colher e um garfo pequenos para os momentos de descoberta à mesa.'},
    {id:3,name:'Tigela com ventosa',category:'meal',price:11.90,desc:'Uma tigela pequena com base de ventosa, pensada para acompanhar as refeições.'},
    {id:4,name:'Copinho de aprendizagem',category:'meal',price:9.90,desc:'Um copo com duas pegas para a descoberta dos primeiros golinhos.'},
    {id:5,name:'Babete com bolsinho',category:'meal',price:8.50,desc:'Um babete com bolso frontal para acompanhar as pequenas aventuras à mesa.'},
    {id:6,name:'Potinho para snacks',category:'meal',price:9.50,desc:'Um recipiente pequeno com pega para levar os lanchinhos do dia.'},
    {id:7,name:'Argolas de empilhar',category:'play',price:14.90,desc:'Uma proposta de brinquedo com argolas coloridas para explorar formas e tamanhos.',tag:'Pequenas descobertas'},
    {id:8,name:'Mordedor argolinha',category:'play',price:7.90,desc:'Um pequeno mordedor em forma de argola para a nossa futura seleção.'},
    {id:9,name:'Cubinho de descobertas',category:'play',price:12.50,desc:'Um cubo de tecido com cores e detalhes para descobrir nas brincadeiras.'}
  ];
  const starterKitItems = [
    {id:5,quantity:1,label:'Babete com bolsinho'},
    {id:2,quantity:1,label:'Conjunto de colheres'},
    {id:4,quantity:2,label:'Copinho de aprendizagem'},
    {id:1,quantity:1,label:'Conjunto de caixinhas para sopa'}
  ];
  const starterKit = {
    id:10,
    photoId:1,
    name:'Kit primeiras refeições',
    category:'kit',
    price: starterKitItems.reduce((total,item)=>total+products.find(p=>p.id===item.id).price*item.quantity,0),
    desc:'1 babete · 1 conjunto de colheres · 2 copos · 1 conjunto de caixinhas para sopa'
  };
  const CART_KEY = 'petit-nuvem-cart';
  const ORDERS_KEY = 'petit-nuvem-orders';
  const findProduct = id => id === starterKit.id ? starterKit : products.find(p => p.id === id);
  const money = v => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(v);
  const pos = p => `${(((p.photoId||p.id)-1)%3)*50}% ${Math.floor(((p.photoId||p.id)-1)/3)*50}%`;
  const photo = (p, cls='') => `<div class="product-photo ${cls}" role="img" aria-label="Imagem ilustrativa: ${p.name}" style="background-position:${pos(p)}"></div>`;
  const loadCart = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return new Map(raw.filter(([id,q]) => findProduct(id) && q > 0));
    } catch { return new Map(); }
  };
  const saveCart = cart => localStorage.setItem(CART_KEY, JSON.stringify([...cart]));
  const cartLines = cart => [...cart].map(([id, quantity]) => {
    const product = findProduct(id);
    return { id, quantity, product, lineTotal: product.price * quantity };
  });
  const subtotal = cart => cartLines(cart).reduce((s, l) => s + l.lineTotal, 0);
  const shippingPrice = (methodId, sub) => {
    const method = window.PetitConfig.shipping[methodId];
    if (!method) return 0;
    if (methodId === 'continente' && sub >= window.PetitConfig.freeShippingFrom) return 0;
    return method.price;
  };
  const vatFromGross = gross => gross - gross / (1 + window.PetitConfig.ivaRate);
  const loadOrders = () => {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch { return []; }
  };
  const saveOrder = order => {
    const orders = loadOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 50)));
    return order;
  };
  const newOrderId = () => {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `PN-${new Date().getFullYear()}-${n}`;
  };
  return { products, starterKitItems, starterKit, findProduct, money, photo, loadCart, saveCart, cartLines, subtotal, shippingPrice, vatFromGross, loadOrders, saveOrder, newOrderId, CART_KEY, ORDERS_KEY };
})();
