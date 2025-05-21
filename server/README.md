# Server

## Setup
1. **MongoDB Setup**:
   If MongoDB is not installed locally, run:
     ```
     docker compose up -d
     ```

2. **Dependencies**:
   ```
   npm install
   ```

3. **Seed Database**:
   ```
   npm run seed
   ```
   Admin account: `admin@gmail.com` / `admin123`

4. **Start Server**:
   ```
   npm run dev
   ```