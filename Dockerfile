FROM node:14-slim

#docker-compose up -d --build --force-recreate --no-deps && lazydocker 

RUN apt-get update && apt-get install -yq curl git  g++ python make mc screen nano


WORKDIR /root/MultiCurrencyWallet


ENTRYPOINT ["tail", "-f", "/dev/null"]


EXPOSE 9001

