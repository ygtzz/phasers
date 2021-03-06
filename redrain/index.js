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
        this.load.spritesheet('player_sprites','assets/images/player_sprites.png',190,230);
        this.load.image('countdown_bg','assets/images/countdown-bg.png');
        // this.load.image('player','assets/images/red_player0.png');
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
        //大地
        var land = game.add.graphics(0,gHeight-127/2);
        land.beginFill(0xce9424);
        land.moveTo(0,0);
        land.lineTo(gWidth, 0);
        land.lineTo(gWidth, gHeight);
        land.lineTo(0,gHeight);
        this.land = land;
        //主角
        var player = this.add.sprite(this.centerX,gHeight - 73/2,'player_sprites',0);
        player._redCount = 0;
        this.player = player;
        player.scale.set(0.5);
        player.anchor.set(0.5,1);
        this.physics.arcade.enable(player);
        player.inputEnabled = true;
        //只能水平方向上拖动
        player.input.allowVerticalDrag = false;
        //限制主角只能在世界中移动，不能超出屏幕
        var dragRect = new Phaser.Rectangle(0,0,gWidth,gHeight);
        player.input.enableDrag(false,false,false,255,dragRect);
        //定时器添加红包
        var redgroup = this.add.group();
        this.redgroup = redgroup;
        redgroup.enableBody = true;
        redgroup.createMultiple(13,'redpack');
        //红包组全体添加边界检测和边界销毁
        redgroup.setAll('checkWorldBounds',true);
        // redgroup.setAll('outOfBoundsKill',true);
        redgroup.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.fRemoveRedpack);
        // redgroup.forEach(function(item){
        //     item.events.onOutOfBounds.add(this.fRemoveRedpack,this);
        // },this);
        game.time.events.loop(200,this.fBuildRedpack,this);
        
        //红包数量
        this.redCount = this.add.text(34/2,55/2,'红包：0个',{
            fontSize:'18px',
            fill:'#e9524b'
        });
        //倒计时
        var countDownBg = this.add.image(gWidth - 138/2,42/2,'countdown_bg');
        countDownBg.scale.set(0.5);
        var countDownText = this.add.text(0,0,'30s',{
            fontSize:'15px',
            fill:'#fff'
        });
        countDownText.alignIn(countDownBg,Phaser.CENTER,2,3);
        this.countDownText = countDownText;
        game._count = 30;
        this.countTimer = game.time.events.loop(1000,this.updateCountdown,this);
    }
    this.update = function(){
       var self = this;
       this.physics.arcade.overlap(this.redgroup,this.player,function(player,redpack){
            redpack.kill();
            self.player._redCount++;
            self.updateScore(self.player._redCount);
       },null,null,this);
       //设置小人的物理体积为高度的一半
       var playerW = this.player.width,
           playerH = this.player.height;
        //由于scale 0.5的缘故，宽高设置要加倍
       this.player.body.setSize(playerW*2,playerH,0,playerH);
    }
    this.updateCountdown = function(){
        game._count--;
        if(game._count > -1){
            this.countDownText.setText(game._count+'s');
        }
        else{
            game.time.events.remove(this.countTimer);
        }
    }
    this.updateScore = function(count){
        var self = this;
        //修改分数
        self.redCount.setText('红包：' + count + '个');
        //修改小人的红包数量
        if(count < 3){
            self.player.frame = count;
        }
    }
    this.fBuildRedpack = function(){
        //元素不足则自动创建，getFirstDead和getFistExists此处等价
        // var item = this.redgroup.getFirstDead(true);
        var item = this.redgroup.getFirstExists(false,true);
        var left = this.rnd.between(60,gWidth - 60);
        console.log(this.redgroup.length);
        if(item){
            //y坐标小于-49红包将不显示，原因未知
            item.reset(left,-49);
            item.scale.set(0.5);
            item.body.velocity.y = 300;
            item.checkWorldBounds = true;
            // item.outOfBoundsKill = true;
            item.events.onOutOfBounds.add(this.fRemoveRedpack,this);
        }
    }
    this.fRemoveRedpack = function(red){
        console.log('outof');
        red.kill();
    }
    this.render = function(){
        this.redgroup.forEach(function(item){
            game.debug.body(item);
        });
        game.debug.body(this.player);
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