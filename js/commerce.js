const AlmaDB={
  get(k,d=[]){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};

function almaSeed(){
  if(!localStorage.getItem("alma_products")){
    AlmaDB.set("alma_products",[
      {id:"NEW-001",category:"Mobil Baru",name:"Kendaraan Baru Pilihan",price:350000000,promo:"Hubungi Alma untuk promo terbaru",image:"",active:true},
      {id:"USED-001",category:"Mobil Second",name:"Mobil Second Pilihan",price:185000000,promo:"Unit terbatas",image:"",active:true},
      {id:"ACC-001",category:"Aksesori",name:"Aksesori Mobil",price:250000,promo:"Tersedia untuk pemesanan",image:"",active:true}
    ]);
  }
}

function almaRupiah(n){
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
}

let almaFilter="Semua";

function almaSetFilter(category,button){
  almaFilter=category;
  document.querySelectorAll(".alma-tabs button").forEach(b=>b.classList.remove("active"));
  if(button)button.classList.add("active");
  almaRender();
}

function almaRender(){
  const target=document.getElementById("almaProductGrid");
  if(!target)return;
  const products=AlmaDB.get("alma_products",[]).filter(p=>p.active!==false&&(almaFilter==="Semua"||p.category===almaFilter));
  target.innerHTML=products.length?products.map(p=>`
    <article class="alma-card">
      <div class="alma-card-image">${p.image?`<img src="${p.image}" alt="${p.name}">`:"🚗"}</div>
      <div class="alma-card-body">
        <div class="alma-category">${p.category}</div>
        <h3>${p.name}</h3>
        ${p.promo?`<div class="alma-promo">🔥 ${p.promo}</div>`:""}
        <div class="alma-price">${almaRupiah(p.price)}</div>
        <button class="alma-btn alma-btn-primary" onclick="almaOpenOrder('${p.id}')">Pesan Sekarang</button>
      </div>
    </article>
  `).join(""):"<p>Belum ada produk pada kategori ini.</p>";
}

function almaOpenOrder(id){
  const p=AlmaDB.get("alma_products",[]).find(x=>x.id===id);
  if(!p)return;
  document.getElementById("almaOrderProductId").value=p.id;
  document.getElementById("almaOrderProduct").value=p.name;
  document.getElementById("almaOrderAmount").value=p.price;
  document.getElementById("almaOrderTotal").textContent=almaRupiah(p.price);
  document.getElementById("almaOrderModal").classList.add("active");
}

function almaCloseOrder(){
  document.getElementById("almaOrderModal").classList.remove("active");
}

function almaSubmitOrder(e){
  e.preventDefault();
  const order={
    id:"ORD-"+Date.now(),
    createdAt:new Date().toISOString(),
    productId:document.getElementById("almaOrderProductId").value,
    product:document.getElementById("almaOrderProduct").value,
    amount:Number(document.getElementById("almaOrderAmount").value),
    customer:document.getElementById("almaCustomerName").value,
    phone:document.getElementById("almaCustomerPhone").value,
    email:document.getElementById("almaCustomerEmail").value,
    address:document.getElementById("almaCustomerAddress").value,
    payment:document.getElementById("almaPaymentMethod").value,
    note:document.getElementById("almaCustomerNote").value,
    status:"Menunggu Verifikasi"
  };
  const orders=AlmaDB.get("alma_orders",[]);
  orders.unshift(order);
  AlmaDB.set("alma_orders",orders);
  alert("Pesanan berhasil dibuat.\nID Pesanan: "+order.id+"\nStatus: Menunggu Verifikasi");
  e.target.reset();
  almaCloseOrder();
}

document.addEventListener("DOMContentLoaded",()=>{almaSeed();almaRender()});
