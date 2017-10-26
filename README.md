# local-credentials

Read data out of an `ini` formatted `~/.local/credentials` file e.g. `~/.aws/credentials`

[![Build Status](https://api.travis-ci.org/mheap/local-credentials.svg?branch=master)](https://travis-ci.org/mheap/local-credentials)

## Example Usage

You can use this library with either a Promise or a Callback based interface

### async/await

```javascript
async function main() {
    try {
        let Credentials = require("local-credentials");

        const c = new Credentials("~/.basic/credentials");
        const defaultData = await c.get(); // Returns the "default" section
        const specialData = await c.get("special"); // Returns the "special" section

        console.log(defaultData);
        console.log(specialData);
    } catch (err) {
        console.log(err);
    }
}

main();
```

### Callback

```javascript
let Credentials = require("local-credentials");

const c = new Credentials("~/.basic/credentials");
const defaultData = c.get("default", function(err, data){
    if (err){
        // Do something
    }
    console.log(data);
});

```
