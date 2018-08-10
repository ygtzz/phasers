var gWidth = window.innerWidth;
var gHeight = window.innerHeight;
// var gHeight = 1493/2;

var game = new Phaser.Game(gWidth,gHeight,Phaser.AuTO,'conc');

game.states = {};
game.states.boot = function(){
    this.preload = function(){
        this.load.image('redpack','assets/images/prod_redpacket.png');
    };
    this.create = function(){
        this.physics.startSystem(Phaser.Physics.ARCADE);
        var loading = this.add.image(0,-80,'redpack');
        var loading2 = this.add.sprite(100,-80,'redpack');
        this.physics.arcade.enable(loading2);
        loading2.body.velocity.y = 300;
        loading2.checkWorldBounds = true;
        loading2.events.onEnterBounds.add(function(item){
            console.log('enter');
        },this);
        loading2.events.onOutOfBounds.add(function(item){
            console.log('outof');
            item.kill();
        },this);
        // this.state.start('preload');
    }
    this.render = function(){
        
    }
}

Object.keys(game.states).forEach(function(item){
    game.state.add(item,game.states[item]);
});

game.state.start('boot');
