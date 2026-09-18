const { products, starterKitItems, starterKit, findProduct, money, photo, loadCart, saveCart } = window.PetitCatalog;
const cart = loadCart();

function render(filter='all'){
  const list = products.filter(p => filter==='all' || p.category===filter);
  document.querySelector('#shown').textContent = `${list.length} artigos`;
  document.querySelector('#products').innerHTML = list.map(p =>
    `<article class="card"><button class="photo-button" data-detail="${p.id}" aria-label="Ver ${p.name}">${photo(p)}${p.tag?`<span class="tag">${p.tag}</span>`:''}</button><div class="card-info"><div><p class="category">${p.category==='meal'?'À MESA':'A BRINCAR'}</p><button class="title-button" data-detail="${p.id}">${p.name}</button><p class="price">${money(p.price)}</p></div><button class="add" data-add="${p.id}" aria-label="Adicionar ${p.name} ao saco">+</button></div></article>`
  ).join('');
}

let toastTimer;
function add(id){
  cart.set(id, (cart.get(id)||0)+1);
  saveCart(cart);
  updateCart();
  const toast = document.querySelector('#toast');
  toast.textContent = 'Adicionado ao saco';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function updateCart(){
  saveCart(cart);
  document.querySelector('#count').textContent = [...cart.values()].reduce((a,b)=>a+b,0);
  const root = document.querySelector('#cartContent');
  if(!cart.size){
    root.innerHTML = '<div class="empty"><h3>Ainda está tudo por descobrir.</h3><p>Escolhe os teus pequenos favoritos.</p><button class="primary" data-close="cart">Explorar a coleção</button></div>';
    return;
  }
  let total = 0;
  root.innerHTML = [...cart].map(([id,q]) => {
    const p = findProduct(id);
    total += p.price * q;
    return `<div class="cart-row">${photo(p,'cart-thumb')}<div><h3>${p.name}</h3>${p.id===10?`<p class="kit-cart-description">${p.desc}</p>`:''}<span>${money(p.price)}</span><div class="qty"><button data-change="${id}" data-delta="-1" aria-label="Diminuir quantidade de ${p.name}">−</button><span>${q}</span><button data-change="${id}" data-delta="1" aria-label="Aumentar quantidade de ${p.name}">+</button><button class="remove" data-remove="${id}">Remover</button></div></div></div>`;
  }).join('') +
  `<div class="total"><span>Subtotal</span><strong>${money(total)}</strong></div>
   <a class="primary checkout-cta" href="checkout.html">Finalizar encomenda ↗</a>
   <p class="checkout-note">Envio para Portugal. Portes grátis no continente a partir de ${money(window.PetitConfig.freeShippingFrom)}. Pagamento por transferência, MB WAY ou cartão.</p>`;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if(!b) return;
  if(b.dataset.kit==='open') document.querySelector('#kit').showModal();
  if(b.dataset.kit==='add'){ add(starterKit.id); document.querySelector('#kit').close(); document.querySelector('#cart').showModal(); }
  if(b.dataset.filter){
    document.querySelectorAll('[data-filter]').forEach(x => {
      const on = x===b;
      x.classList.toggle('active', on);
      x.setAttribute('aria-pressed', on);
    });
    render(b.dataset.filter);
  }
  if(b.dataset.add) add(Number(b.dataset.add));
  if(b.dataset.detail){
    const p = products.find(x => x.id===Number(b.dataset.detail));
    document.querySelector('#detailContent').innerHTML =
      `${photo(p,'detail-photo')}<p class="eyebrow">${p.category==='meal'?'À MESA':'A BRINCAR'}</p><h2>${p.name}</h2><p>${p.desc}</p><p><strong>${money(p.price)}</strong> · IVA incluído</p><button class="primary" data-add="${p.id}">Adicionar ao saco +</button><p class="demo-note">Fotografia ilustrativa. Materiais e idade recomendada serão confirmados com o produto final.</p>`;
    document.querySelector('#detail').showModal();
  }
  if(b.dataset.close) document.getElementById(b.dataset.close).close();
  if(b.dataset.change){
    const id = Number(b.dataset.change), q = (cart.get(id)||0) + Number(b.dataset.delta);
    q>0 ? cart.set(id,q) : cart.delete(id);
    updateCart();
  }
  if(b.dataset.remove){ cart.delete(Number(b.dataset.remove)); updateCart(); }
});

document.querySelector('#openCart').onclick = () => { updateCart(); document.querySelector('#cart').showModal(); };
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => {
  if(e.target===d){
    const r = d.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) d.close();
  }
}));
document.querySelector('#year').textContent = new Date().getFullYear();
render();
updateCart();

const kitRows = starterKitItems.map(item => {
  const p = products.find(p => p.id===item.id);
  return `<div class="kit-item">${photo({...p,name:item.label},'kit-thumb')}<div><span class="kit-quantity">${item.quantity} ×</span><h3>${item.label}</h3></div></div>`;
}).join('');
document.querySelector('#kitPreview').innerHTML = kitRows;
document.querySelector('#kitPrice').textContent = money(starterKit.price);
document.querySelector('#kitContent').innerHTML =
  `<p class="eyebrow">ESCOLHIDO PELA PETIT NUVEM</p><h2 id="kit-title">Kit primeiras refeições</h2><p>Os nossos essenciais para começar, reunidos num só conjunto.</p><div class="kit-contents">${kitRows}</div><div class="total"><span>Total</span><strong>${money(starterKit.price)}</strong></div><button class="primary" data-kit="add">Adicionar kit completo ao carrinho +</button><p class="demo-note">Imagens ilustrativas. O conjunto de colheres é representado pela imagem dos talheres.</p>`;
