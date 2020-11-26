// Fuction for nav-bar
const nav = document.createElement("div");
nav.innerHTML = `<nav id="navbar">
<header id="navbar-left">
  <img
    id="profile"
    src="https://scontent.fbkk2-8.fna.fbcdn.net/v/t1.0-9/118520247_3322103017883628_7802174489436117407_o.jpg?_nc_cat=102&ccb=2&_nc_sid=09cbfe&_nc_eui2=AeHdCge8IFIBSXzkbz6-n_ABx6HMRBuM14THocxEG4zXhLyFzJpIDdxeU8z0KHa3s-DzUdM0X6hj566NC_v5E0IJ&_nc_ohc=r7F9KNRw5yUAX9RlDZw&_nc_ht=scontent.fbkk2-8.fna&oh=1913979f28bd7d99d5c703716d4d2081&oe=5FD961AD"
    alt="Profile"
  />
  <div class="detail">
    <h1 href="#default" id="logo">Kittipat Daengdee</h1>
    <p id="discription-profile">
      Computer Engineering of KhonKaenUniversity
    </p>
  </div>
</header>
<section id="navbar-right">
  <div id="social">
    <article class="item-social">
      <a href="https://www.facebook.com/ipondnakab">
        <img
          class="logo-social"
          src="https://www.flaticon.com/svg/static/icons/svg/1384/1384005.svg"
          alt="logo-facebook"
        />
      </a>
    </article>
    <article class="item-social">
      <a href="https://www.instagram.com/ipondnakab/">
        <img
          class="logo-social"
          src="https://www.flaticon.com/svg/static/icons/svg/1384/1384015.svg"
          alt="logo-facebook"
        />
      </a>
    </article>
    <article class="item-social">
      <a href="">
        <img
          class="logo-social"
          src="https://www.flaticon.com/svg/static/icons/svg/82/82105.svg"
          alt="logo-facebook"
        />
      </a>
    </article>
  </div>
</section>
</nav>`;

const footer = document.createElement("footer");
footer.setAttribute("id", "credit");
footer.innerHTML = `<div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>`;
document.body.appendChild(nav);
document.body.appendChild(footer);

window.onscroll = function () {
  scrollFunction();
};
function scrollFunction() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    document.getElementById("navbar").style.padding = "8px 32px";
    document.getElementById("logo").style.fontSize = "1rem";
    document.getElementById("profile").style.height = "40px";
    document.getElementById("profile").style.width = "40px";
    // document.getElementById("social").style.display = "none";
    document.getElementById("discription-profile").style.fontSize = "0.5rem";
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
