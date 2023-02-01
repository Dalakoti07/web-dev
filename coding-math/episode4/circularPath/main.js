window.onload = function () {

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d")
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    var centerY = height * 0.5,
        centerX = width * 0.5,
        radius = 200,
        speed = 0.1,
        angle = 0,
        x, y;

    followCirclePath()

    /**
     * this function will bounce the ball
     */
    function followCirclePath() {
        context.clearRect(0, 0, width, height);
        x = centerX + Math.cos(angle) * radius
        y = centerY + Math.sin(angle) * radius

        // clear canvas
        context.beginPath();
        // create circle
        context.arc(x, y, 10, 0, 2 * Math.PI, false);
        context.fill();

        angle += speed;
        requestAnimationFrame(followCirclePath);
    }

}

