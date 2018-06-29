var width = window.innerWidth,
    height = window.innerHeight;

var game = new Phaser.Game(width,height,Phaser.AUTO,'#game');
var states = {
    preload:function(){
        this.preload = function(){
            //设置背景色
            game.stage.backgroundColor = '#000';
            //加载资源
            game.load.crossOrigin = 'anonymous';
            game.load.image('bg','//172.28.152.124:3000/assets/images/bg.png');
            game.load.image('dude','//172.28.152.124:3000/assets/images/dude.png');
            game.load.image('green','//172.28.152.124:3000/assets/images/green.png');
            game.load.image('red','//172.28.152.124:3000/assets/images/red.png');
            game.load.image('yellow','//172.28.152.124:3000/assets/images/yellow.png');
            game.load.image('bomb','//172.28.152.124:3000/assets/images/bomb.png');
            game.load.image('five','//172.28.152.124:3000/assets/images/five.png');
            game.load.image('three','//172.28.152.124:3000/assets/images/three.png');
            game.load.image('one','//172.28.152.124:3000/assets/images/one.png');
            game.load.audio('bgMusic','//172.28.152.124:3000/assets/audio/bgMusic.mp3');
            //显示加载进度条
            var progressText = game.add.text(game.world.centerX,game.world.centerY,'0%',{
                fontSize: '60px',
                fill: '#fff'
            });
            progressText.anchor.setTo(0.5,0.5);
            //监听加载完一个文件的事件
            game.load.onFileComplete.add(function(progress){
                progressText.text = progress + '%';
            });
            //监听加载完毕事件
            game.load.onLoadComplete.add(onLoad);
            //最小展示时间，示例为3秒
            var deadLine = false;
            setTimeout(function(){
                deadLine = true;
            },1000);
            //加载完毕回调方法
            function onLoad(){
                if(deadLine){
                    //已达最小展示时间，可以进入下一个场景
                    game.state.start('created');
                }
                else{
                    //还没有到最小展示时间，1秒后重试
                    setTimeout(onLoad,1000);
                }
            }
        }
    },
    created:function(){
        this.create = function(){
            //添加背景
            var bg = game.add.image(0,0,'bg');
            bg.width = game.world.width;
            bg.height = game.world.height;
            //添加标题
            var title = game.add.text(game.world.centerX,game.world.height*0.25,'小恐龙接苹果',{
                fontSize: '40px',
                fontWeight: 'bold',
                fill: '#f2bb15'
            });
            title.anchor.setTo(0.5,0.5);
            //添加提示
            var remind = game.add.text(game.world.centerX, game.world.centerY, '点击任意位置开始',{
                fontSize: '20px',
                fill: '#f2bb15'
            });
            remind.anchor.setTo(0.5,0.5);
            //添加主角
            var man = game.add.sprite(game.world.centerX,game.world.height*0.75,'dude');
            var manImage = game.cache.getImage('dude');
            man.width = game.world.width * 0.2;
            man.height = man.width / manImage.width * manImage.height;
            man.anchor.setTo(0.5,0.5);
            //添加点击事件
            game.input.onTap.add(function(){
                game.state.start('play');
            });
        }
    },
    play:function(){
        var man, //主角
            apples, //苹果
            score, //得分
            title, //分数
            scoreMusic,
            bombMusic,
            bgMusic;
        this.create = function(){
            score = 0;
            //开启物理引擎
            game.physics.startSystem(Phaser.Physics.Arcade);
            game.physics.arcade.gravity.y = 300;
            //得分，添加背景音乐
            if(!bgMusic){
                bgMusic = game.add.audio('bgMusic');
                bgMusic.loopFull();
            }
            //缓存其他音乐
            scoreMusic = game.add.audio('scoreMusic');
            bombMusic = game.add.audio('bombMusic');
            //添加背景
            var bg = game.add.image(0,0,'bg');
            bg.width = game.world.width;
            bg.height = game.world.height;
            //添加主角
            man = game.add.sprite(game.world.centerX,game.world.height*0.75,'dude');
            var manImage = game.cache.getImage('dude');
            //宽度自己定义
            man.width = game.world.width * 0.2;
            //高度是根据宽度对原图宽度的放大比例，等比缩放
            man.height = man.width / manImage.width * manImage.height;
            man.anchor.setTo(0.5,0.5);
            game.physics.enable(man);
            man.body.allowGravity = false;
            //添加分数
            title = game.add.text(game.world.centerX,game.world.height *0.25,'0',{
                fontSize:'40px',
                fontWeight:'bold',
                fill:'#f2bb15'
            });
            title.anchor.setTo(0.5,0.5);
            //是否正在触摸
            var touching = false;
            //监听按下事件
            game.input.onDown.add(function(pointer){
                if(Math.abs(pointer.x - man.x) < man.width/2){
                    touching = true;
                }
            });
            //监听离开事件
            game.input.onUp.add(function(){
                touching = false;
            });
            //监听滑动事件
            game.input.addMoveCallback(function(pointer,x,y,isTap){
                if(!isTap && touching){
                    man.x = x;
                }
            });
            //添加苹果组
            apples = game.add.group();
            //苹果类型
            var appleTypes = ['green','red','yellow','bomb'];
            var appleTimer = game.time.create(true);
            appleTimer.loop(1000,function(){
                var x = Math.random() * game.world.width;
                var index = Math.floor(Math.random() * appleTypes.length);
                var type = appleTypes[index];
                var apple = apples.create(x,0,type);
                apple.type = type;
                //设置苹果加入物理运动
                game.physics.enable(apple);
                //设置苹果大小
                var appleImg = game.cache.getImage(type);
                apple.width = game.world.width / 8;
                apple.height = apple.width / appleImg.width * appleImg.height;
                //设置苹果与游戏边缘碰撞
                apple.body.collideWorldBounds = true;
                apple.body.onWorldBounds = new Phaser.Signal();
                apple.body.onWorldBounds.add(function(apple,up,down,left,right){
                    if(down){
                        apple.kill();
                        if(apple.type !== 'bomb'){
                            game.state.start('over',true,false,score);
                        }
                    }
                });
            });
            appleTimer.start();
        };
        this.update = function(){
            game.physics.arcade.overlap(man,apples,pickApple,null,this);
        };
        //接触事件
        function pickApple(man,apple){
            if(apple.type == 'bomb'){
                //播放音乐
                bombMusic.play();
                game.state.start('over',true,false,score);
            }
            else{
                var point = 1;
                var img = 'one';
                if(apple.type == 'red'){
                    point = 3;
                    img = 'three';
                }
                else if(apple.type == 'yellow'){
                    point = 5;
                    img = 'five';
                }
            }
            //添加得分图片
            var goal = game.add.image(apple.x,apple.y,img);
            var goalImg = game.cache.getImage(img);
            goal.width = apple.width;
            goal.height = (goal.width/goalImg.width) * goalImg.height;
            goal.alpha = 0;
            //添加过渡效果
            var showTween = game.add.tween(goal).to({
                alpha: 1,
                y: goal.y - 20
            },100, Phaser.Easing.Linear.None,true,0,0,false);
            showTween.onComplete.add(function(){
                var hideTween = game.add.tween(goal).to({
                    alpha: 0,
                    y:goal.y - 20
                }, 100, Phaser.Easing.Linear.None, true, 200, 0 ,false);
                hideTween.onComplete.add(function(){
                    goal.kill();
                });
            });
            //更新分数
            score += point;
            title.text = score;
            //清除苹果
            apple.kill();
            //播放音乐
            scoreMusic.play();
        }
    },
    over:function(){
        var score = 0;
        this.init = function(){
            score = arguments[0];
        }
        this.create = function(){
            //添加背景
            var bg = game.add.image(0,0,'bg');
            bg.width = game.world.width;
            bg.height = game.world.height;
            //添加文本
            var title = game.add.text(game.world.centerX, game.world.height * 0.25,'游戏结束',{
                fontSize: '40px',
                fontWeight: 'bold',
                fill: '#f2bb15'
            });
            title.anchor.setTo(0.5,0.5);
            var scoreStr = '你的得分是：' + score + '分';
            var scoreText = game.add.text(game.world.centerX, game.world.height * 0.4, scoreStr,{
                fontSize: '30px',
                fontWeight: 'bold',
                fill: '#f2bb15'
            });
            scoreText.anchor.setTo(0.5,0.5);
            var remind = game.add.text(game.world.centerX,game.world.height * 0.6,
            '点击任意位置再玩一次',{
                fontSize: '20px',
                fontWeight: 'bold',
                fill: '#f2bb15'
            });
            remind.anchor.setTo(0.5,0.5);
            //添加点击事件
            game.input.onTap.add(function(){
                game.state.start('play');
            });
        }
    }
}

Object.keys(states).map(function(key){
    game.state.add(key,states[key]);
})

//启动游戏
game.state.start('preload');