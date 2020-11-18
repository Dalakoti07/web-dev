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


****
