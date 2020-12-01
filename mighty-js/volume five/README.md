## Asynchrony: Now & Later

In particular, there are some browsers and some conditions that console.log(..) does not actually immediately output what it's given. The main reason this may happen is because I/O is a very slow and blocking part of many programs (not just JS). So, it may perform better (from the page/UI perspective) for a browser to handle console I/O asynchronously in the background, without you perhaps even knowing that occurred.

### Event-Loop
See full docs

**setTimeOut(func,1000) would make sure that func don't get called before 1 sec, but if it gets executed exactly after 1 sec depends upon event-queue state**

[full docs](ch1.md)

<hr>

## Callbacks

[full docs](ch2.md)





## Some points

**In callback hell flow trace of function is not easy.**


**Spread Operator and Object.Assign() are used to make the copy of the object**
```js
const numbers=[1,2,3];

// adding 4 at last
const copyOfNumbers=[...numbers,4]

// adding 4 in between
const index=numbers.indexOf(2);
const copy2=[
    ...numbers.slice(0,index),
    4,
    ...numbers.slice(index)
];// copy2 -> 1,4,2,3


```

## Error Handling

We've already seen several examples of how Promise rejection -- either intentional through calling reject(..) or accidental through JS exceptions -- allows saner error handling in asynchronous programming. Let's circle back though and be explicit about some of the details that we glossed over.

**The most natural form of error handling for most developers is the synchronous try..catch construct. Unfortunately, it's synchronous-only, so it fails to help in async code patterns:**

```js
function foo() {
	setTimeout( function(){
		baz.bar();
	}, 100 );
}

try {
	foo();
	// later throws global error from `baz.bar()`
}
catch (err) {
	// never gets here
}
```

try..catch would certainly be nice to have, but it doesn't work across async operations. That is, unless there's some additional environmental support, which we'll come back to with generators in Chapter 4.


**Refer the book- You dont know JS**
[chapter 3](ch3.md)

[chapter 4](ch4.md)

[chapter 5](ch5.md)

[chapter 6](ch6.md)
