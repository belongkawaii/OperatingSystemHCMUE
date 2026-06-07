# OperatingSystemHCMUE

Frontend được xây dựng bằng React + Vite.

---

## Công nghệ sử dụng

- React
- Vite
- JavaScript
- ESLint

---

## Yêu cầu trước khi chạy

Cần cài đặt:

- Node.js
- npm

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

---

## Cách chạy project

### 1. Clone project

```bash
git clone https://github.com/belongkawaii/ShopmeeUI.git
```

### 2. Di chuyển vào thư mục project

```bash
cd OperatingSystemHCMUE
```

### 3. Cài đặt dependencies

```bash
npm install
```

Lệnh này sẽ tạo thư mục:

```bash
node_modules
```

### 4. Chạy project

```bash
npm run dev
```

Sau khi chạy thành công, mở trình duyệt tại:

```txt
http://localhost:5173
```

---

## Các lệnh thường dùng

### Chạy môi trường development

```bash
npm run dev
```

### Build project

```bash
npm run build
```

### Preview sau khi build

```bash
npm run preview
```

### Kiểm tra ESLint

```bash
npm run lint
```

---

## Cấu trúc thư mục

```txt
OPERATINGSYSTEMHCMUE/
├── node_modules/
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    ├── components/
    │   ├── Control.jsx
    │   ├── GanttChart.jsx
    │   └── ProcessTable.jsx
    ├── core/
    │   ├── abstractions/
    │   │   └── Scheduler.js
    │   ├── FCFSScheduler.js
    │   ├── FCFSScheduler.test.js
    │   ├── Process.js
    │   ├── RRScheduler.js
    │   └── snapshot.js
    ├── hooks/
    │   └── useSimulator.js
    ├── App.css
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

---

## Lưu ý

- Không push thư mục `node_modules`
- Sau khi clone project cần chạy:

```bash
npm install
```

trước khi:

```bash
npm run dev
```

---

## Tác giả
Nguyễn Hoàng Long
