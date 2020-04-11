window.onload = function() {
    var windowWidth = 640;
    var windowHeight = 480;
    var soundsOn = 1;

    document.getElementById('gameWindow').innerHTML = '<canvas id="gameStage" width="' + windowWidth + '" height="' + windowHeight + '" style="border:1px solid #d3d3d3;"></canvas>';

    var canvas = document.getElementById('gameStage');
    var context = canvas.getContext("2d");
    var audioBounce = document.getElementById("bounce");

    var ballImg = document.getElementById("ballImg");
    var paddleImg = document.getElementById("paddleImg");
    var brickImg = document.getElementById("brickImg");
    var bgImg = document.getElementById("bgImg");

    var ballBounceSnd = document.getElementById("ballBounce");
    var brickSmashSnd = document.getElementById("brickSmash");

    //renderBackground
    context.drawImage(bgImg, 0, 0, windowWidth, windowHeight);

    var debug = function(text) {
        document.getElementById('debug').innerHTML = text;
    };

    var updateScore = function(score) {
        document.getElementById('score').innerHTML = score;
    };

    function Player(x, w, h, l, s) {
        this.posX = x;
        this.width = w;
        this.height = h;
        this.lives = l;
        this.score = s;

        this.renderPad = function() {

            //context.fillStyle = "#732cdd";
            //context.fillRect(this.posX, windowHeight - this.height, this.width, this.height);

            context.drawImage(paddleImg, this.posX, windowHeight - this.height, this.width, this.height);
        };
    };

    function Box(x, y, w, h, d) {
        this.posX = x;
        this.posY = y;
        this.width = w;
        this.height = h;
        this.durability = d;

        this.renderBox = function() {
            if (this.durability > 0) {

                //context.fillStyle = "#2d68c6";
                //context.fillRect(this.posX, this.posY, this.width, this.height);
                context.drawImage(brickImg, this.posX, this.posY, this.width, this.height);
            }
        };
    };

    function Ball(s, spdX, spdY) {
        this.posX = 0;
        this.posY = 0;
        this.size = s;
        this.speedX = spdX;
        this.defaultSpeedX = spdX;
        this.speedY = spdY;
        this.boxes = [];
        this.init = 0;
        this.posOnPaddle = Math.random();

        this.renderBall = function() {
            //context.arc(this.posX, this.posY, this.size, 0, 2 * Math.PI);
            //context.fillStyle = "#da63ed";
            context.drawImage(ballImg, this.posX, this.posY, 2 * this.size, 2 * this.size);
            //context.fill();
        };

        this.moveBall = function(player) {
            if (this.init) {
                if (this.posX + this.speedX + this.size < windowWidth || this.posX + this.speedX > 0) {
                    this.posX = this.posX + this.speedX;
                };
                if (this.posY + this.speedY < windowHeight || this.posY + this.speedY > 0) {
                    this.posY = this.posY + this.speedY;
                };
            } else {
                this.posX = player.posX + this.posOnPaddle * player.width - this.size;
                this.posY = windowHeight - (player.height + this.size * 2 + 1);
            }
        };

    };

    function Game() {

        var game = this;

        this.running = false;

        this.init = function() {
            this.ball = new Ball(4, 3, 3);
            this.boxes = [];
            this.player = new Player(windowWidth / 2 - 35, 90, 15, 3, 0);
            this.score = 0;
            this.running = true;
            //Level 1
            for (i = 0; i < 6; i++) {
                for (j = 0; j < 8; j++)
                    if (i && j && i < 5 && j < 7) {
                        this.boxes.push(new Box(j * windowWidth / 8 + 1, i * windowHeight / 16 + 1, windowWidth / 8 - 2, windowHeight / 16 - 2, 1));
                    }
            };

            this.execute();
        };

        this.clearScreen = function() {
            //clear screen
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            //renderBackground
            context.drawImage(bgImg, 0, 0, windowWidth, windowHeight);
        };

        this.checkForCollision = function(ball) {
            var ballCenterX = ball.posX + ball.size;
            var ballCenterY = ball.posY + ball.size;
            var playerCenterX = this.player.posX + this.player.width / 2;
            //detecting player collision
            if (ballCenterY >= windowHeight - this.player.height && (ballCenterX >= this.player.posX && ballCenterX <= this.player.posX + this.player.width)) {
                ball.speedY = -1 * ball.speedY;

                ball.speedX = 2 * ball.defaultSpeedX * (ballCenterX - playerCenterX) / (this.player.width / 2);
                if (soundsOn) {
                    ballBounceSnd.pause();
                    ballBounceSnd.currentTime = 0;
                    ballBounceSnd.play();
                }

            }

            //detecting wall collision
            if (ball.posX <= 0 || ball.posX >= windowWidth - ball.size * 2) {
                ball.speedX = -1 * ball.speedX;
                if (soundsOn) {
                    ballBounceSnd.pause();
                    ballBounceSnd.currentTime = 0;
                    ballBounceSnd.play();
                }
            }

            if (ball.posY <= 0) {
                ball.speedY = -1 * ball.speedY;
                if (soundsOn) {
                    ballBounceSnd.pause();
                    ballBounceSnd.currentTime = 0;
                    ballBounceSnd.play();
                }
            }

            if (ball.posY + ball.size * 2 >= windowHeight) {
                this.running = false;
            }

            //detecting box collision
            for (let i = 0; i < game.boxes.length; i++) {
                var box = game.boxes[i];
                var collisionType;
                var distanceFromBorder;
                if (box.durability > 0) {

                    //checking for collision and detecting collisionType
                    if (ball.posY < box.posY + box.height && ball.posY + ball.size * 2 > box.posY &&
                        ball.posX + ball.size * 2 > box.posX && ball.posX < box.posX + box.width) {
                        if (soundsOn) {
                            brickSmashSnd.pause();
                            brickSmashSnd.currentTime = 0;
                            brickSmashSnd.play();
                        }
                        collisionType = 1;
                        distanceFromBorder = ball.posX + ball.size * 2 - box.posX;
                        //console.log(1, distanceFromBorder);
                        if (distanceFromBorder > box.posX + box.width - ball.posX) {
                            collisionType = 1;
                            distanceFromBorder = box.posX + box.width - ball.posX;
                            //console.log(2, distanceFromBorder);
                        }
                        if (distanceFromBorder > ball.posY + ball.size * 2 - box.posY) {
                            collisionType = 2;
                            distanceFromBorder = ball.posY + ball.size * 2 - box.posY;
                            //console.log(3, distanceFromBorder);
                        }
                        if (distanceFromBorder > box.posY + box.height - ball.posY) {
                            collisionType = 2;
                            distanceFromBorder = box.posY + box.height - ball.posY;
                            //console.log(4, distanceFromBorder);
                        }
                        //console.log('--------------------------')
                        switch (collisionType) {
                            case 1:
                                ball.speedX *= -1;
                                ball.posX += ball.speedX
                                break;
                            case 2:
                                ball.speedY *= -1;
                                ball.posY += ball.speedY;
                                break;
                        }

                        box.durability -= 1;
                        game.score = game.score + 100;

                        break;

                    }
                };
            };
        };

        this.execute = function() {

            game.gameLoop = setInterval(function() {
                if (game.running == false) {
                    alert('Game over ! Your final score is : ' + game.score);
                    clearInterval(game.gameLoop);
                };
                updateScore(game.score);
                game.clearScreen();
                game.ball.moveBall(game.player);
                game.checkForCollision(game.ball);
                game.player.renderPad();
                game.ball.renderBall();
                game.boxes.forEach(function(box) {
                    box.renderBox();
                });
            }, 1000 / 66);
        };
    };

    document.addEventListener("touchmove", function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        //console.log(game.player.posX,'1');
        if (touch.clientX - game.player.width / 2 > 0 && touch.clientX + game.player.width / 2 < windowWidth) {
            game.player.posX = touch.clientX - game.player.width / 2;
        }
    }, false);

    document.body.addEventListener("touchstart", function(e) {
        e.preventDefault();
    }, false);
    document.body.addEventListener("touchend", function(e) {
        e.preventDefault();
    }, false);

    document.addEventListener("mousemove", function(e) {
        if (game.running) {
            var rect = canvas.getBoundingClientRect();
            var mousePosX = e.clientX - rect.left;

            if (mousePosX > 0 && mousePosX + game.player.width < windowWidth) {
                game.player.posX = mousePosX;
            } else if (mousePosX - game.player.width < 0) {
                game.player.posX = 0;
            } else {
                game.player.posX = windowWidth - game.player.width;
            }
        }
    }, false);

    document.addEventListener("dblclick", function(e) {
        game.ball.init = 1;
    });

    $(document).keydown(function(e) {
        switch (e.which) {
            case 32:
                game.ball.init = 1;
                break;

            case 37:
                game.player.posX -= 3;
                break;

            case 39:
                game.player.posX += 3;
                break;

            default:
                return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    game = new Game();

    document.getElementById("startBtn").addEventListener('click', function(e) {
        game.init();
    });
    //game.init();

};