// Fuction for nav-bar
window.onscroll = function () {
    scrollFunction();
  };
  function scrollFunction() {
    if (
      document.body.scrollTop > 10 ||
      document.documentElement.scrollTop > 10
    ) {
      document.getElementById("navbar").style.padding = "8px 32px";
      document.getElementById("logo").style.fontSize = "1rem";
      document.getElementById("profile").style.height = "40px";
      document.getElementById("profile").style.width = "40px";
      // document.getElementById("social").style.display = "none";
      document.getElementById("discription-profile").style.fontSize =
        "0.5rem";
    } else {
      document.getElementById("navbar").style.padding = "50px 260px";
      document.getElementById("logo").style.fontSize = "1.75rem";
      document.getElementById("profile").style.height = "120px";
      document.getElementById("profile").style.width = "120px";
      // document.getElementById("social").style.display = "flex";
      document.getElementById("discription-profile").style.fontSize = "1rem";
    }
  }
  ///////////////////////////