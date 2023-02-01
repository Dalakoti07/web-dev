window.onload = function () {

    var canvas = document.getElementById("canvas"), context = canvas.getContext("2d")

    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;

    // so that sine wave is shifted down
    context.translate(0, height / 2)

    // we get inverted sin wave along x (because in monitors y axis is inverted) but for getting sine way like in studies flip it
    context.scale(1, -1)

    for (let angle = 0; angle < 2 * Math.PI; angle += .01) {
        // its multiplied by 200 so that we can have better x range and we can see sine wave
        // otherwise sin wave would be smushed if we remove *200
        let x = angle * 200,
            y = Math.sin(angle) * 200
        context.fillRect(
            x, y, 5, 5
        )
    }

}

