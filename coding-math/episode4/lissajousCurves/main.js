window.onload = function () {

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d")
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    var centerY = height * 0.5,
        centerX = width * 0.5,
        radiusX = 200,
        radiusY = 400,
        speedX = 0.1,
        speedY = 0.121,
        angleX = 0,
        angleY = 0,
        x, y;

    followCurve()

    /**
     * This curve can be used to show random bees
     */
    function followCurve() {
        context.clearRect(0, 0, width, height);
        x = centerX + Math.cos(angleX) * radiusX
        y = centerY + Math.sin(angleY) * radiusY

        // clear canvas
        context.beginPath();
        // create circle
        context.arc(x, y, 10, 0, 2 * Math.PI, false);
        context.fill();

        angleX += speedX;
        angleY += speedY;
        requestAnimationFrame(followCurve);
    }

}

