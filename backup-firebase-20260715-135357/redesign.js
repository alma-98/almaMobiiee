(function(){
  "use strict";

  const SMS_NUMBER = "085283397198";

  const menuButton = document.getElementById("menuButton");
  const mainNav = document.getElementById("mainNav");
  const modal = document.getElementById("smsModal");
  const smsAction = document.getElementById("smsAction");

  if(menuButton && mainNav){
    menuButton.addEventListener("click", function(){
      mainNav.classList.toggle("active");
    });

    mainNav.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click", function(){
        mainNav.classList.remove("active");
      });
    });
  }

  window.openSMS = function(message){
    const text =
      message ||
      "Halo Alma, saya menghubungi dari website almaMobiiee dan ingin konsultasi kendaraan.";

    if(smsAction){
      smsAction.href =
        "sms:" +
        SMS_NUMBER +
        "?body=" +
        encodeURIComponent(text);
    }

    if(modal){
      modal.classList.add("active");
      document.body.classList.add("modal-open");
    }
  };

  window.closeSMS = function(){
    if(modal){
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  };

  window.askCar = function(carName){
    openSMS(
      "Halo Alma, saya tertarik dengan " +
      carName +
      ". Mohon informasi dan penawarannya."
    );
  };

  if(modal){
    modal.addEventListener("click", function(event){
      if(event.target === modal){
        closeSMS();
      }
    });
  }

  document.addEventListener("keydown", function(event){
    if(event.key === "Escape"){
      closeSMS();
    }
  });

  const leadForm = document.getElementById("leadForm");

  if(leadForm){
    leadForm.addEventListener("submit", function(event){
      event.preventDefault();

      const name =
        document.getElementById("leadName").value.trim();

      const car =
        document.getElementById("leadCar").value;

      const message =
        document.getElementById("leadMessage").value.trim();

      const smsText =
        "Halo Alma, nama saya " +
        name +
        ". Saya tertarik dengan: " +
        car +
        "." +
        (message ? " Kebutuhan saya: " + message : "");

      openSMS(smsText);
    });
  }
})();


/* ==========================================================
   ALMAMOBIIEE MARKETPLACE
========================================================== */

(function(){

  "use strict";

  let cart = [];

  let currentPayment = {
    type:"",
    id:"",
    amount:0
  };


  function rupiah(number){

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:"currency",
        currency:"IDR",
        maximumFractionDigits:0
      }
    ).format(number);

  }


  function generateId(prefix){

    return (
      prefix +
      "-" +
      Date.now()
        .toString()
        .slice(-8)
    );

  }


  window.addToCart =
    function(name,price){

      const existing =
        cart.find(
          item =>
            item.name === name
        );

      if(existing){

        existing.qty += 1;

      }else{

        cart.push({
          name:name,
          price:price,
          qty:1
        });

      }

      renderCart();

      openCart();

    };


  window.removeCartItem =
    function(index){

      cart.splice(index,1);

      renderCart();

    };


  function renderCart(){

    const container =
      document.getElementById(
        "cartItems"
      );

    const count =
      document.getElementById(
        "cartCount"
      );

    const totalElement =
      document.getElementById(
        "cartTotal"
      );

    if(
      !container ||
      !count ||
      !totalElement
    ){
      return;
    }

    const quantity =
      cart.reduce(
        (sum,item) =>
          sum + item.qty,
        0
      );

    const total =
      cart.reduce(
        (sum,item) =>
          sum +
          (
            item.price *
            item.qty
          ),
        0
      );

    count.textContent =
      quantity;

    totalElement.textContent =
      rupiah(total);

    if(cart.length === 0){

      container.innerHTML =
        '<div class="cart-empty">' +
        'Keranjang masih kosong.' +
        '</div>';

      return;

    }

    container.innerHTML =
      cart.map(
        function(item,index){

          return (
            '<div class="cart-item">' +

              '<div>' +

                '<strong>' +
                  item.name +
                '</strong>' +

                '<small>' +
                  item.qty +
                  ' × ' +
                  rupiah(item.price) +
                '</small>' +

              '</div>' +

              '<button onclick="' +
                'removeCartItem(' +
                index +
                ')' +
              '">' +
                'Hapus' +
              '</button>' +

            '</div>'
          );

        }
      ).join("");

  }


  window.openCart =
    function(){

      document
        .getElementById(
          "cartDrawer"
        )
        ?.classList
        .add("active");

      document
        .getElementById(
          "cartOverlay"
        )
        ?.classList
        .add("active");

    };


  window.closeCart =
    function(){

      document
        .getElementById(
          "cartDrawer"
        )
        ?.classList
        .remove("active");

      document
        .getElementById(
          "cartOverlay"
        )
        ?.classList
        .remove("active");

    };


  window.checkoutCart =
    function(){

      if(cart.length === 0){

        alert(
          "Keranjang masih kosong."
        );

        return;

      }

      const total =
        cart.reduce(
          (sum,item) =>
            sum +
            (
              item.price *
              item.qty
            ),
          0
        );

      openPayment(
        "Checkout Accessories",
        total,
        generateId("ACC")
      );

      closeCart();

    };


  window.openPayment =
    function(
      type,
      amount,
      id
    ){

      currentPayment = {
        type:type,
        amount:amount,
        id:id
      };

      const modal =
        document.getElementById(
          "paymentModal"
        );

      document
        .getElementById(
          "paymentTitle"
        )
        .textContent =
        type;

      document
        .getElementById(
          "paymentAmount"
        )
        .textContent =
        rupiah(amount);

      document
        .getElementById(
          "paymentId"
        )
        .textContent =
        id;

      modal
        ?.classList
        .add("active");

      modal
        ?.setAttribute(
          "aria-hidden",
          "false"
        );

      document.body
        .classList
        .add("modal-open");

    };


  window.closePayment =
    function(){

      const modal =
        document.getElementById(
          "paymentModal"
        );

      modal
        ?.classList
        .remove("active");

      modal
        ?.setAttribute(
          "aria-hidden",
          "true"
        );

      document.body
        .classList
        .remove("modal-open");

    };


  window.confirmPaymentSubmission =
    function(){

      const proof =
        document.getElementById(
          "paymentProof"
        );

      const proofName =
        proof &&
        proof.files &&
        proof.files[0]
          ? proof.files[0].name
          : "Belum memilih file";

      const records =
        JSON.parse(
          localStorage.getItem(
            "almaPaymentRecords"
          ) || "[]"
        );

      records.push({

        id:
          currentPayment.id,

        type:
          currentPayment.type,

        amount:
          currentPayment.amount,

        proof:
          proofName,

        status:
          "Menunggu Verifikasi",

        createdAt:
          new Date()
            .toISOString()

      });

      localStorage.setItem(
        "almaPaymentRecords",
        JSON.stringify(records)
      );

      alert(
        "Data transaksi tersimpan di perangkat ini " +
        "dengan status Menunggu Verifikasi. " +
        "Simpan bukti pembayaran dan hubungi Alma " +
        "untuk verifikasi."
      );

      closePayment();

    };


  /* SELLER FEE */

  const sellerPrice =
    document.getElementById(
      "sellerPrice"
    );

  if(sellerPrice){

    sellerPrice.addEventListener(
      "input",
      function(){

        const price =
          Number(
            sellerPrice.value
          ) || 0;

        const fee =
          Math.round(
            price * 0.025
          );

        document
          .getElementById(
            "sellerFee"
          )
          .textContent =
          rupiah(fee);

      }
    );

  }


  const usedCarForm =
    document.getElementById(
      "usedCarForm"
    );

  if(usedCarForm){

    usedCarForm.addEventListener(
      "submit",
      function(event){

        event.preventDefault();

        const price =
          Number(
            document
              .getElementById(
                "sellerPrice"
              )
              .value
          );

        const fee =
          Math.round(
            price * 0.025
          );

        const id =
          generateId("USED");

        const submissions =
          JSON.parse(
            localStorage.getItem(
              "almaUsedCars"
            ) || "[]"
          );

        submissions.push({

          id:id,

          name:
            document
              .getElementById(
                "sellerName"
              )
              .value,

          phone:
            document
              .getElementById(
                "sellerPhone"
              )
              .value,

          car:
            document
              .getElementById(
                "sellerCar"
              )
              .value,

          year:
            document
              .getElementById(
                "sellerYear"
              )
              .value,

          price:price,

          fee:fee,

          status:
            "Menunggu Pembayaran"

        });

        localStorage.setItem(
          "almaUsedCars",
          JSON.stringify(
            submissions
          )
        );

        openPayment(
          "Biaya Layanan Mobil Second",
          fee,
          id
        );

      }
    );

  }


  /* MEDIATOR */

  const mediatorForm =
    document.getElementById(
      "mediatorForm"
    );

  if(mediatorForm){

    mediatorForm.addEventListener(
      "submit",
      function(event){

        event.preventDefault();

        const id =
          generateId("MED");

        const records =
          JSON.parse(
            localStorage.getItem(
              "almaMediators"
            ) || "[]"
          );

        records.push({

          id:id,

          name:
            document
              .getElementById(
                "mediatorName"
              )
              .value,

          phone:
            document
              .getElementById(
                "mediatorPhone"
              )
              .value,

          email:
            document
              .getElementById(
                "mediatorEmail"
              )
              .value,

          city:
            document
              .getElementById(
                "mediatorCity"
              )
              .value,

          status:
            "Menunggu Pembayaran"

        });

        localStorage.setItem(
          "almaMediators",
          JSON.stringify(records)
        );

        /*
          Biaya mediator sementara Rp100.000.
          Dapat diubah kemudian.
        */

        openPayment(
          "Biaya Administrasi Mediator",
          100000,
          id
        );

      }
    );

  }


  /* INSURANCE */

  const insuranceForm =
    document.getElementById(
      "insuranceForm"
    );

  if(insuranceForm){

    insuranceForm.addEventListener(
      "submit",
      function(event){

        event.preventDefault();

        const records =
          JSON.parse(
            localStorage.getItem(
              "almaInsurance"
            ) || "[]"
          );

        records.push({

          id:
            generateId("INS"),

          name:
            document
              .getElementById(
                "insuranceName"
              )
              .value,

          car:
            document
              .getElementById(
                "insuranceCar"
              )
              .value,

          year:
            document
              .getElementById(
                "insuranceYear"
              )
              .value,

          status:
            "Permintaan Baru"

        });

        localStorage.setItem(
          "almaInsurance",
          JSON.stringify(records)
        );

        alert(
          "Permintaan konsultasi asuransi " +
          "berhasil disimpan di perangkat ini."
        );

      }
    );

  }


  /* CREDIT SIMULATION */

  window.calculateCredit =
    function(){

      const price =
        Number(
          document
            .getElementById(
              "simPrice"
            )
            .value
        );

      const dpPercent =
        Number(
          document
            .getElementById(
              "simDp"
            )
            .value
        );

      const tenor =
        Number(
          document
            .getElementById(
              "simTenor"
            )
            .value
        );

      const dp =
        price *
        (
          dpPercent /
          100
        );

      const principal =
        price - dp;

      /*
        Estimasi sederhana.
        Bukan penawaran pembiayaan resmi.
      */

      const estimatedAnnualRate =
        0.06;

      const years =
        tenor / 12;

      const estimatedInterest =
        principal *
        estimatedAnnualRate *
        years;

      const monthly =
        (
          principal +
          estimatedInterest
        ) /
        tenor;

      document
        .getElementById(
          "simulationMonthly"
        )
        .textContent =
        rupiah(
          Math.round(monthly)
        );

      document
        .getElementById(
          "simulationDetail"
        )
        .textContent =
        "DP " +
        rupiah(
          Math.round(dp)
        ) +
        " • Tenor " +
        tenor +
        " bulan • Estimasi non-final";

    };


  renderCart();

  calculateCredit();

})();
