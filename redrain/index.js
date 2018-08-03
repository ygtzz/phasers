var gWidth = window.innerWidth;
var gHeight = window.innerHeight;
// var gHeight = 1493/2;

var game = new Phaser.Game(gWidth,gHeight,Phaser.AuTO,'conc');

game.states = {};
game.states.boot = function(){
    this.preload = function(){
        this.load.image('loading','assets/images/progress.png');
    };
    this.create = function(){
        this.state.start('preload');
    }
}
    
game.states.boot = function(){
    this.preload = function(){
        var loadingSprite = this.add.sprite(
            (this.world.width - 311)/2,
            this.world.height/2,
            'loading'
        );
        this.load.setPreloadSprite(loadingSprite,0);
        this.load.image('menu_bg','assets/images/state1_bg.jpg');
        this.load.image('btn_play','assets/images/btn_play.png');
        this.load.image('top_logo','assets/images/logo.png');
        this.load.image('footer_logo','assets/images/footer_logo.png');
        this.load.image('play_bg','assets/images/state2_bg.jpg');
        this.load.image('redpack','assets/images/prod_redpacket.png');
        this.load.image('redpack','assets/images/prod_redpacket.png');
        // this.load.image('player_sprites','assets/images/player_sprites.png');
        this.load.image('player','assets/images/red_player0.png');
    }
    this.create = function(){
        this.state.start('play');
    }
}
    
game.states.menu = function(){
    this.create = function(){
        this.centerX = this.world.centerX;
        //背景
        this.menu_bg = this.add.image(0,0,'menu_bg');
        this.menu_bg.scale.set(0.5);
        //顶部logo
        this.logo = this.add.image(28/2,30/2,'top_logo');
        this.logo.scale.set(0.5);
        //开始按钮
        this.btnPlay = this.add.sprite(this.centerX,894/2,'btn_play');
        this.btnPlay.scale.set(0.5);
        this.btnPlay.anchor.set(0.5,0);
        this.btnPlay.inputEnabled = true;
        //todo 如何添加按钮点击active效果
        this.btnPlay.input.useHandCursor = true;
        this.btnPlay.events.onInputDown.add(this.startGame,this);
        //底部logo
        this.bottomgroup = this.add.group();
        this.footer_logo = this.add.image(this.centerX,1221/2,'footer_logo');
        this.footer_logo.scale.set(0.5);
        this.footer_logo.anchor.set(0.5,0);
        //logo文字
        this.footer_text1 = this.add.text(this.centerX,1266/2,'A股上市公司奥马电器(002668)旗下',{
            font:'normal 12px Arail',
            fill:'#ffe4c4'
        });
        this.footer_text1.anchor.set(0.5,0);
    }
    this.startGame = function(){
        this.state.start('play');
    }
}

game.states.play = function(){
    this.create = function(){
        //开启物理引擎
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.centerX = this.world.centerX;
        this.bg = this.add.image(0,0,'play_bg');
        //红包动画
        // game.add.tween(this.redpack).to({y:1300},3000,null,true,0,0,false);
        //大地
        var land = game.add.graphics(0,gHeight-127/2);
        land.beginFill(0xce9424);
        land.moveTo(0,0);
        land.lineTo(gWidth, 0);
        land.lineTo(gWidth, gHeight);
        land.lineTo(0,gHeight);
        this.land = land;
        //主角
        var player = this.add.sprite(this.centerX,gHeight - 73/2,'player');
        player.scale.set(0.5);
        player.anchor.set(0.5,1);
        this.physics.arcade.enable(player);
        this.player = player;
        var playerW = this.player.width;
        //添加主角运动
        //是否正在触摸
        var touching = false;
        //监听按下事件
        game.input.onDown.add(function(pointer){
            //palyer.x是主角的横向中心，判断是指触摸点在主角的最左侧到最右侧的坐标范围内，
            //就是点击的是小人本身，未判断y坐标
            // if(Math.abs(pointer.x - player.x) < player.width/2){
            //     touching = true;
            // }
            touching = true;
        });
        //监听离开事件
        game.input.onUp.add(function(){
            touching = false;
        });
        //监听滑动事件
        game.input.addMoveCallback(function(pointer,x,y,isTap){
            if(!isTap && touching){
                x = mid(x, playerW/2, gWidth - playerW/2);
                player.x = x;
            }
        });
        //定时器添加红包
        var redgroup = this.add.group();
        this.redgroup = redgroup;
        redgroup.enableBody = true;
        redgroup.createMultiple(8,'redpack');
        //红包组全体添加边界检测和边界销毁
        redgroup.setAll('outOfBoundsKill',true);
        redgroup.setAll('checkWorldBounds',true);
        game.time.events.loop(300,this.fBuildRedpack,this);
    }
    this.update = function(){
       this.physics.arcade.overlap(this.redgroup,this.player,function(player,redpack){
            redpack.kill();
       },null,null,this);
    }
    this.fBuildRedpack = function(){
        var item = this.redgroup.getFirstExists(false);
        var left = this.rnd.between(60,gWidth - 60);
        console.log(this.redgroup.length);
        if(item){
            //由于有超出边界检测，所以不能设置y为负值
            item.reset(left,0);
            item.scale.set(0.5);
            // item.body.gravity.y = 300;
            item.body.velocity.y = 300;
        }
        else{
            var redpack = this.add.sprite(left,0,'redpack');
            redpack.scale.set(0.5);
            this.physics.arcade.enable(redpack);
            redpack.body.velocity.y = 300;
            redpack.checkWorldBounds = true;
            redpack.outOfBoundsKill = true;
            this.redgroup.add(redpack);
        }
    }
}

game.states.stop = function(){
    this.preload = function(){
       
    }
    this.create = function(){
        
    }
}

Object.keys(game.states).forEach(function(item){
    game.state.add(item,game.states[item]);
});

game.state.start('boot');

//工具函数
function mid(mid,min,max){
    if(typeof min === undefined || min == null){
        min = Number.NEGATIVE_INFINITY;
    }
    if(typeof max == undefined || max == null){
        max = Number.POSITIVE_INFINITY;
    }
    return Math.min(Math.max(min,mid),max);
}