function foo() {
	a = 1;	// `a` not formally declared
}

foo();
console.log(a);			// 1 -- oops, auto global variable :(

function fooBetter(){
    var aBetter=10;
}

fooBetter()
// will get error in below line, thus making it var would stop gobal dec from local-function 
// console.log(aBetter);

