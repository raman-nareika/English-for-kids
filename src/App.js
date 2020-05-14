import Cards from "./cards";

export default class App {
  constructor() {
    this.state = {
      page: 0,
      play: false,
      playActive: false,
      category: "",
      randomArr: [],
      errors: 0,
    };
    this.cards = new Cards();
    this.main = document.querySelector(".main");
    this.mainPageIdx = 1;
  }

  run(categoryIdx) {
    this.state.category = categoryIdx;
    this.closeMenu();
    this.activateMenu(categoryIdx);
    this.removeCategories();
    this.generate(categoryIdx);
    this.bindListeners();
    this.goToPage(this.mainPageIdx);
  }

  start() {
    this.bindModeToggle();
    [...document.querySelectorAll(".main-card.green")].forEach((c, i) => {
      c.onclick = () => this.run(i + 1);
    });
  }

  removeCategories() {
    const categories = [...document.querySelectorAll("a.main-card.green")];
    this.main = document.querySelector(".main");
    categories.forEach((category) => {
      this.main.removeChild(category);
    });
  }

  generate(i) {
    const category = this.cards.entries[i];
    const shuffled = this.shuffle(category);

    document.querySelector(".main").innerHTML = "<div class=\"rating\"></div>";
    let innerHtml = "";
    shuffled.forEach((card) => {
      innerHtml += `<div class="main__card${this.state.play ? " card-cover" : ""}"" data-audio="${card.audioSrc}">
                      <div class="front" style="background-image: url(&quot;${card.image}&quot;);">
                          <div class="card-header${this.state.play ? " none" : ""}">${card.word}</div>
                      </div>
                      <div class="back" style="background-image: url(&quot;${card.image}&quot;);">
                          <div class="card-header${this.state.play ? " none" : ""}">${card.translation}</div>
                      </div>
                      <div class="rotate${this.state.play ? " none" : ""}"></div>
                    </div>`;
    });
    innerHtml += `<button class="btn${this.state.play ? "" : " none"} start-game">Start game</button>`;
    document.querySelector(".main").innerHTML += innerHtml;
    document.querySelector(".start-game").onclick = () => this.startGame();
  }

  shuffle(arr) {
    let j; let
      temp;

    for (let i = arr.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[j];
      arr[j] = arr[i];
      arr[i] = temp;
    }
    return arr;
  }

  bindListeners() {
    this.bindMenu();
    this.bindRotateBtn();
    this.bindCardRotate();
  }

  bindMenu() {
    document.querySelector(".burger-menu").onclick = function () {
      this.classList.toggle("rotated90");
      document.querySelector(".navigation__menu").classList.toggle("navigation__menu_active");
    };
  }

  bindRotateBtn() {
    [...document.querySelectorAll(".rotate")].forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        const card = el.closest(".main__card");

        card.classList.add("translate");
        this.playAudio(card.dataset.audio);
      };
    });
  }

  bindCardRotate() {
    [...document.querySelectorAll(".main__card")].forEach((el) => {
      el.onclick = function () {
        this.classList.remove("translate");
      };
      el.onmouseleave = function () {
        this.classList.remove("translate");
      };
    });
  }

  bindModeToggle() {
    document.querySelector(".switch-input").onchange = () => this.toggleMode();
  }

  closeMenu() {
    document.querySelector(".navigation__menu").classList.remove("navigation__menu_active");
  }

  activateMenu(link) {
    [...document.querySelectorAll(".header-item")].forEach((el) => {
      el.classList.remove("active");
    });

    document.querySelectorAll(".header-item")[link].classList.add("active");
  }

  toggleMode() {
    this.state.play = !this.state.play;

    if (this.state.page === 1) {
      [...document.querySelectorAll(".card-header")].forEach((el) => el.classList.toggle("none"));
      [...document.querySelectorAll(".rotate")].forEach((el) => el.classList.toggle("none"));
      [...document.querySelectorAll(".main__card")].forEach((el) => el.classList.toggle("card-cover"));
      document.querySelector(".btn").classList.toggle("none");
    } else {
      [...document.querySelectorAll(".main__card")].forEach((el) => el.classList.toggle("green"));
    }
  }

  goToPage(page) {
    this.state.page = page;
  }

  startGame() {
    this.goToPage(2);
    this.state.playActive = true;
    const startBtn = document.querySelector(".btn");
    // off all listeners
    const elClone = startBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(elClone, startBtn);
    elClone.classList.add("repeat");
    elClone.classList.remove("start-game");
    elClone.onclick = () => this.repeat();
    this.state.randomArr = this.shuffle(this.cards.entries[this.state.category]);
    setTimeout(() => {
      this.takeAndPlay();
      [...document.querySelectorAll(".main__card.card-cover")].forEach((el) => {
        const $this = this;
        el.addEventListener("click", function () {
          if (this.dataset.audio === $this.state.lastCard.audioSrc) {
            $this.playAudio("./audio/correct.mp3");
            this.querySelector(".front").classList.add("inactive");
            this.setAttribute("disabled", "disabled");
            this.onclick = null;
            $this.drawStarRight();

            if ($this.state.randomArr.length === 0) {
              $this.finish();
            } else {
              setTimeout(() => {
                $this.takeAndPlay();
              }, 666);
            }
          } else {
            $this.playAudio("./audio/error.mp3");
            $this.drawStarWrong();
            $this.state.errors += 1;
          }
        });
      });
    }, 1000);
  }

  repeat() {
    this.playAudio(this.state.lastCard.audioSrc);
  }

  playAudio(src) {
    const audio = new Audio(src);
    audio.play();
  }

  takeAndPlay() {
    this.state.lastCard = this.state.randomArr.pop();
    this.repeat();
  }

  drawStarWrong() {
    this.drawStar("star-error");
  }

  drawStarRight() {
    this.drawStar("star-success");
  }

  drawStar(style) {
    document.querySelector(".rating").innerHTML += `<div class="${style}"></div>`;
  }

  finish() {
    document.querySelector(".main").classList.add("finished");

    if (this.state.errors > 0) {
      document.querySelector(".main").innerHTML = `<div class="errors">${this.state.errors} error(s)</div><div class="failure"></div>`;
    } else {
      document.querySelector(".main").innerHTML = "<div class=\"success\"></div>";
    }

    setTimeout(() => {
      window.location.reload(true);
    }, 1377);
  }
}
