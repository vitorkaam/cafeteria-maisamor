const Auth=(()=>{
const U='cma_users',S='cma_session';
const rd=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const wr=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function hash(pw,salt){
  const t=salt+pw;
  if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  let h=5381;for(const c of t)h=(h*33)^c.charCodeAt(0);return 'f'+(h>>>0).toString(16)}
const norm=e=>e.trim().toLowerCase();
const current=()=>rd(S,null);
async function register({nome,email,telefone,senha}){
  const users=rd(U,[]);email=norm(email);
  if(users.some(u=>u.email===email))return{ok:false,error:'Este e-mail já está cadastrado. Tente entrar.'};
  const salt=Math.random().toString(36).slice(2),id='u'+Date.now();
  users.push({id,nome:nome.trim(),email,telefone,salt,hash:await hash(senha,salt)});wr(U,users);return{ok:true}}
async function login(email,senha){
  const u=rd(U,[]).find(x=>x.email===norm(email));
  if(!u||u.hash!==await hash(senha,u.salt))return{ok:false,error:'E-mail ou senha incorretos.'};
  wr(S,{id:u.id,nome:u.nome,email:u.email});return{ok:true}}
function logout(){localStorage.removeItem(S);location.href='index.html'}
function nav(){
  const a=document.getElementById('authArea');if(!a)return;const u=current();
  a.innerHTML=u?`<span class="hi">Olá, ${esc(u.nome.split(' ')[0])}</span><button class="btn ghost sm" id="out">Sair</button>`
   :`<a class="btn ghost sm" href="login.html">Entrar</a><a class="btn sm" href="cadastro.html">Criar conta</a>`;
  const o=document.getElementById('out');if(o)o.addEventListener('click',logout)}
const showMsg=(t,k)=>{const m=document.getElementById('msg');m.className='msg '+k;m.textContent=t};
function field(id,test,text){const i=document.getElementById(id),f=i.closest('.f'),h=f.querySelector('.hint');
  const run=()=>{const ok=test(i.value);f.classList.toggle('bad',!ok&&i.value!=='');f.classList.toggle('good',ok&&i.value!=='');h.textContent=(!ok&&i.value!=='')?text:'';return ok};
  i.addEventListener('input',run);return run}
function eyes(){document.querySelectorAll('.eye').forEach(b=>b.addEventListener('click',()=>{const i=b.previousElementSibling,s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Ocultar':'Mostrar'}))}
const okMail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const next=()=>{const n=new URLSearchParams(location.search).get('next');return /^[\w-]+\.html(#.*)?$/.test(n||'')?n:'index.html'};
function initLogin(){
  eyes();const vm=field('email',okMail,'Digite um e-mail válido.'),vp=field('senha',v=>v.length>0,'Informe sua senha.');
  document.getElementById('login-form').addEventListener('submit',async e=>{e.preventDefault();
    if(!(vm()&&vp()))return showMsg('Preencha e-mail e senha para entrar.','err');
    const r=await login(document.getElementById('email').value,document.getElementById('senha').value);
    if(!r.ok)return showMsg(r.error,'err');
    showMsg('Login realizado! Redirecionando...','ok');setTimeout(()=>location.href=next(),800)});
  document.getElementById('forgot').addEventListener('click',e=>{e.preventDefault();showMsg('Recuperação de senha ainda não está disponível nesta versão de testes.','err')})}
function score(p){let s=0;if(p.length>=6)s++;if(p.length>=10)s++;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^\w\s]/.test(p))s++;return Math.min(s,4)}
function initSignup(){
  eyes();const $=id=>document.getElementById(id);
  const vn=field('nome',v=>v.trim().split(/\s+/).filter(Boolean).length>=2,'Informe nome e sobrenome.'),
  vm=field('email',okMail,'Digite um e-mail válido.'),
  vt=field('telefone',v=>v===''||v.replace(/\D/g,'').length>=10,'Telefone com DDD, ex.: (11) 91234-5678.'),
  vp=field('senha',v=>v.length>=6,'A senha precisa de pelo menos 6 caracteres.'),
  vc=field('confirma',v=>v===$('senha').value&&v!=='','As senhas não conferem.');
  $('senha').addEventListener('input',()=>{const p=$('senha').value,s=score(p),L=['Muito fraca','Fraca','Média','Boa','Forte'],C=['#b3261e','#b3261e','#c68642','#7a9a3a','#2e7d4f'];
    const b=document.querySelector('.strength i');b.style.width=p?(s+1)*20+'%':'0';b.style.background=C[s];
    document.querySelector('.slabel').textContent=p?'Força: '+L[s]:'';if($('confirma').value)vc()});
  $('signup-form').addEventListener('submit',async e=>{e.preventDefault();
    const ok=[vn(),vm(),vp(),vc(),vt()].every(Boolean);
    if(!ok)return showMsg('Corrija os campos destacados e tente de novo.','err');
    const r=await register({nome:$('nome').value,email:$('email').value,telefone:$('telefone').value,senha:$('senha').value});
    if(!r.ok)return showMsg(r.error,'err');
    showMsg('Conta criada com sucesso! Redirecionando para o login...','ok');setTimeout(()=>location.href='login.html',1200)})}
document.addEventListener('DOMContentLoaded',()=>{nav();if(document.getElementById('login-form'))initLogin();if(document.getElementById('signup-form'))initSignup()});
return{current,logout,esc}})();
