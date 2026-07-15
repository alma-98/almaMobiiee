import{initializeApp}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import{getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import{getFirestore,collection,getDocs,addDoc,updateDoc,deleteDoc,doc,serverTimestamp}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig={
apiKey:"AIzaSyBZmB6YP01F7VUytAowrhJP4sUei85Qlig",
authDomain:"almamobiiee.firebaseapp.com",
projectId:"almamobiiee",
storageBucket:"almamobiiee.firebasestorage.app",
messagingSenderId:"196216662786",
appId:"1:196216662786:web:a0d1286318004a525fb01b"
};

const ADMIN="alma.budsteddy88@gmail.com";
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);

const schemas={
mediators:{
title:"Mediator",
fields:[
["name","Nama","text"],
["phone","Telepon","text"],
["email","Email","email"],
["city","Kota","text"],
["reason","Catatan","text"],
["status","Status","select",["pending","approved","rejected"]],
["paymentStatus","Pembayaran","select",["pending","paid","rejected"]]
]},
used_cars:{
title:"Mobil Second",
fields:[
["ownerName","Pemilik","text"],
["phone","Telepon","text"],
["car","Mobil","text"],
["year","Tahun","number"],
["price","Harga","number"],
["adminFee","Admin 2,5%","number"],
["status","Status","select",["pending_review","approved","sold","rejected"]],
["paymentStatus","Pembayaran","select",["pending","paid","rejected"]]
]},
insurance_requests:{
title:"Asuransi",
fields:[
["name","Nama","text"],
["phone","Telepon","text"],
["car","Mobil","text"],
["year","Tahun","number"],
["status","Status","select",["new","contacted","completed","rejected"]]
]},
orders:{
title:"Orders",
fields:[
["customerName","Customer","text"],
["phone","Telepon","text"],
["product","Produk","text"],
["quantity","Jumlah","number"],
["total","Total","number"],
["status","Status","select",["pending","processing","completed","cancelled"]]
]},
payments:{
title:"Payments",
fields:[
["referenceId","Referensi","text"],
["customerName","Customer","text"],
["amount","Jumlah","number"],
["method","Metode","select",["QRIS","Bank Mandiri"]],
["status","Status","select",["pending","verified","rejected"]]
]}
};

let current="mediators";
let data=[];
let editing=null;

const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

$("loginForm").onsubmit=async e=>{
e.preventDefault();
$("loginError").textContent="";
try{
await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);
}catch(err){
console.error(err);
$("loginError").textContent="Email atau password tidak valid.";
}
};

$("logout").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async user=>{
if(!user||user.email?.toLowerCase()!==ADMIN){
$("dashboard").classList.add("hidden");
$("login").classList.remove("hidden");
return;
}
$("login").classList.add("hidden");
$("dashboard").classList.remove("hidden");
$("adminEmail").textContent=user.email;
await refresh();
});

async function read(col){
const snap=await getDocs(collection(db,col));
return snap.docs.map(x=>({id:x.id,...x.data()}));
}

async function load(){
data=await read(current);
render(data);
}

function render(rows){
const s=schemas[current];
$("title").textContent=s.title;

$("thead").innerHTML="<tr>"+
s.fields.map(f=>`<th>${esc(f[1])}</th>`).join("")+
"<th>Aksi</th></tr>";

if(!rows.length){
$("tbody").innerHTML=`<tr><td class="empty" colspan="${s.fields.length+1}">Belum ada data. Klik "+ Tambah Data".</td></tr>`;
return;
}

$("tbody").innerHTML=rows.map(item=>`
<tr>
${s.fields.map(f=>`<td>${esc(item[f[0]]??"-")}</td>`).join("")}
<td>
<div class="actions">
<button class="action" data-a="edit" data-id="${item.id}">Edit</button>
<button class="action verify" data-a="verify" data-id="${item.id}">Verifikasi</button>
<button class="action reject" data-a="reject" data-id="${item.id}">Tolak</button>
<button class="action delete" data-a="delete" data-id="${item.id}">Hapus</button>
</div>
</td>
</tr>
`).join("");
}

function openModal(item=null){
editing=item?.id||null;
$("modalTitle").textContent=editing?"Edit Data":"Tambah Data";

$("fields").innerHTML=schemas[current].fields.map(f=>{
const[key,label,type,options]=f;
const value=item?.[key]??"";

if(type==="select"){
return `<label>${label}<select name="${key}">
${options.map(o=>`<option value="${o}" ${value===o?"selected":""}>${o}</option>`).join("")}
</select></label>`;
}

return `<label>${label}<input name="${key}" type="${type}" value="${esc(value)}"></label>`;
}).join("");

$("modal").classList.add("active");
}

function closeModal(){
$("modal").classList.remove("active");
editing=null;
$("crudForm").reset();
}

$("add").onclick=()=>openModal();
$("close").onclick=closeModal;
$("cancel").onclick=closeModal;

$("modal").onclick=e=>{
if(e.target===$("modal"))closeModal();
};

$("crudForm").onsubmit=async e=>{
e.preventDefault();

const fd=new FormData(e.target);
const obj={};

schemas[current].fields.forEach(f=>{
let v=fd.get(f[0]);
if(f[2]==="number")v=Number(v)||0;
obj[f[0]]=v;
});

if(current==="used_cars"){
obj.adminFee=Math.round((Number(obj.price)||0)*0.025);
obj.adminFeeRate=0.025;
}

if(editing){
await updateDoc(doc(db,current,editing),{
...obj,
updatedAt:serverTimestamp()
});
}else{
await addDoc(collection(db,current),{
...obj,
createdAt:serverTimestamp(),
updatedAt:serverTimestamp()
});
}

closeModal();
await refresh();
};

$("tbody").onclick=async e=>{
const b=e.target.closest("[data-a]");
if(!b)return;

const item=data.find(x=>x.id===b.dataset.id);
const ref=doc(db,current,b.dataset.id);

if(b.dataset.a==="edit"){
openModal(item);
return;
}

if(b.dataset.a==="delete"){
if(confirm("Hapus data ini?")){
await deleteDoc(ref);
await refresh();
}
return;
}

if(b.dataset.a==="verify"){
const update={updatedAt:serverTimestamp()};

if(current==="payments")update.status="verified";
else{
update.status="approved";
if("paymentStatus"in item)update.paymentStatus="paid";
}

await updateDoc(ref,update);
await refresh();
return;
}

if(b.dataset.a==="reject"){
const update={
status:"rejected",
updatedAt:serverTimestamp()
};
if("paymentStatus"in item)update.paymentStatus="rejected";

await updateDoc(ref,update);
await refresh();
}
};

document.querySelectorAll(".nav").forEach(btn=>{
btn.onclick=async()=>{
document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
btn.classList.add("active");
current=btn.dataset.col;
$("search").value="";
await load();
};
});

$("search").oninput=()=>{
const q=$("search").value.toLowerCase();
render(data.filter(x=>JSON.stringify(x).toLowerCase().includes(q)));
};

async function refresh(){
const all=await Promise.all([
read("mediators"),
read("used_cars"),
read("insurance_requests"),
read("orders"),
read("payments")
]);

$("c1").textContent=all[0].length;
$("c2").textContent=all[1].length;
$("c3").textContent=all[2].length;
$("c4").textContent=all[3].length;
$("c5").textContent=all[4].length;

await load();
}
