const C = window.PetitCatalog;
const cfg = window.PetitConfig;
const money = C.money;
document.querySelector('#year').textContent = new Date().getFullYear();
const params = new URLSearchParams(location.search);
if (params.get('pedido')) renderConfirmation(params.get('pedido'));
else renderCheckout();

function renderCheckout(){
  const cart = C.loadCart();
  const root = document.querySelector('#checkoutRoot');
  if(!cart.size){
    root.innerHTML = '<section class="checkout-empty"><h1>Ainda não há nada para pagar.</h1><a class="primary" href="index.html#colecao">Ver a coleção</a></section>';
    return;
  }
  const lines = C.cartLines(cart);
  root.innerHTML = `<form class="checkout-grid" id="checkoutForm" novalidate>
    <div class="checkout-main">
      <p class="eyebrow">ENCOMENDA</p><h1>Finalizar encomenda</h1>
      <fieldset><legend>Os teus dados</legend>
        <div class="fields two"><label>Nome<input name="firstName" required></label><label>Apelido<input name="lastName" required></label></div>
        <div class="fields two"><label>E-mail<input name="email" type="email" required></label><label>Telemóvel<input name="phone" required placeholder="9xxxxxxxx"></label></div>
        <label>NIF <span class="opt">(opcional)</span><input name="nif" maxlength="9"></label>
      </fieldset>
      <fieldset><legend>Morada</legend>
        <label>Morada<input name="address" required></label>
        <div class="fields three">
          <label>Código postal<input name="postal" required placeholder="0000-000"></label>
          <label>Localidade<input name="city" required></label>
          <label>Distrito<select name="district" required><option value="">Selecionar</option>${['Aveiro','Beja','Braga','Bragança','Castelo Branco','Coimbra','Évora','Faro','Guarda','Leiria','Lisboa','Portalegre','Porto','Santarém','Setúbal','Viana do Castelo','Vila Real','Viseu','Açores','Madeira'].map(d=>'<option>'+d+'</option>').join('')}</select></label>
        </div>
      </fieldset>
      <fieldset><legend>Envio</legend><div class="options" id="shipOptions"></div></fieldset>
      <fieldset><legend>Pagamento</legend>
        <div class="options">
          <label class="option"><input type="radio" name="pay" value="transfer" checked><span><strong>Transferência</strong></span></label>
          <label class="option"><input type="radio" name="pay" value="mbway"><span><strong>MB WAY</strong></span></label>
          <label class="option"><input type="radio" name="pay" value="card"><span><strong>Cartão</strong></span></label>
        </div>
        <div id="payExtra"></div>
      </fieldset>
      <label class="legal"><input type="checkbox" name="terms" required> Aceito o tratamento dos dados desta encomenda (RGPD).</label>
      <p class="form-error" id="formError" hidden></p>
      <button class="primary" type="submit">Confirmar encomenda</button>
    </div>
    <aside class="checkout-summary"><h2>Resumo</h2>
      <div class="summary-lines">${lines.map(l=>`<div class="sum-row">${C.photo(l.product,'cart-thumb')}<div><strong>${l.product.name}</strong><span>${l.quantity} × ${money(l.product.price)}</span></div><b>${money(l.lineTotal)}</b></div>`).join('')}</div>
      <div class="sum-totals" id="sumTotals"></div>
    </aside></form>`;
  const form = document.querySelector('#checkoutForm');
  document.querySelector('#shipOptions').innerHTML = Object.values(cfg.shipping).map((s,i)=>`<label class="option"><input type="radio" name="ship" value="${s.id}" ${i===0?'checked':''}><span><strong>${s.label}</strong><em>${s.detail}</em></span><b data-ship-price="${s.id}"></b></label>`).join('');
  const updateTotals = () => {
    const shipId = form.ship.value;
    const sub = C.subtotal(cart);
    const ship = C.shippingPrice(shipId, sub);
    const total = sub + ship;
    Object.values(cfg.shipping).forEach(s => {
      form.querySelector('[data-ship-price="'+s.id+'"]').textContent = C.shippingPrice(s.id, sub)===0 ? 'Grátis' : money(s.price);
    });
    document.querySelector('#sumTotals').innerHTML = `<div><span>Subtotal</span><span>${money(sub)}</span></div><div><span>Portes</span><span>${ship===0?'Grátis':money(ship)}</span></div><div class="grand"><span>Total</span><strong>${money(total)}</strong></div>`;
    return { sub, ship, total, shipId };
  };
  const renderPay = () => {
    const method = form.pay.value;
    const box = document.querySelector('#payExtra');
    if(method==='transfer') box.innerHTML = `<div class="pay-box"><p><strong>${cfg.bank.name}</strong><br>IBAN ${cfg.bank.iban}</p></div>`;
    else if(method==='mbway') box.innerHTML = `<div class="pay-box"><label>Número MB WAY<input name="mbway" placeholder="9xxxxxxxx"></label></div>`;
    else box.innerHTML = `<div class="pay-box"><label>Número do cartão<input name="card" placeholder="ACCT-000015"></label><div class="fields two"><label>Validade<input name="exp" placeholder="MM/AA"></label><label>CVC<input name="cvc" maxlength="4"></label></div><p class="hint">Validação local. Sem Stripe o valor não é cobrado.</p></div>`;
  };
  form.addEventListener('change', e => { if(e.target.name==='ship') updateTotals(); if(e.target.name==='pay') renderPay(); });
  updateTotals(); renderPay();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const err = document.querySelector('#formError');
    const data = Object.fromEntries(new FormData(form));
    if(!form.checkValidity() || !/^\d{4}-\d{3}$/.test((data.postal||'').trim()) || !/^9\d{8}$/.test((data.phone||'').replace(/\s/g,''))){
      err.hidden = false; err.textContent = 'Verifica morada, código postal 0000-000 e telemóvel 9xxxxxxxx.'; return;
    }
    const totals = updateTotals();
    const order = {
      id: C.newOrderId(), createdAt: new Date().toISOString(),
      status: data.pay==='card' ? 'pago' : data.pay==='mbway' ? 'aguardando_mbway' : 'aguardando_transferencia',
      customer: { firstName:data.firstName.trim(), lastName:data.lastName.trim(), email:data.email.trim(), phone:data.phone.replace(/\s/g,''), nif:data.nif||null },
      shippingAddress: { address:data.address.trim(), postal:data.postal.trim(), city:data.city.trim(), district:data.district },
      shipping: { method: totals.shipId, price: totals.ship, label: cfg.shipping[totals.shipId].label },
      payment: { method: data.pay },
      items: lines.map(l => ({ id:l.id, name:l.product.name, quantity:l.quantity, price:l.product.price, lineTotal:l.lineTotal })),
      totals: { subtotal: totals.sub, shipping: totals.ship, total: totals.total },
      note: data.pay==='transfer' ? 'Aguarda transferência para '+cfg.bank.iban+'.' : 'Encomenda registada neste dispositivo.'
    };
    C.saveOrder(order);
    localStorage.removeItem(C.CART_KEY);
    location.href = 'checkout.html?pedido=' + encodeURIComponent(order.id);
  });
}
function renderConfirmation(id){
  const order = C.loadOrders().find(o => o.id === id);
  const root = document.querySelector('#checkoutRoot');
  if(!order){ root.innerHTML = '<section class="checkout-empty"><h1>Encomenda não encontrada.</h1><a class="primary" href="index.html">Voltar</a></section>'; return; }
  root.innerHTML = `<section class="confirm"><p class="eyebrow">ENCOMENDA ${order.id}</p><h1>Obrigado, ${order.customer.firstName}.</h1><p class="status-pill">${order.status}</p><p>${order.note}</p>
    <div class="confirm-grid"><div><h2>Artigos</h2>${order.items.map(i=>`<div class="sum-row bare"><span>${i.quantity} × ${i.name}</span><b>${money(i.lineTotal)}</b></div>`).join('')}<div class="sum-totals"><div class="grand"><span>Total</span><strong>${money(order.totals.total)}</strong></div></div></div>
    <div><h2>Envio</h2><p>${order.customer.firstName} ${order.customer.lastName}<br>${order.shippingAddress.address}<br>${order.shippingAddress.postal} ${order.shippingAddress.city}</p></div></div>
    <a class="primary" href="index.html">Voltar à loja</a></section>`;
}
