var width = window.innerWidth;
var height = window.innerHeight;
var score = 0; //得分
var changeScore = 10;//切换背景得分
var changeBGScore = 0; //切换背景得分
var scoreText;//得分文字说明，添加到舞台上
var topScore = 0;//最高得分
var distance = 180;//上下烟囱之间的距离
var MaxChinmeyNum = 5;//每次游戏开始默认生成10个烟囱，上下各5个
var ChimneyGroupsUp;//上面的烟囱组
var ChimneyGroupsDown;//下面的烟囱组
var minChimneyHeight = 120;//烟囱在场景上最小的Y值
var maxChimneyHeight = 300;//烟囱在场景上最大的Y值
var birdDropSpeed = 1200;
var speed = -280;//烟囱移动速度
var day = '#6ec5ce';
var night = '#0493a2';
var game = new Phaser.Game(width,height,Phaser.AuTO,'conc');

game.states = {};
game.states.boot = function(){
    this.preload = function(){
        this.load.image('loading','assets/image/progress.png');
    };
    this.create = function(){
        this.state.start('preload');
    }
}
    
game.states.preload = function(){
    this.preload = function(){
        var loadingSprite = this.add.sprite(
            (this.world.width - 311)/2,
            this.world.height/2,
            'loading'
        );
        this.load.setPreloadSprite(loadingSprite,0);
        this.load.image('bg','assets/image/bg.png');
        this.load.atlasJSONHash('ui','assets/image/ui.png','assets/image/ui');
        this.load.audio('die','assets/audio/die.wav');
        this.load.audio('music','assets/audio/bg.mp3');
    }
    this.create = function(){
        this.state.start('menu');
    }
}
    
game.states.menu = function(){
    this.create = function(){
        this.bg = this.add.sprite(0,0,'bg');
        this.bird = this.add.sprite(0,0,'ui','bird1.png');
        this.bird.anchor.set(0.5);
        this.bird.x = game.world.centerX;
        this.bird.y = game.world.centerY - 100;
        this.bird.animations.add('bird_fly',['bird1.png','bird2.png','bird3.png'],20,true,false);
        this.bird.animations.play('bird_fly');

        this.startButton = this.add.sprite(0,0,'ui','button.png');
        this.startButton.anchor.set(0.5);
        this.startButton.x = game.world.centerX;
        this.startButton.y = this.bird.y + this.bird.height + this.startButton.height/2;
        this.startButton.inputEnabled = true;
        this.startButton.input.useHandCursor = true;
        this.startButton.events.onInputDown.add(this.startGame,this);
    }
    this.startGame = function(){
        this.bg.destroy();
        this.bird.destroy();
        this.startButton.destroy();
        game.state.start('start');
    }
}

game.states.start = function(){
    this.preload = function(){
        game.stage.backgroundColor = day;//设置背景色为白天
        this.cloud1 = this.add.tileSprite(0,game.height - 68*2,game.width,95,'ui','cloud1.png');
        this.cloud1.autoScroll(speed / 10,0);//自动重复滚动
        this.cloud2 = this.add.tileSprite(0,game.height - 68*2,game.width,95,'ui','cloud2.png');
        this.cloud2.autoScroll(speed / 10, 0);//自动重复滚动
        this.cloud2.visible = false;//隐藏
        this.building1 = this.add.tileSprite(0,game.height - 68,game.width,68,'ui','building1.png');
        this.building1.autoScroll(speed/5,0);
        this.building2 = this.add.tileSprite(0,game.height - 68,game.width,68,'ui','building2.png');
        this.building2.autoScroll(speed/5,0);
        this.building2.visible = false;//隐藏
        this.bang = this.add.audio('die');
        this.music = this.add.audio('music');
        this.input.maxPointers = 1;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //初始化状态
        score = 0;
        changeBGScore = 0;
    },
    this.create = function(){
        this.music.play('',0,1,true);
        this.bird = this.add.sprite(0,300,'ui','bird1.png');
        game.physics.arcade.enable(this.bird);
        this.bird.anchor.set(0.5);
        this.bird.x = game.world.centerX;
        this.bird.y = game.world.centerY;
        this.bird.animations.add('bird_fly',['bird1.png','bird2.png','bird3.png'],20,true,false);
        this.bird.animations.play('bird_fly');
        this.bird.body.gravity.y = birdDropSpeed;
        ChimneyGroupsUp = game.add.group();//上面的烟囱组
        ChimneyGroupsDown = game.add.group();
        fInitChimney();
        topScore = localStorage.getItem('bird_topScore');
        topScore = topScore === null ? 0 : topScore;
        scoreText = game.add.text(10,10,'-',{
            font:'bold 18px Arail',
            fill:'#fff'
        });
        game.input.onDown.add(this.fly,this);
        fUpdateScore();
        fMoveAChimney();
        //对上面的烟囱组每个元素和其子元素开启碰撞检测
        ChimneyGroupsUp.forEach(function(Chimney){
            game.physics.arcade.collide(this.bird,Chimney);
            Chimney.children.forEach(function(item){
                game.physics.arcade.collide(this.bird,item);
            },this);
        },this);
        //对下面的烟囱组每个元素和其子元素开启碰撞检测
        ChimneyGroupsDown.forEach(function(Chimney){
            game.physics.arcade.collide(this.bird,Chimney);
            Chimney.children.forEach(function(item){
                game.physics.arcade.collide(this.bird,item);
            },this);
        },this);
        //利用时钟事件循环产生管道
        game.time.events.loop(1500,fMoveAChimney,this);
    }
    this.update = function(){
        //小鸟飞出或跌落舞台
        if(this.bird.x <= 0 || this.bird.x >= game.width || 
            this.bird.y <= 0 || this.bird.y >= game.height){
            this.gameOver();
        }
        //小鸟头小于90，则头不断向下掉
        if(this.bird.angle < 90){
            this.bird.angle += 2.5;
        }
        //每一帧检测所有烟囱的碰撞，碰撞则game over
        //上面的烟囱飞过，则表示小鸟通过，加1分，下面的烟囱无法飞过，只有碰撞
        ChimneyGroupsUp.forEach(function(Chimney){
            if(Chimney.x + Chimney.width/2 < this.bird.width + this.bird.width/2 && Chimney.scored == false){
                Chimney.scored = true;
                score += 1;
                changeBGScore += 1;
                fUpdateScore();
            }
            game.physics.arcade.overlap(this.bird,Chimney,this.gameOver,null,this);
            Chimney.children.forEach(function(item){
                game.physics.arcade.overlap(this.bird,item,this.gameOver,null,this);
            },this);
        },this);
        ChimneyGroupsDown.forEach(function(Chimney){
            game.physics.arcade.overlap(this.bird,Chimney,this.gameOver,null,this);
            Chimney.children.forEach(function(item){
                game.physics.arcade.overlap(this.bird,item,this.gameOver,null,this);
            },this);
        },this);
        //是否要切换背景
        if(changeBGScore === changeScore){
            //清空统计
            changeBGScore = 0;
            //切换到黑夜
            if(this.cloud2.visible === false){
                this.cloud2.visible = true;
                this.building2.visible = false;
                this.cloud1.visible = false;
                this.building1.visible = false;
                game.stage.backgroundColor = night;
            }
            //切换到白天
            else{
                this.cloud2.visible = false;
                this.building2.visible = false;
                this.cloud1.visible = true;
                this.building1.visible = true;
                game.stage.backgroundColor = day;
            }
        }
    }
    this.fly = function(){
        if(this.bird){
            this.bird.body.velocity.y = -350;//给小鸟设置一个向上的速度
            //上升时候头朝上动画
            game.add.tween(this.bird).to({angle:-30},100,null,true,0,0,false);
        }
    }
    this.gameOver = function(){
        this.bang.play();
        // fClearChimney();
        localStorage.setItem('bird_topScore',Math.max(score,topScore));
        // fUpdateScore();
        this.music.stop();
        this.cloud1.destroy();
        this.cloud2.destroy();
        this.building1.destroy();
        this.building2.destroy();
        this.bird.destroy();
        this.bang.destroy();
        this.music.destroy();
        game.state.start('stop');
    }
}

game.states.stop = function(){
    this.preload = function(){
        game.stage.backgroundColor = day;
        this.bird = this.add.sprite(0,0,'ui','bird1.png');
        this.bird.anchor.set(0.5);
        this.bird.x = game.world.centerX;
        this.bird.y = game.world.centerY - 100;
        this.bird.animations.add('bird_fly',['bird1.png','bird2.png','bird3.png'],20,true,false);
        this.bird.animations.play('bird_fly');
        this.startButton = this.add.sprite(0,0,'ui','button.png');
        this.startButton.anchor.set(0.5);
        this.startButton.x = game.world.centerX;
        this.startButton.y = this.bird.y + this.bird.height + this.startButton.height / 2;
        this.startButton.inputEnabled = true;
        this.startButton.input.useHandCursor = true;
        this.startButton.events.onInputDown.add(this.startGame,this);
        soreText = game.add.text(0,this.bird.y - this.bird.height - 30,'-',{
            font:'bold 28px Arial',
            fill:'#fff'
        });
        scoreText.anchor.set(0.5);
        scoreText.x = this.bird.x;
    }
    this.create = function(){
        fUpdateScore();
    }
    this.startGame = function(){
        this.bird.destroy();
        this.startButton.destroy();
        scoreText.destroy();
        game.state.start('start');
    }
}

Object.keys(game.states).forEach(function(item){
    game.state.add(item,game.states[item]);
});

game.state.start('boot');

//移动一个烟囱
function fMoveAChimney(){
    var up = ChimneyGroupsUp.getFirstDead();
    if(up == null){
        return;
    }
    var y = game.rnd.between(minChimneyHeight,maxChimneyHeight);
    up.reset(game.width,y);
    up.scored = false;
    up.body.velocity.x = speed;
    var down = ChimneyGroupsDown.getFirstDead();
    if(down != null){
        down.angle = 0;
        down.reset(game.width,y + distance);
        down.body.velocity.x = speed;
    }
}

//每次游戏重新开始的时候，清空保存的烟囱数组
function fClearChimney(){
    ChimneyGroupsUp.forEach(function(Chimney){
        Chimney.destroy();
    });
    ChimneyGroupsUp.destroy();
    ChimneyGroupsDown.forEach(function(Chimney){
        Chimney.destroy();
    });
    ChimneyGroupsDown.destroy();
}
//随机10个烟囱
function fInitChimney(){
    fInitUpChimney();
    fInitDownChimney();
    ChimneyGroupsUp.setAll('checkWorldBounds',true);
    ChimneyGroupsUp.setAll('outOfBoundsKill',true);
    ChimneyGroupsDown.setAll('checkWorldBounds',true);
    ChimneyGroupsDown.setAll('outOfBoundsKill',true);
}

function fInitUpChimney(){
    for(var i=0;i<MaxChinmeyNum;i++){
        var chimney = game.add.sprite(game.width,game.height,'ui','6.png');
        chimney.scored = false;
        chimney.anchor.set(0.5);
        chimney.angle = 180;
        game.physics.arcade.enable(chimney);
        var halfH = chimney.height / 2;
        var body = game.add.sprite(0,0,'ui','9.png');
        body.anchor.set(0.5,1.5);
        body.angle = 180;
        game.physics.arcade.enable(body);
        chimney.addChild(body);
        var n = Math.floor((game.height - halfH) / body.height);
        for(var j=0;j<n;j++){
            var b = game.add.sprite(0,0,'ui','9.png');
            b.anchor.set(0.5,1.5 + (j+1));
            b.angle = 180;
            chimney.addChild(b);
            game.physics.arcade.enable(b);
        }
        chimney.alive = false;
        chimney.visible = false;
        ChimneyGroupsUp.add(chimney);
    }
}

function fInitDownChimney(){
    for(var i=0;i<MaxChinmeyNum;i++){
        var chimney = game.add.sprite(game.width,0,'ui','6.png');
        chimney.anchor.set(0.5);
        game.physics.arcade.enable(chimney);
        var halfH = chimney.height / 2;
        var body = game.add.sprite(0,0,'ui','9.png');
        body.anchor.set(0.5,-0.5);
        game.physics.arcade.enable(body);
        chimney.addChild(body);
        var n = Math.floor((game.height - halfH) / body.height);
        for(var j=0;j<n;j++){
            var b = game.add.sprite(0,0,'ui','9.png');
            b.anchor.set(0.5,-0.5 - (j+1));
            chimney.addChild(b);
            game.physics.arcade.enable(b);
        }
        chimney.alive = false;
        chimney.visible = false;
        ChimneyGroupsDown.add(chimney);
    }
}

function fUpdateScore(){
    scoreText.text = '得分：' + score + " 最高得分：" + Math.max(score,topScore);
}
