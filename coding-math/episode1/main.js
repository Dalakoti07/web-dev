window.onload = function (){

    var canvas = document.getElementById("canvas"), context = canvas.getContext("2d")

    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    // fill the whole screen with black color
    // context.fillRect(0,0,width, height)

    // draw 100 random lines in canvas
    for(let i = 0; i<100; i+=1){
        context.beginPath();
        context.moveTo(Math.random() * width , Math.random() * height)
        context.lineTo(Math.random() * width , Math.random() * height)
        context.stroke()
    }
}

