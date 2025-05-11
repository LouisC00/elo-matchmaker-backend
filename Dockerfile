# 使用官方 Node.js 映像
FROM node:18

# 設定容器內部的工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安裝依賴套件
RUN npm install

# 複製其餘所有檔案（例如 src/, tsconfig.json 等）
COPY . .

# 啟動開發用指令
CMD ["npm", "run", "start"]