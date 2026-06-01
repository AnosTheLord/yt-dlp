FROM node:20

RUN apt update && apt install -y ffmpeg python3 python3-pip

RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
