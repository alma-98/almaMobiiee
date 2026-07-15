(function(){
  "use strict";

  function getInsuranceOrders(){
    try{
      return JSON.parse(
        localStorage.getItem("alma_insurance_orders")
      ) || [];
    }catch(error){
      return [];
    }
  }

  function saveInsuranceOrders(data){
    localStorage.setItem(
      "alma_insurance_orders",
      JSON.stringify(data)
    );
  }

  function value(id){
    const element =
      document.getElementById(id);

    return element
      ? element.value.trim()
      : "";
  }

  window.almaSubmitInsurance = function(event){
    event.preventDefault();

    const order = {
      id:
        "INS-" +
        Date.now(),

      createdAt:
        new Date().toISOString(),

      customer:
        value("insuranceName"),

      phone:
        value("insurancePhone"),

      email:
        value("insuranceEmail"),

      vehicleType:
        value("insuranceVehicleType"),

      vehicle:
        value("insuranceVehicle"),

      year:
        value("insuranceYear"),

      plate:
        value("insurancePlate"),

      value:
        value("insuranceValue"),

      coverage:
        value("insuranceCoverage"),

      area:
        value("insuranceArea"),

      note:
        value("insuranceNote"),

      status:
        "Pengajuan Baru"
    };

    const orders =
      getInsuranceOrders();

    orders.unshift(order);

    saveInsuranceOrders(orders);

    const message =
      "Halo Alma, saya ingin mengajukan informasi asuransi kendaraan melalui almaMobiiee." +
      "\n\nID Pengajuan: " + order.id +
      "\nNama: " + order.customer +
      "\nNo. HP: " + order.phone +
      "\nKendaraan: " + order.vehicle +
      "\nTahun: " + order.year +
      "\nJenis Perlindungan: " + order.coverage +
      "\nNilai Kendaraan: " + order.value +
      "\nWilayah: " + order.area +
      "\n\nMohon informasi penawaran asuransinya.";

    event.target.reset();

    if(
      typeof window.almaOpenSMS ===
      "function"
    ){
      window.almaOpenSMS(message);
    }else{
      window.location.href =
        "sms:085283397198?body=" +
        encodeURIComponent(message);
    }
  };
})();
