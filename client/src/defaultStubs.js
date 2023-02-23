const stubs = {};

stubs.cpp = `#include <iostream>

int main() {
    std::cout << "Hello World from C++!";
    return 0;
}
`;

stubs.py = `print('Hello World from Python!');
`;

stubs.c = `#include <stdio.h>
int main() {
   printf("Hello, World from C!");
   return 0;
}

`;


export default stubs;