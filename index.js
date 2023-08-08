import brickwall from "./wall.jpg";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const iceButton = document.querySelector("#ice");
iceButton.addEventListener("click", () => {
  ice = !ice;
  if (ice) {
    canvas.style.backgroundColor = "rgb(44, 71, 96)";
  } else {
    canvas.style.backgroundColor = "transparent";
  }
});

canvas.width = innerWidth - 2;
canvas.height = innerHeight - 2;

let ice = false;
const gravity = 0.5;

class Player {
  constructor() {
    this.p = {
      x: 100,
      y: 100,
    };
    this.v = {
      x: 0,
      y: 0,
    };
    this.width = 30;
    this.height = 30;
  }

  draw() {
    ctx.fillStyle = ice ? "white" : "#f77";
    ctx.fillRect(this.p.x, this.p.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.p.y += this.v.y;

    // collision X
    if (
      this.p.x + this.width + this.v.x >= canvas.width ||
      this.p.x + this.v.x <= 0
    ) {
      this.v.x *= -0.9;
    } else {
      this.p.x += this.v.x;
    }

    // collision top
    if (this.p.y + this.v.y <= 0) {
      this.v.y *= -0.5;
    }

    // fall
    if (this.p.y + this.height + this.v.y <= canvas.height) {
      this.v.y += gravity;
    } else {
      // collission bottom
      // X friction
      friction(this);

      easeCollisionBottom(this);
    }
  }
}

class Platform {
  constructor(x, y, w, h, c, image) {
    this.p = {
      x: x || 300,
      y: y || 600,
    };
    this.v = {
      x: 0,
      y: 0,
    };
    this.image = image;
    this.width = w || 200;
    this.height = h || 2000;
    this.color = c || "#7f7";
  }

  draw() {
    if (!this.image) {
      ctx.fillStyle = this.color || "#7f7";
      ctx.fillRect(this.p.x, this.p.y, this.width, this.height);
    } else {
      ctx.drawImage(this.image, this.p.x, this.p.y, this.width, this.height);
    }
  }

  update() {
    this.draw();
    this.p.x += this.v.x;
  }
}

const image = new Image();
image.src = brickwall;

const player = new Player();
const platforms = [
  new Platform(300),
  new Platform(800, innerHeight - 200, 200, 200, "#fa8", image),
  new Platform(1200, innerHeight - 150, 100, 150, "#77f"),
];

const keys = {
  left: {
    pressed: false,
  },
  right: {
    pressed: false,
  },
};

function platformCollision(platform) {
  // bottom collisison with the platform
  if (
    player.p.y + player.height <= platform.p.y &&
    player.p.y + player.height + player.v.y >= platform.p.y &&
    player.p.x + player.width >= platform.p.x &&
    player.p.x <= platform.p.x + platform.width
  ) {
    friction(player);
    easeCollisionBottom(player);
  }

  // x collision with platform
  if (
    player.p.y + player.height >= platform.p.y &&
    player.p.y <= platform.p.y + platform.height &&
    player.p.x + player.width + player.v.x >= platform.p.x + platform.v.x &&
    player.p.x + player.v.x <= platform.p.x + platform.width + platform.v.x
  ) {
    // moveable platform
    // platform.v.x *= -0.9;
    player.v.x *= -0.9;
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  platforms.forEach((platform) => {
    platform.update();
    platformCollision(platform);
  });

  if (keys.right.pressed && player.p.x < 400) {
    player.v.x = 15;
  } else if (keys.left.pressed && player.p.x > 200) {
    player.v.x = -15;
  } else {
    platforms.forEach((platform) => {
      if (
        !(
          player.p.y + player.height >= platform.p.y &&
          player.p.y <= platform.p.y + platform.height &&
          player.p.x + player.width + player.v.x >=
            platform.p.x + platform.v.x &&
          player.p.x + player.v.x <=
            platform.p.x + platform.width + platform.v.x
        )
      ) {
        platform.v.x -= player.v.x;
        if (keys.right.pressed) {
          platform.v.x = -15;
        } else if (keys.left.pressed) {
          platform.v.x = 15;
        }
        friction(platform);
      } else {
        platform.v.x += player.v.x;
        if (keys.right.pressed) {
          platform.v.x = 15;
        } else if (keys.left.pressed) {
          platform.v.x = -15;
        }
        friction(platform);
      }
    });
    player.v.x = 0;
  }
  player.update();
}

function easeCollisionBottom(playerprop) {
  if (playerprop.v.y > 2) {
    playerprop.v.y *= -0.5;
  } else {
    playerprop.v.y = 0;
  }
}

function friction(playerprop) {
  if (playerprop.v.x < 0.5 && playerprop.v.x > -0.5) {
    playerprop.v.x = 0;
  } else {
    ice ? (playerprop.v.x *= 0.99) : (playerprop.v.x *= 0.5);
    // bouncy
    //  (playerprop.v.x *= -0.5)
  }
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
      keys.left.pressed = true;
      break;
    case "d":
      keys.right.pressed = true;
      break;
    case "ArrowLeft":
      keys.left.pressed = true;
      break;
    case "ArrowRight":
      keys.right.pressed = true;
      break;
    case "ArrowUp":
      player.v.y = -20;
      break;
    case "w":
      player.v.y = -20;
      // flight
      // setTimeout(() => {
      //   gravity = 0;
      // }, 300);
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.left.pressed = false;
      break;
    case "d":
      keys.right.pressed = false;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "ArrowRight":
      keys.right.pressed = false;
      break;
  }
});
