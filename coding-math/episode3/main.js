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



}

