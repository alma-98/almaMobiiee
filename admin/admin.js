import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  firebaseConfig,
  ADMIN_EMAIL
} from
  "../js/firebase-config.js";


const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);


const loginScreen =
  document.getElementById(
    "loginScreen"
  );

const dashboard =
  document.getElementById(
    "dashboard"
  );

const loginForm =
  document.getElementById(
    "loginForm"
  );

const loginError =
  document.getElementById(
    "loginError"
  );


function escapeHtml(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


function showLogin(){

  loginScreen
    .classList
    .remove("hidden");

  dashboard
    .classList
    .add("hidden");

}


function showDashboard(){

  loginScreen
    .classList
    .add("hidden");

  dashboard
    .classList
    .remove("hidden");

}


loginForm.addEventListener(
  "submit",
  async function(event){

    event.preventDefault();

    loginError.textContent = "";


    const email =
      document
        .getElementById(
          "email"
        )
        .value
        .trim()
        .toLowerCase();

    const password =
      document
        .getElementById(
          "password"
        )
        .value;


    if(
      email !==
      ADMIN_EMAIL.toLowerCase()
    ){

      loginError.textContent =
        "Akun ini bukan administrator.";

      return;

    }


    try{

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    }catch(error){

      console.error(error);

      loginError.textContent =
        "Email atau password tidak valid.";

    }

  }
);


document
  .getElementById(
    "logoutButton"
  )
  .addEventListener(
    "click",
    function(){

      signOut(auth);

    }
  );


onAuthStateChanged(
  auth,
  async function(user){

    if(!user){

      showLogin();

      return;

    }


    if(
      user.email
        ?.toLowerCase()
      !==
      ADMIN_EMAIL
        .toLowerCase()
    ){

      await signOut(auth);

      showLogin();

      return;

    }


    document
      .getElementById(
        "adminEmail"
      )
      .textContent =
      user.email;


    showDashboard();

    await loadDashboard();

  }
);


async function getCollectionData(
  collectionName
){

  try{

    const snapshot =
      await getDocs(
        query(
          collection(
            db,
            collectionName
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

    return snapshot.docs.map(
      doc => ({
        id:doc.id,
        ...doc.data()
      })
    );

  }catch(error){

    console.error(
      collectionName,
      error
    );

    return [];

  }

}


function renderList(
  elementId,
  items,
  formatter
){

  const element =
    document.getElementById(
      elementId
    );

  if(items.length === 0){

    element.innerHTML =
      '<div class="empty">' +
      'Belum ada data.' +
      '</div>';

    return;

  }

  element.innerHTML =
    items.map(formatter).join("");

}


async function loadDashboard(){

  const [
    mediators,
    usedCars,
    insurance
  ] =
    await Promise.all([

      getCollectionData(
        "mediators"
      ),

      getCollectionData(
        "used_cars"
      ),

      getCollectionData(
        "insurance_requests"
      )

    ]);


  document
    .getElementById(
      "mediatorCount"
    )
    .textContent =
    mediators.length;


  document
    .getElementById(
      "usedCarCount"
    )
    .textContent =
    usedCars.length;


  document
    .getElementById(
      "insuranceCount"
    )
    .textContent =
    insurance.length;


  renderList(
    "mediatorList",
    mediators,
    item => `
      <article class="data-card">
        <div class="data-card-header">
          <div>
            <strong>
              ${escapeHtml(item.name)}
            </strong>
            <small>
              ${escapeHtml(item.publicId)}
            </small>
          </div>
          <small>
            ${escapeHtml(item.city)}
          </small>
        </div>

        <div class="status">
          ${escapeHtml(item.status)}
        </div>
      </article>
    `
  );


  renderList(
    "usedCarList",
    usedCars,
    item => `
      <article class="data-card">
        <div class="data-card-header">
          <div>
            <strong>
              ${escapeHtml(item.car)}
            </strong>
            <small>
              ${escapeHtml(item.publicId)}
            </small>
          </div>
          <small>
            ${escapeHtml(item.year)}
          </small>
        </div>

        <div class="status">
          ${escapeHtml(item.status)}
        </div>
      </article>
    `
  );


  renderList(
    "insuranceList",
    insurance,
    item => `
      <article class="data-card">
        <div class="data-card-header">
          <div>
            <strong>
              ${escapeHtml(item.name)}
            </strong>
            <small>
              ${escapeHtml(item.car)}
            </small>
          </div>
          <small>
            ${escapeHtml(item.year)}
          </small>
        </div>

        <div class="status">
          ${escapeHtml(item.status)}
        </div>
      </article>
    `
  );

}
