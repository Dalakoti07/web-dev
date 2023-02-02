/**
 * This is a variation of one, where now arrow is not at one place
 * but moving in circular motion
 */
window.onload = function () {

    var canvas = document.getElementById("canvas"), context = canvas.getContext("2d")

    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    var canvasCenterX = width / 2
    var canvasCenterY = height / 2
    var dx, dy, rotationAngle = 0;
    var circularMotionAngle = 0
    var motionSpeed = 0.05;
    var motionX = 0, motionY = 0;

    render()

    // this draws an arrow on screen at center which is rotated by angle
    // now to rotate arrow on screen by angle a we have 2 approaches
    // one - to rotate arrow
    // two - to rotate canvas (we will be using this approach)
    function render() {
        context.clearRect(0, 0, width, height);

        context.save();
        motionX = canvasCenterX + Math.cos(circularMotionAngle)* 200 // 200 is radius
        motionY = canvasCenterY + Math.sin(circularMotionAngle)* 200 // 200 is radius
        context.translate(motionX, motionY);
        context.rotate(rotationAngle);

        context.beginPath();
        context.moveTo(20, 0)
        context.lineTo(-20, 0)
        context.moveTo(20, 0)
        context.lineTo(10, -10)
        context.moveTo(20, 0)
        context.lineTo(10, 10)
        context.stroke()

        // restoring canvas transformation
        circularMotionAngle+=motionSpeed

        context.restore()
        requestAnimationFrame(render);
    }

    document.body.addEventListener("mousemove", function (event) {
        dx = event.clientX - motionX
        dy = event.clientY - motionY
        // this atan wont differentiate between quadrants when given -ve angle value, but atan2 does
        // angle = Math.atan(dx/dy)
        rotationAngle = Math.atan2(dy, dx)
    })

}

