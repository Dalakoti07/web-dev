window.onload = function() {
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight,
        p0 = {
            x: Math.random() * width,
            y: Math.random() * height
        },
        p1 = {
            x: Math.random() * width,
            y: Math.random() * height
        },
        p2 = {
            x: Math.random() * width,
            y: Math.random() * height
        },
        p3 = {
            x: Math.random() * width,
            y: Math.random() * height
        };

    drawPoint(p0);
    drawPoint(p1);
    drawPoint(p2);
    drawPoint(p3);

    context.beginPath();
    context.moveTo(p0.x, p0.y);
    context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    context.stroke();

    context.strokeStyle = "red";
    context.beginPath();
    utils.multicurve([p0, p1, p2, p3], context);
    context.stroke();

    function drawPoint(p) {
        context.beginPath();
        context.arc(p.x, p.y, 3, 0, Math.PI * 2, false);
        context.fill();
    }

};
