const brl=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const rd=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const wr=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let PRODUCTS=[];
const prod=id=>PRODUCTS.find(p=>p.id===id);
const ready=Auth.api('/api/products').then(r=>{PRODUCTS=r.ok?r.data:[];return r});
const Cart={get:()=>rd('cma_cart',[]).filter(x=>prod(x.id)),
 add(id){const c=this.get(),i=c.find(x=>x.id===id);i?i.q++:c.push({id,q:1});wr('cma_cart',c)},
 chg(id,d){const c=this.get();c.forEach(x=>{if(x.id===id)x.q+=d});wr('cma_cart',c.filter(x=>x.q>0))},
 clear(){wr('cma_cart',[])},
 total(){return this.get().reduce((s,x)=>s+prod(x.id).preco*x.q,0)},
 count(){return this.get().reduce((s,x)=>s+x.q,0)}};
const Orders={create:()=>Auth.api('/api/orders',{method:'POST',body:{itens:Cart.get().map(x=>({productId:x.id,qtd:x.q}))}})};
function cartUI(){
  const d=document.getElementById('drawer');if(!d)return;
  const render=()=>{const c=Cart.get(),u=Auth.current(),m=d.querySelector('#cmsg');
   document.querySelectorAll('.cc').forEach(e=>e.textContent=Cart.count());
   d.querySelector('.items').innerHTML=c.length?c.map(x=>{const p=prod(x.id);
    return `<div class="it"><span>${Auth.esc(p.icone||'')} ${Auth.esc(p.nome)}<br><small>${brl(p.preco)}</small></span><span class="q"><button data-d="-1" data-id="${p.id}" aria-label="Diminuir">−</button>${x.q}<button data-d="1" data-id="${p.id}" aria-label="Aumentar">+</button></span></div>`}).join(''):'<p class="empty">Seu carrinho está vazio. Que tal um latte caramelo?</p>';
   d.querySelector('.tot span:last-child').textContent=brl(Cart.total());
   if(!u&&c.length){m.className='msg err';m.innerHTML='Para finalizar o pedido, <a href="login.html?next=index.html"><b>entre na sua conta</b></a>.'}
   else if(!m.classList.contains('ok')){m.className='';m.textContent=''}
   d.querySelector('#finish').disabled=!c.length};
  const toggle=o=>{d.classList.toggle('open',o);document.getElementById('veil').classList.toggle('on',o)};
  document.getElementById('openCart').onclick=()=>{d.querySelector('#cmsg').classList.remove('ok');render();toggle(true)};
  document.getElementById('closeCart').onclick=document.getElementById('veil').onclick=()=>toggle(false);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(b){Cart.chg(+b.dataset.id,+b.dataset.d);render()}});
  document.getElementById('finish').onclick=async()=>{const u=Auth.current();
   if(!u)return location.href='login.html?next=index.html';
   const m=d.querySelector('#cmsg'),r=await Orders.create();
   if(!r.ok){render();m.className='msg err';m.textContent=r.error;return}
   Cart.clear();render();m.className='msg ok';m.innerHTML=`Pedido ${String(r.data.id).padStart(3,'0')} realizado! Veja em <a href="pedidos.html"><b>Meus pedidos</b></a>.`};
  window.renderCart=render;render()}
ready.then(cartUI);
