window.onload = function() {
    var windowWidth = 640;
    var windowHeight = 480;

    document.getElementById('gameWindow').innerHTML = '<canvas id="gameStage" width="' + windowWidth + '" height="' + windowHeight + '" style="border:1px solid #d3d3d3;"></canvas>';

    var canvas = document.getElementById('gameStage');
    var context = canvas.getContext("2d");
    var audioBounce = document.getElementById("bounce");

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
            //c = document.getElementById("gameStage");
            //ctx = c.getContext("2d");
            context.fillStyle = "#732cdd";
            context.fillRect(this.posX, windowHeight - this.height, this.width, this.height);
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
                //c = document.getElementById("gameStage");
                //ctx = c.getContext("2d");
                context.fillStyle = "#2d68c6";
                context.fillRect(this.posX, this.posY, this.width, this.height);
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
            //c = document.getElementById("gameStage");
            //ctx = c.getContext("2d");
            context.arc(this.posX, this.posY, this.size, 0, 2 * Math.PI);
            context.fillStyle = "#da63ed";
            context.fill();
        };

        this.moveBall = function(player) {
            if (this.init) {
                if (this.posX + this.speedX < windowWidth - this.size / 2 || this.posX + this.speedX > this.size / 2) {
                    this.posX = this.posX + this.speedX;
                };
                if (this.posY + this.speedY < windowHeight || this.posY + this.speedY > this.size / 2) {
                    this.posY = this.posY + this.speedY;
                };
            } else {
                this.posX = player.posX + this.posOnPaddle * player.width;
                this.posY = windowHeight - (player.height + this.size / 2 + 3);
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

            for (i = 0; i < 4; i++) {
                for (j = 0; j < 8; j++)
                    this.boxes.push(new Box(j * windowWidth / 8 + 1, i * windowHeight / 16 + 1, windowWidth / 8 - 2, windowHeight / 16 - 2, 1));
            };

            this.execute();
        };

        this.clearScreen = function() {
            //var c = document.getElementById("gameStage");
            //var ctx = c.getContext("2d"); 
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
        };

        this.checkForCollision = function(ball) {
            var ballCenterX = ball.posX - ball.size / 2;
            var ballCenterY = ball.posY + ball.size / 2;
            var playerCenterX = this.player.posX + this.player.width / 2;
            if (ballCenterY >= windowHeight - this.player.height && (ballCenterX >= this.player.posX && ballCenterX <= this.player.posX + this.player.width)) {
                ball.speedY = -1 * ball.speedY;

                ball.speedX = 2 * ball.defaultSpeedX * (ballCenterX - playerCenterX) / (this.player.width / 2);
                //////audioBounce.play();
            }

            //detecting wall collision
            if (ball.posX <= ball.size / 2 || ball.posX >= windowWidth - ball.size / 2) {
                ball.speedX = -1 * ball.speedX;
                //////audioBounce.play();
            }

            if (ball.posY <= ball.size / 2) {
                ball.speedY = -1 * ball.speedY;
                //////audioBounce.play();
            }

            if (ball.posY + ball.size / 2 >= windowHeight) {
                this.running = false;
            }

            //detecting box collision
            this.boxes.forEach(function(box) {
                var collisionType;
                var distanceFromBorder;
                if (box.durability > 0) {
                    //detecting horizontal collision
                    /* if ((ball.posY - ball.size / 2 <= box.posY + box.height && ball.posY >= box.posY) &&
                         (ball.posX - ball.size / 2 >= box.posX &&
                             ball.posX + ball.size / 2 <= box.posX + box.width)) {
                         //console.log('collision 1', ball.posX, ball.posY);
                         box.durability = 0;
                         game.score = game.score + 1;
                         ball.speedY = -1 * ball.speedY;
                         //////audioBounce.play();
                         console.log(1, ball.posX - box.posX);
                         console.log(2, box.posX + box.width - ball.posX);
                         console.log(3, ball.posY - box.posY);
                         console.log(4, box.posY + box.height - ball.posY);

                     }

                     //detecting vertical collision
                     if ((ball.posX - ball.size / 2 <= box.posX + box.width && ball.posX - ball.size / 2 >= box.posX) &&
                         (ball.posY - ball.size / 2 >= box.posY &&
                             ball.posY + ball.size / 2 <= box.posY + box.height)) {
                         //console.log('collision 3', ball.posX, ball.posY);
                         box.durability = 0;
                         game.score = game.score + 1;
                         ball.speedX = -1 * ball.speedX;

                         console.log(1, ball.posX - box.posX);
                         console.log(, box.posX + box.width - ball.posX);
                         console.log(3, ball.posY - box.posY);
                         console.log(4, box.posY + box.height - ball.posY);
                         ////audioBounce.play();
                     }*/

                    //checking for collision and detecting collisionType
                    if ((ball.posY - ball.size / 2 <= box.posY + box.height && ball.posY >= box.posY) &&
                        (ball.posX - ball.size / 2 >= box.posX &&
                            ball.posX + ball.size / 2 <= box.posX + box.width)) {

                        collisionType = 1;
                        distanceFromBorder = ball.posX + ball.size / 2 - box.posX;
                        console.log(1, distanceFromBorder);
                        if (distanceFromBorder > box.posX + ball.size / 2 + box.width -
                            (ball.posX + ball.size / 2)) {
                            collisionType = 1;
                            distanceFromBorder = box.posX + box.width - (ball.posX - ball.size / 2);
                            console.log(2, distanceFromBorder);
                        }
                        if (distanceFromBorder > ball.posY + ball.size / 2 - box.posY) {
                            collisionType = 2;
                            distanceFromBorder = ball.posY + ball.size / 2 - box.posY;
                            console.log(3, distanceFromBorder);
                        }
                        if (distanceFromBorder > box.posY + box.height -
                            (ball.posY + ball.size / 2)) {
                            collisionType = 2;
                            distanceFromBorder = box.posY + box.height - (ball.posY + ball.size / 2);
                            console.log(4, distanceFromBorder);
                        }
                        console.log('--------------------------')
                        switch (collisionType) {
                            case 1:
                                ball.speedX *= -1;
                                break;
                            case 2:
                                ball.speedY *= -1;
                        }

                        box.durability = 0;
                        game.score = game.score + 1;

                    }
                };
            });
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
        var rect = canvas.getBoundingClientRect();
        var mousePosX = e.clientX - rect.left;

        if (mousePosX - game.player.width / 2 > 0 && mousePosX + game.player.width / 2 < windowWidth) {
            game.player.posX = mousePosX - game.player.width / 2;
        }

    }, false);

    $(document).ondblclick = function() {
        game.ball.init = 1;
    };

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
        console.log('clicked');
    });
    game.init();

};