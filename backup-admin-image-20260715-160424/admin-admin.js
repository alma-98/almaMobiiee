import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZmB6YP01F7VUytAowrhJP4sUei85Qlig",
  authDomain: "almamobiiee.firebaseapp.com",
  projectId: "almamobiiee",
  storageBucket: "almamobiiee.firebasestorage.app",
  messagingSenderId: "196216662786",
  appId: "1:196216662786:web:a0d1286318004a525fb01b"
};

const ADMIN_EMAIL = "alma.budsteddy88@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const schemas = {

  new_cars: {
    title: "Mobil Baru",
    description: "Tambah, edit dan hapus katalog mobil baru.",
    fields: [
      ["name","Nama Mobil","text"],
      ["variant","Varian","text"],
      ["year","Tahun","number"],
      ["price","Harga OTR","number"],
      ["promoPrice","Harga Promo","number"],
      ["dp","DP Mulai","number"],
      ["installment","Cicilan Mulai","number"],
      ["stock","Stok","number"],
      ["image","URL Gambar","text"],
      ["badge","Badge Promo","text"],
      ["description","Deskripsi","textarea"],
      ["status","Status","select",["active","inactive"]]
    ]
  },

  accessories: {
    title: "Accessories",
    description: "Kelola produk accessories dan stok.",
    fields: [
      ["name","Nama Produk","text"],
      ["category","Kategori","text"],
      ["price","Harga","number"],
      ["stock","Stok","number"],
      ["image","URL Gambar","text"],
      ["description","Deskripsi","textarea"],
      ["status","Status","select",["active","inactive"]]
    ]
  },

  orders: {
    title: "Pesanan",
    description: "Kelola pesanan pelanggan.",
    fields: [
      ["customerName","Nama Pembeli","text"],
      ["phone","Nomor HP","text"],
      ["product","Produk","text"],
      ["quantity","Jumlah","number"],
      ["total","Total","number"],
      ["address","Alamat","textarea"],
      ["status","Status","select",["pending","processing","completed","cancelled"]]
    ]
  },

  payments: {
    title: "Pembayaran",
    description: "Lihat siapa yang sudah bayar dan verifikasi pembayaran.",
    fields: [
      ["customerName","Nama Pembayar","text"],
      ["phone","Nomor HP","text"],
      ["transactionType","Jenis Transaksi","select",[
        "Accessories",
        "Mediator",
        "Mobil Second",
        "Asuransi",
        "Mobil Baru"
      ]],
      ["referenceId","Referensi","text"],
      ["item","Produk / Mobil","text"],
      ["amount","Nominal","number"],
      ["method","Metode","select",["QRIS","Bank Mandiri"]],
      ["proofUrl","Bukti Pembayaran URL","text"],
      ["status","Status","select",["pending","verified","rejected"]]
    ]
  },

  mediators: {
    title: "Mediator",
    description: "Kelola pendaftar mediator.",
    fields: [
      ["name","Nama","text"],
      ["phone","Nomor HP","text"],
      ["email","Email","email"],
      ["city","Kota","text"],
      ["reason","Alasan / Catatan","textarea"],
      ["paymentStatus","Pembayaran","select",["pending","paid","rejected"]],
      ["status","Status","select",["pending","approved","rejected"]]
    ]
  },

  used_cars: {
    title: "Mobil Second",
    description: "Kelola mobil second dan biaya admin 2,5%.",
    fields: [
      ["ownerName","Nama Pemilik","text"],
      ["phone","Nomor HP","text"],
      ["car","Mobil","text"],
      ["year","Tahun","number"],
      ["price","Harga Mobil","number"],
      ["adminFee","Biaya Admin 2,5%","number"],
      ["paymentStatus","Pembayaran","select",["pending","paid","rejected"]],
      ["status","Status","select",["pending_review","approved","sold","rejected"]]
    ]
  },

  insurance_requests: {
    title: "Asuransi",
    description: "Kelola permintaan simulasi asuransi.",
    fields: [
      ["name","Nama","text"],
      ["phone","Nomor HP","text"],
      ["car","Mobil","text"],
      ["year","Tahun","number"],
      ["status","Status","select",["new","contacted","completed","rejected"]]
    ]
  }

};

let currentCollection = "new_cars";
let currentData = [];
let editingId = null;

const $ = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function isMoneyField(key) {
  return [
    "price",
    "promoPrice",
    "dp",
    "installment",
    "total",
    "amount",
    "adminFee"
  ].includes(key);
}

function formatValue(key,value) {

  if (isMoneyField(key)) {
    return new Intl.NumberFormat("id-ID",{
      style:"currency",
      currency:"IDR",
      maximumFractionDigits:0
    }).format(Number(value) || 0);
  }

  if (key === "image" || key === "proofUrl") {

    if (!value) return "-";

    return `
      <a
        href="${escapeHtml(value)}"
        target="_blank"
        rel="noopener"
      >
        Lihat
      </a>
    `;
  }

  return escapeHtml(value);
}

function isStatusField(key) {
  return key === "status" || key === "paymentStatus";
}

async function readCollection(name) {
  const snapshot = await getDocs(collection(db,name));

  return snapshot.docs.map(item => ({
    id:item.id,
    ...item.data()
  }));
}

async function loadCurrent() {
  currentData = await readCollection(currentCollection);
  renderTable(currentData);
}

function renderTable(rows) {

  const schema = schemas[currentCollection];

  $("pageTitle").textContent = schema.title;
  $("pageDescription").textContent = schema.description;

  $("tableHead").innerHTML =
    "<tr>" +
    schema.fields.map(field =>
      `<th>${escapeHtml(field[1])}</th>`
    ).join("") +
    "<th>Aksi</th>" +
    "</tr>";

  if (!rows.length) {
    $("tableBody").innerHTML = `
      <tr>
        <td
          class="empty"
          colspan="${schema.fields.length + 1}"
        >
          Belum ada data. Klik "+ Tambah Data".
        </td>
      </tr>
    `;
    return;
  }

  $("tableBody").innerHTML = rows.map(item => {

    const cells = schema.fields.map(field => {

      const key = field[0];
      const value = item[key] ?? "-";

      if (isStatusField(key)) {
        return `
          <td>
            <span class="badge ${escapeHtml(value)}">
              ${escapeHtml(value)}
            </span>
          </td>
        `;
      }

      return `
        <td>
          ${formatValue(key,value)}
        </td>
      `;

    }).join("");

    return `
      <tr>
        ${cells}

        <td>
          <div class="actions">

            <button
              class="action"
              data-action="edit"
              data-id="${item.id}"
            >
              Edit
            </button>

            <button
              class="action verify"
              data-action="verify"
              data-id="${item.id}"
            >
              Verifikasi
            </button>

            <button
              class="action reject"
              data-action="reject"
              data-id="${item.id}"
            >
              Tolak
            </button>

            <button
              class="action delete"
              data-action="delete"
              data-id="${item.id}"
            >
              Hapus
            </button>

          </div>
        </td>
      </tr>
    `;

  }).join("");
}

function openModal(item = null) {

  editingId = item?.id || null;

  $("modalTitle").textContent =
    editingId
      ? `Edit ${schemas[currentCollection].title}`
      : `Tambah ${schemas[currentCollection].title}`;

  $("formFields").innerHTML =
    schemas[currentCollection].fields.map(field => {

      const [key,label,type,options] = field;
      const value = item?.[key] ?? "";

      if (type === "textarea") {
        return `
          <label class="full">
            ${escapeHtml(label)}
            <textarea name="${key}">${escapeHtml(value)}</textarea>
          </label>
        `;
      }

      if (type === "select") {
        return `
          <label>
            ${escapeHtml(label)}

            <select name="${key}">
              ${options.map(option => `
                <option
                  value="${escapeHtml(option)}"
                  ${value === option ? "selected" : ""}
                >
                  ${escapeHtml(option)}
                </option>
              `).join("")}
            </select>
          </label>
        `;
      }

      return `
        <label>
          ${escapeHtml(label)}

          <input
            name="${key}"
            type="${type}"
            value="${escapeHtml(value)}"
          >
        </label>
      `;

    }).join("");

  $("crudModal").classList.add("active");
}

function closeModal() {
  $("crudModal").classList.remove("active");
  editingId = null;
  $("crudForm").reset();
}

$("loginForm").addEventListener("submit", async event => {

  event.preventDefault();

  $("loginError").textContent = "";

  try {

    await signInWithEmailAndPassword(
      auth,
      $("email").value.trim(),
      $("password").value
    );

  } catch (error) {

    console.error(error);

    $("loginError").textContent =
      "Email atau password tidak valid.";

  }

});

$("logoutButton").addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, async user => {

  if (
    !user ||
    user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {

    $("dashboard").classList.add("hidden");
    $("loginScreen").classList.remove("hidden");

    return;
  }

  $("loginScreen").classList.add("hidden");
  $("dashboard").classList.remove("hidden");

  $("adminEmail").textContent = user.email;

  await refreshAll();

});

$("crudForm").addEventListener("submit", async event => {

  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {};

  schemas[currentCollection].fields.forEach(field => {

    const [key,,type] = field;

    let value = formData.get(key);

    if (type === "number") {
      value = Number(value) || 0;
    }

    data[key] = value;

  });

  if (currentCollection === "used_cars") {

    data.adminFee =
      Math.round(
        Number(data.price || 0) * 0.025
      );

    data.adminFeeRate = 0.025;

  }

  if (editingId) {

    await updateDoc(
      doc(db,currentCollection,editingId),
      {
        ...data,
        updatedAt:serverTimestamp()
      }
    );

  } else {

    await addDoc(
      collection(db,currentCollection),
      {
        ...data,
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      }
    );

  }

  closeModal();

  await refreshAll();

});

$("tableBody").addEventListener("click", async event => {

  const button = event.target.closest("[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  const item = currentData.find(row => row.id === id);

  const reference = doc(
    db,
    currentCollection,
    id
  );

  if (action === "edit") {
    openModal(item);
    return;
  }

  if (action === "delete") {

    if (!confirm("Hapus data ini secara permanen?")) {
      return;
    }

    await deleteDoc(reference);

    await refreshAll();

    return;
  }

  if (action === "verify") {

    const update = {
      updatedAt:serverTimestamp()
    };

    if (currentCollection === "payments") {

      update.status = "verified";

    } else if (
      currentCollection === "new_cars" ||
      currentCollection === "accessories"
    ) {

      update.status = "active";

    } else {

      update.status = "approved";

      if ("paymentStatus" in item) {
        update.paymentStatus = "paid";
      }

    }

    await updateDoc(reference,update);

    await refreshAll();

    return;
  }

  if (action === "reject") {

    const update = {
      status:"rejected",
      updatedAt:serverTimestamp()
    };

    if ("paymentStatus" in item) {
      update.paymentStatus = "rejected";
    }

    await updateDoc(reference,update);

    await refreshAll();

  }

});

document.querySelectorAll(".nav").forEach(button => {

  button.addEventListener("click", async () => {

    document
      .querySelectorAll(".nav")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");

    currentCollection = button.dataset.col;

    $("searchInput").value = "";

    await loadCurrent();

  });

});

$("searchInput").addEventListener("input", () => {

  const keyword =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();

  if (!keyword) {
    renderTable(currentData);
    return;
  }

  const filtered = currentData.filter(item =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(keyword)
  );

  renderTable(filtered);

});

$("addButton").addEventListener("click", () => openModal());

$("closeModal").addEventListener("click", closeModal);

$("cancelModal").addEventListener("click", closeModal);

$("crudModal").addEventListener("click", event => {

  if (event.target === $("crudModal")) {
    closeModal();
  }

});

async function refreshAll() {

  const [
    cars,
    accessories,
    orders,
    payments
  ] = await Promise.all([
    readCollection("new_cars"),
    readCollection("accessories"),
    readCollection("orders"),
    readCollection("payments")
  ]);

  $("countCars").textContent = cars.length;

  $("countAccessories").textContent =
    accessories.length;

  $("countOrders").textContent =
    orders.length;

  $("countPaid").textContent =
    payments.filter(
      payment =>
        payment.status === "verified"
    ).length;

  await loadCurrent();

}
