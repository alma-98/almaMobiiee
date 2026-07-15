import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  firebaseConfig
} from "./firebase-config.js";


const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);


function generatePublicId(prefix){

  return (
    prefix +
    "-" +
    Date.now()
      .toString()
      .slice(-8)
  );

}


async function saveDocument(
  collectionName,
  data
){

  const result =
    await addDoc(
      collection(
        db,
        collectionName
      ),
      {
        ...data,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

  return result.id;

}


/* ==========================================================
   MEDIATOR
========================================================== */

const mediatorForm =
  document.getElementById(
    "mediatorForm"
  );

if(mediatorForm){

  /*
    Hapus handler lama dengan clone,
    supaya data tidak tersimpan ganda
    ke localStorage.
  */

  const newForm =
    mediatorForm.cloneNode(true);

  mediatorForm.replaceWith(newForm);


  newForm.addEventListener(
    "submit",
    async function(event){

      event.preventDefault();

      const button =
        newForm.querySelector(
          'button[type="submit"]'
        );

      const oldText =
        button.textContent;

      button.disabled = true;
      button.textContent =
        "Menyimpan...";


      try{

        const publicId =
          generatePublicId("MED");

        await saveDocument(
          "mediators",
          {

            publicId:
              publicId,

            name:
              document
                .getElementById(
                  "mediatorName"
                )
                .value
                .trim(),

            phone:
              document
                .getElementById(
                  "mediatorPhone"
                )
                .value
                .trim(),

            email:
              document
                .getElementById(
                  "mediatorEmail"
                )
                .value
                .trim(),

            city:
              document
                .getElementById(
                  "mediatorCity"
                )
                .value
                .trim(),

            reason:
              document
                .getElementById(
                  "mediatorReason"
                )
                .value
                .trim(),

            paymentStatus:
              "pending",

            status:
              "pending"
          }
        );



        newForm.reset();

        if(feeElement){
          feeElement.textContent =
            "Rp0";
        }


      }catch(error){

        console.error(error);

        alert(
          "Data mobil second belum berhasil disimpan."
        );

      }finally{

        button.disabled = false;
        button.textContent =
          oldText;

      }

    }
  );

}


/* ==========================================================
   INSURANCE
========================================================== */

const insuranceForm =
  document.getElementById(
    "insuranceForm"
  );

if(insuranceForm){

  const newForm =
    insuranceForm.cloneNode(true);

  insuranceForm.replaceWith(newForm);


  newForm.addEventListener(
    "submit",
    async function(event){

      event.preventDefault();

      const button =
        newForm.querySelector(
          'button[type="submit"]'
        );

      const oldText =
        button.textContent;

      button.disabled = true;
      button.textContent =
        "Mengirim...";


      try{

        const publicId =
          generatePublicId("INS");


        await saveDocument(
          "insurance_requests",
          {

            publicId:
              publicId,

            name:
              document
                .getElementById(
                  "insuranceName"
                )
                .value
                .trim(),

            car:
              document
                .getElementById(
                  "insuranceCar"
                )
                .value
                .trim(),

            year:
              Number(
                document
                  .getElementById(
                    "insuranceYear"
                  )
                  .value
              ),

            status:
              "new"
          }
        );


        alert(
          "Permintaan konsultasi asuransi berhasil dikirim."
        );

        newForm.reset();


      }catch(error){

        console.error(error);

        alert(
          "Permintaan belum berhasil dikirim."
        );

      }finally{

        button.disabled = false;
        button.textContent =
          oldText;

      }

    }
  );

}


console.log(
  "almaMobiiee Firebase connected"
);
