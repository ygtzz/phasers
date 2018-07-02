var width = window.innerWidth;
var height = window.innerHeight;
var game = new Phaser.Game(width,height,Phaser.AuTO,'conc');
game.states = {
    boot: function(){
        this.preload = function(){
            this.load.image('loading','assets/image/progress.png');
        };
        this.create = function(){
            this.state.start('preload');
        }
    },
    preload:function(){
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
        };
        this.create = function(){
            this.state.start('menu');
        }
    },
    menu:function(){
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
        };
        this.startGame = function(){
            this.bg.destroy();
            this.bird.destroy();
            this.startButton.destroy();
            game.state.start('start');
        }
    },
    start:function(){

    },
    stop:function(){

    }
};

Object.keys(game.states).forEach(function(item){
    game.state.add(item,game.states[item]);
});

game.state.start('boot');