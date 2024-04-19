# KAXAA Frontend





Use dockerfile to build the image.

```
docker build . -t kaxaa-wallet-dev:latest
```

and run container using

```
docker run -d --name kaxaa-wallet -v ${PWD}:/root/MultiCurrencyWallet -p 9001:9001 kaxaa-wallet-dev:latest
```

ssh 

```
docker exec -it kaxaa-wallet bash

```


NPM things

```
npm install node-gyp-build // TODO: make this part of image.


npm install / update
npm run dev:mainnet  //starts browser localhost:9001

npm run build:mainnet  // to generate build for prod.
```

