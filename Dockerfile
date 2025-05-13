# 使用官方 Node.js 映像
FROM node:18

# 設定工作目錄
WORKDIR /app

# 複製 package.json 並安裝依賴
COPY package*.json ./
RUN npm install

# 複製其餘檔案
COPY . .

# 編譯 TypeScript 前，先產生 Prisma Client
RUN npx prisma generate

# 編譯 TypeScript
RUN npm run build

# 啟動應用（正式用）
CMD ["npm", "start"]