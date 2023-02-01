/**
 * This is the same thing I did in kotlin 1 year ago
 */
window.onload = function () {

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d")
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    var centerY = height * 0.5,
        centerX = width * 0.5,
        radius = 200,
        angle = 0,
        x, y;

    var circleCount = 40
    var slices = 2*Math.PI / circleCount

    for(var i = 0; i<circleCount; i++){
        angle = i* slices;
        x = centerX + Math.cos(angle) * radius
        y = centerY + Math.sin(angle) * radius

        // clear canvas
        context.beginPath();
        // create circle
        context.arc(x, y, 10, 0, 2 * Math.PI, false);
        context.fill();
    }

}

