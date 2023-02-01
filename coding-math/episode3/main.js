window.onload = function () {

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d")
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    var centerY = height * 0.5,
        centerX = width * 0.5,
        offset = height * 0.4,
        speed = 0.1,
        angle = 0;

    bounceAnimation()

    /**
     * this function will bounce the ball
     */
    function bounceAnimation(){
        let y = centerY + Math.sin(angle) * offset

        // clear canvas
        context.clearRect(0,0,width, height);
        context.beginPath();
        // create circle
        context.arc(centerX,y,50,0,2*Math.PI , false);
        context.fill();

        angle+=speed;

        requestAnimationFrame(bounceAnimation);
    }

    /*var centerY = height * 0.5,
        centerX = width * 0.5,
        baseRadius = 200,
        offset = 50,
        speed = 0.1,
        angle = 0;

    transformRadius()

    /!**
     * this function will transform its shape radius
     *!/
    function transformRadius(){
        let radius = baseRadius + Math.sin(angle) * offset

        // clear canvas
        context.clearRect(0,0,width, height);
        context.beginPath();
        // create circle
        context.arc(centerX,centerY,radius,0,2*Math.PI , false);
        context.fill();

        angle+=speed;

        requestAnimationFrame(transformRadius);
    }*/

    /*var centerY = height * 0.5,
        centerX = width * 0.5,
        baseAlpha = 0.5,
        offset = 0.2,
        speed = 0.1,
        angle = 0;

    opacityAnimation()

    /!**
     * this function will show effect
     *!/
    function opacityAnimation(){
        let alpha = baseAlpha + Math.sin(angle) * offset;

        context.fillStyle = "rgba(0,0,0," + alpha + ")";

        // clear canvas
        context.clearRect(0,0,width, height);
        context.beginPath();
        // create circle
        context.arc(centerX,centerY,100,0,2*Math.PI , false);
        context.fill();

        angle+=speed;

        requestAnimationFrame(opacityAnimation);
    }*/

}

