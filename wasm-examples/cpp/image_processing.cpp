#include <emscripten/bind.h>
#include <cstdint>

// Function to convert an image to grayscale
void grayscale(uint8_t* data, int width, int height) {
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int offset = (y * width + x) * 4;
            uint8_t r = data[offset];
            uint8_t g = data[offset + 1];
            uint8_t b = data[offset + 2];
            uint8_t gray = static_cast<uint8_t>(r * 0.3 + g * 0.59 + b * 0.11);
            data[offset] = gray;
            data[offset + 1] = gray;
            data[offset + 2] = gray;
        }
    }
}

// Binding code for Emscripten
EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::function("grayscale", &grayscale);
}
