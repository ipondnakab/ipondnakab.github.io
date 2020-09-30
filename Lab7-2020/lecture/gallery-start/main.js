const displayedImage = document.querySelector(".displayed-img");
const thumbBar = document.querySelector(".thumb-bar");

const btn = document.querySelector("button");
const overlay = document.querySelector(".overlay");

/* Looping through images */
const listImage = [
  "images/pic1.jpg",
  "images/pic2.jpg",
  "images/pic3.jpg",
  "images/pic4.jpg",
  "images/pic5.jpg",
];

for (const item of listImage) {
  const newImage = document.createElement("img");
  newImage.addEventListener("click", () => {
    displayedImage.setAttribute("src", item);
  });
  newImage.setAttribute("src", item);
  thumbBar.appendChild(newImage);
}

/* Wiring up the Darken/Lighten button */
