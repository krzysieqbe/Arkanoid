window.onload = function() {
    var windowWidth = 640;
    var windowHeight = 480;
    var soundsOn = 1;

    document.getElementById('gameWindow').innerHTML = '<canvas id="gameStage" width="' + windowWidth + '" height="' + windowHeight + '" style="border:1px solid #d3d3d3;"></canvas>';

    var canvas = document.getElementById('gameStage');
    var context = canvas.getContext("2d");

    var ballImg = document.getElementById("ballImg");
    var paddleImg = document.getElementById("paddleImg");
    var brickImg = document.getElementById("brickImg");
    var brick2Img = document.getElementById("brick2Img");
    var brick3Img = document.getElementById("brick3Img");
    var bgImg = document.getElementById("bgImg");

    var ballBounceSnd = document.getElementById("ballBounce");
    var brickSmashSnd = document.getElementById("brickSmash");
    var gameOverSnd = document.getElementById("gameOver");
    var gameOver2Snd = document.getElementById("gameOver2");

    var sprinkles = [];
    //renderBackground
    context.drawImage(bgImg, 0, 0, windowWidth, windowHeight);

    var formatLevelLayout = function(array) {
        let levelLayout = [];
        for (let i = 0; i < array.length; i++) {
            let levelRow = array[i].toString().split(" ").map(Number);
            let levelRowLayout = [];
            for (let j = 0; j < levelRow.length; j++) {
                levelRowLayout.push(levelRow[j]);
            }
            levelLayout.push(levelRowLayout);
        }
        return levelLayout;
    }

    function Sprinkle(x, y, w, h, col) {
        this.posX = x;
        this.posY = y;
        this.width = w;
        this.height = h;
        this.opacity = 1.0;
        this.iteration = 0;
        this.column = col;
        this.gravity = 0.02;
        this.speedY = -0.5 + (0.1 - 0.2 * Math.round(Math.random()));
        this.speedX = (col - (4 + Math.round(Math.random()))) * 0.03 + (0.1 - 0.2 * Math.round(Math.random()));;
    }

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
                this.pts = Math.round((100 / this.durability) / 10) * 10;
                //context.fillStyle = "#2d68c6";
                //context.fillRect(this.posX, this.posY, this.width, this.height);
                switch (this.durability) {
                    case 1:
                        context.drawImage(brickImg, this.posX, this.posY, this.width, this.height);
                        break;
                    case 2:
                        context.drawImage(brick2Img, this.posX, this.posY, this.width, this.height);
                        break;
                    case 3:
                        context.drawImage(brick3Img, this.posX, this.posY, this.width, this.height);
                        break;
                }
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
            if (this.init) {
                $('#blinking-text').hide();
            } else {
                $('#blinking-text').show();
            }
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
            this.comboHits = 0;
            this.comboPoints = 0;
            this.comboTotalPoints = 0;
            this.lastHitTime = 0;
            this.levels = [];
            this.level = 1;

            this.levels.push(0);
            //getLevels 

            for (let i = 0; i < levels.length; i++) {
                let curLevel = formatLevelLayout(levels[i]);
                game.levels.push(curLevel);
            }

            this.generateBoxes();

            this.execute();
        };

        this.generateBoxes = function() {
            document.getElementById("level").innerHTML = "LeveL : " + game.level;
            document.getElementById("lives").innerHTML = " x  " + game.player.lives;
            for (i = 0; i < this.levels[this.level].length; i++) {
                for (j = 0; j < this.levels[game.level][i].length; j++) {
                    boxDur = this.levels[this.level][i][j];
                    this.boxes.push(new Box(j * windowWidth / 8 + 1, i * windowHeight / 16 + 1, windowWidth / 8 - 2, windowHeight / 16 - 2, boxDur));
                }
            };
        }

        this.checkClearLevel = function() {
            let levelClear = 1;
            for (i = 0; i < this.boxes.length; i++) {
                if (this.boxes[i].durability) {
                    levelClear = 0;
                    break;
                }
            }

            if (levelClear) {
                game.level++;
                game.boxes = [];
                game.ball = undefined;

                this.generateBoxes();
                this.ball = new Ball(4, 3, 3);
            }
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
                ball.speedY = -1 * Math.abs(ball.speedY);

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
                this.player.lives--;
                if (this.player.lives) {
                    gameOver2Snd.play();
                    document.getElementById("lives").innerHTML = " x  " + game.player.lives;
                    this.ball = new Ball(4, 3, 3);
                } else {
                    gameOverSnd.play();
                    this.running = false;
                }
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

                        if (game.lastHitTime > 0 && (new Date() - game.lastHitTime) < 1000) {
                            game.comboPoints = Math.round((1000 - (new Date() - game.lastHitTime)) / 100) * box.pts * game.comboHits / 10;
                            game.comboHits++;
                            game.comboTotalPoints += game.comboPoints;
                            document.getElementById('combo').innerHTML = game.comboHits + " Hit Combo + " + game.comboTotalPoints + "pts";
                            $('#combo').animate({ fontSize: "1.8rem" }, "fast", "linear", function() {
                                $('#combo').animate({ fontSize: "1.6rem" }, "slow", "linear");
                            })
                        } else {
                            game.comboPoints = 0;
                            game.comboHits = 1;
                            game.comboTotalPoints = box.pts;
                            document.getElementById('combo').innerHTML = "";
                        }
                        game.lastHitTime = new Date();
                        game.score = game.score + box.pts + game.comboPoints;
                        document.getElementById('score').innerHTML = game.score.toString() + ' pts';
                        $('#score').animate({ fontSize: "1.8rem" }, "fast", "linear", function() {
                            $('#score').animate({ fontSize: "1.6rem" }, "slow", "linear");
                        });

                        if (!box.durability) {
                            for (let i = 0; i < 4; i++) {
                                var sprinkRow = [];
                                for (let j = 0; j < 9; j++) {

                                    let sprinkle = new Sprinkle(box.posX + j * box.width / 9 + 1, box.posY + i * box.height / 4 + 1, box.width / 9 - 1, box.height / 4 - 1, j);
                                    console.log(sprinkle);
                                    sprinkRow.push(sprinkle);
                                }
                                sprinkles.push(sprinkRow);
                            }
                        };

                        this.checkClearLevel();

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

                game.clearScreen();
                game.ball.moveBall(game.player);
                game.checkForCollision(game.ball);
                game.player.renderPad();
                game.ball.renderBall();
                game.boxes.forEach(function(box) {
                    box.renderBox();
                });
                if (sprinkles.length) {
                    sprinkles.forEach(function(sprinkleRow, rowId) {
                        sprinkleRow.forEach(function(sprinkle, id) {
                            sprinkle.iteration++;
                            sprinkle.opacity -= sprinkle.iteration * 0.0001;
                            context.globalAlpha = sprinkle.opacity;
                            context.fillStyle = "rgb(41, 70, 135)";
                            context.fillRect(sprinkle.posX, sprinkle.posY, sprinkle.width, sprinkle.height);
                            context.globalAlpha = 1.0;
                            sprinkle.posX += sprinkle.speedX;
                            sprinkle.speedY += sprinkle.gravity;
                            sprinkle.posY += sprinkle.speedY;

                            //if (context.globalAlpha < 0.1) {
                            if (sprinkle.opacity < 0.1) {
                                sprinkles[rowId].splice(id, 1);
                                if (!sprinkles[rowId].length) {
                                    sprinkles.splice(rowId, 1);
                                }
                            }
                        });
                    });
                };

            }, 1000 / 66);

            //game.helperLoop = setInterval(function() {}, 100);

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
        $('#blinking-text').hide();
    });

    $(document).keydown(function(e) {
        switch (e.which) {
            case 32:
                game.ball.init = 1;
                $('#blinking-text').hide();
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