window.onload = function (){

    var canvas = document.getElementById("canvas"), context = canvas.getContext("2d")

    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    var arrowX = width /2
    var arrowY = height /2
    var dx, dy, angle = 0;

    render()

    // this draws an arrow on screen at center which is rotated by angle
    // now to rotate arrow on screen by angle a we have 2 approaches
    // one - to rotate arrow
    // two - to rotate canvas (we will be using this approach)
    function render(){
        context.clearRect(0,0,width, height);

        context.save()
        context.translate(arrowX, arrowY);
        context.rotate(angle);

        context.beginPath();
        context.moveTo(20,0)
        context.lineTo(-20,0)
        context.moveTo(20,0)
        context.lineTo(10,-10)
        context.moveTo(20,0)
        context.lineTo(10,10)
        context.stroke()

        // restoring canvas transformation
        context.restore()
        requestAnimationFrame(render);
    }

    document.body.addEventListener("mousemove", function (event){
        dx = event.clientX - arrowX
        dy = event.clientY - arrowY
        // this atan wont differentiate between quadrants when given -ve angle value, but atan2 does
        // angle = Math.atan(dx/dy)
        angle = Math.atan2(dy, dx)
    })

}

