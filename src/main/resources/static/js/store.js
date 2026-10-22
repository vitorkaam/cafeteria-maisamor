const PRODUCTS=[
{id:1,nome:'Espresso',cat:'Cafés',preco:6.5,ic:'☕',d:'Curto, intenso e com crema dourada.'},
{id:2,nome:'Cappuccino',cat:'Cafés',preco:12,ic:'☕',d:'Espresso, leite vaporizado e espuma cremosa.'},
{id:3,nome:'Latte Caramelo',cat:'Cafés',preco:14.5,ic:'🍯',d:'Nosso campeão: latte com calda de caramelo da casa.'},
{id:4,nome:'Mocha',cat:'Cafés',preco:15,ic:'🍫',d:'Café, chocolate belga e chantilly.'},
{id:5,nome:'Café Gelado',cat:'Gelados',preco:13,ic:'🧊',d:'Cold brew coado por 18 horas, servido com gelo.'},
{id:6,nome:'Frappé de Caramelo',cat:'Gelados',preco:17,ic:'🥤',d:'Batido com gelo, café e calda de caramelo.'},
{id:7,nome:'Croissant',cat:'Salgados',preco:9,ic:'🥐',d:'Folhado e amanteigado, assado toda manhã.'},
{id:8,nome:'Pão de Queijo',cat:'Salgados',preco:7.5,ic:'🧀',d:'Porção com 4 unidades, saindo do forno.'},
{id:9,nome:'Bolo de Cenoura',cat:'Doces',preco:11,ic:'🍰',d:'Com cobertura de chocolate meio amargo.'},
{id:10,nome:'Brownie',cat:'Doces',preco:10,ic:'🍫',d:'Úmido por dentro, casquinha crocante.'}];
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const rd=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const wr=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const prod=id=>PRODUCTS.find(p=>p.id===id);
const Cart={get:()=>rd('cma_cart',[]),
 add(id){const c=this.get(),i=c.find(x=>x.id===id);i?i.q++:c.push({id,q:1});wr('cma_cart',c)},
 chg(id,d){const c=this.get();c.forEach(x=>{if(x.id===id)x.q+=d});wr('cma_cart',c.filter(x=>x.q>0))},
 clear(){wr('cma_cart',[])},
 total(){return this.get().reduce((s,x)=>s+prod(x.id).preco*x.q,0)},
 count(){return this.get().reduce((s,x)=>s+x.q,0)}};
const Orders={all:()=>rd('cma_orders',[]),
 mine(uid){return this.all().filter(o=>o.userId===uid)},
 create(user){const seq=rd('cma_seq',0)+1;wr('cma_seq',seq);
  const o={num:String(seq).padStart(3,'0'),userId:user.id,data:new Date().toISOString(),total:Cart.total(),
   itens:Cart.get().map(x=>({nome:prod(x.id).nome,q:x.q,preco:prod(x.id).preco}))};
  wr('cma_orders',[...this.all(),o]);Cart.clear();return o}};
function cartUI(){
  const d=document.getElementById('drawer');if(!d)return;
  const render=()=>{const c=Cart.get(),u=Auth.current(),m=d.querySelector('#cmsg');
   document.querySelectorAll('.cc').forEach(e=>e.textContent=Cart.count());
   d.querySelector('.items').innerHTML=c.length?c.map(x=>{const p=prod(x.id);
    return `<div class="it"><span>${p.ic} ${p.nome}<br><small>${brl(p.preco)}</small></span><span class="q"><button data-d="-1" data-id="${p.id}" aria-label="Diminuir">−</button>${x.q}<button data-d="1" data-id="${p.id}" aria-label="Aumentar">+</button></span></div>`}).join(''):'<p class="empty">Seu carrinho está vazio. Que tal um latte caramelo?</p>';
   d.querySelector('.tot span:last-child').textContent=brl(Cart.total());
   if(!u&&c.length){m.className='msg err';m.innerHTML='Para finalizar o pedido, <a href="login.html?next=index.html"><b>entre na sua conta</b></a>.'}
   else if(!m.classList.contains('ok')){m.className='';m.textContent=''}
   d.querySelector('#finish').disabled=!c.length};
  const toggle=o=>{d.classList.toggle('open',o);document.getElementById('veil').classList.toggle('on',o)};
  document.getElementById('openCart').onclick=()=>{d.querySelector('#cmsg').classList.remove('ok');render();toggle(true)};
  document.getElementById('closeCart').onclick=document.getElementById('veil').onclick=()=>toggle(false);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(b){Cart.chg(+b.dataset.id,+b.dataset.d);render()}});
  document.getElementById('finish').onclick=()=>{const u=Auth.current();
   if(!u)return location.href='login.html?next=index.html';
   const o=Orders.create(u),m=d.querySelector('#cmsg');render();m.className='msg ok';m.innerHTML=`Pedido ${o.num} realizado! Veja em <a href="pedidos.html"><b>Meus pedidos</b></a>.`};
  window.renderCart=render;render()}
document.addEventListener('DOMContentLoaded',cartUI);
