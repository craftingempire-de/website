# pinger usage

---

```js
const ping = require('./modules/minecraft-ping')

// Promise
ping.pingPromise('localhost', 25565)
  .then(console.log)
  .catch(console.error)

// Async
ping.ping('localhost', 25565, (error, result) => {
  if (error) return console.error(error)
  console.log(result)
})

```