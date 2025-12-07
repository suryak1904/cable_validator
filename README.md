

# 📦 **Cable Validator — README.md**

A full-stack **AI-powered cable design validation system** that extracts parameters from free-text using Gemini AI and validates them using IEC standards (IEC 60228, IEC 60502-1).
The system consists of a **NestJS backend**, a **Next.js frontend**, and a **PostgreSQL database** with IEC conductor, insulation, sheath & bedding rules.

---

#  Features

### **AI-Powered Input Extraction (Gemini 2.5 Flash)**

* Extracts cable parameters from messy free-text
* Enforces strict JSON output
* Normalizes voltage, CSA, materials, thickness values
* No guessing—unknown fields are set to `null`

###  **IEC-Compliant Validation Engine**

Validates using official tables:

| IEC Standard        | Purpose                            |
| ------------------- | ---------------------------------- |
| **IEC 60228**       | Conductor class, nominal diameters |
| **IEC 60502-1**     | Insulation thickness rules         |
| **Custom DB rules** | Bedding & sheath formulas          |

System checks include:

* Conductor geometry
* Insulation thickness
* Fictitious diameter
* Bedding thickness
* Sheath thickness
* Outer diameter tolerance

### ✅ **Full Engineering Calculations**

Automatically computes:

* Nominal conductor diameter
* Fictitious diameter
* Bedding thickness
* Expected sheath thickness
* Expected outer diameter
* Min/max tolerances

### ✅ **Modern UI (Next.js + Material UI)**

* Structured + Free-text hybrid input
* Live validation results table
* PASS/WARN/FAIL chips
* Loading indicators
* Clean engineering output panel

---

# 🏗️ System Architecture

```
frontend (Next.js)
     │
     ▼
backend REST API (NestJS)
  - AI Extraction Service (Gemini)
  - IEC Validation Engine
     │
     ▼
PostgreSQL Database
  - IEC Conductor Table
  - IEC Insulation Table
  - IEC Sheath/Bedding Table
```

---

# 📂 Project Structure

```
/backend
  /src
    /ai_extraction
    /design_validation
    /iec_data
    /entities
    main.ts
    app.module.ts
  seed_iec.ts
  .env

/frontend
  /app/design_validator
    page.tsx
    page_content.tsx
  package.json

/database
  schema.sql
```

---

# 🔧 Technologies Used

### **Backend**

* NestJS
* TypeORM
* PostgreSQL
* Google Gemini (AI extraction)

### **Frontend**

* Next.js (App Router)
* Material UI
* Axios

### **Infrastructure**

* Node.js
* Docker (optional)

---

# 🛠️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/suryak1904/cable_validator.git
cd cable_validator
```

---

# 📌 Backend Setup (NestJS)

## 2️⃣ Install Dependencies

```bash
cd backend
npm install
```

## 3️⃣ Add Environment Variables

Create `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=iec_validation
GEMINI_API_KEY=your_api_key_here
```

---

# 🗄️ Database Setup

## 4️⃣ Start PostgreSQL

```bash
sudo service postgresql start
```

## 5️⃣ Create DB

```sql
CREATE DATABASE iec_validation;
```

## 6️⃣ Seed IEC Tables

```bash
npx ts-node src/database/iec.seed.ts
```

You should see:

```
✔ Conductor table seeded.
✔ Insulation table seeded.
✔ Sheath rules table seeded.
🎉 IEC seeding completed successfully!
```

---

# ▶️ Run Backend Server

```bash
npm run start:dev
```

API is available at:

```
http://localhost:3000/design/validate
```

---

# 🎨 Frontend Setup (Next.js UI)

## 7️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 8️⃣ Run the Frontend (port 3001)

```bash
npm run dev
```

UI available at:

```
http://localhost:3001/design_validator
```

---

# 🧪 Example Free-Text Test Cases

### ✔ PASS Case

```
IEC 60502-1 0.6/1kV 10 sqmm Cu Class 2 PVC insulated cable ti 1.0mm sheath 1.4mm OD 9.9mm
```

### ✔ WARN Case

```
10 sqmm Cu Class 2 PVC cable ti 1mm
```

### ✔ FAIL Case (wrong sheath)

```
10 sqmm Cu Class 2 PVC ti 1mm sheath 0.5mm
```

---

# 📊 Sample Validation Result

```json
{
  "overallStatus": "PASS",
  "fields": [
    {
      "field": "conductor_geometry",
      "status": "PASS",
      "provided": { "csa": 10, "material": "Cu", "class": "2" },
      "expected": { "nominal_diameter": 4.05 }
    }
  ],
  "calculated": {
    "fictitiousDiameter": 6.05,
    "expectedOuterDiameter": 9.93
  }
}
```

---

# 🧱 Key Engineering Logic Included

### **1️⃣ Conductor Geometry**

Validated using IEC 60228 table reference.

### **2️⃣ Insulation Thickness**

Pass/Fail/Warn using nominal & minimum thickness.

### **3️⃣ Fictitious Diameter**

```
Df = d_conductor + 2 × ti
```

### **4️⃣ Bedding Thickness**

```
tb = a + b × Df
```

### **5️⃣ Sheath Thickness**

```
ts = a + b × Df
```

### **6️⃣ Outer Diameter**

```
OD = Df + 2 × tb + 2 × ts
```

Tolerance window = ±5%


#  To Test in Postman

### **1. Set up request**

* Method → **POST**
* URL → `http://localhost:3000/design/validate`
* Body → **raw** → **JSON**

---

#  Postman Test 1 — Full Structured Input 

Copy/paste this JSON:

```json
{
  "standard": "IEC 60502-1",
  "voltage": "0.6/1 kV",
  "conductorMaterial": "Cu",
  "conductorClass": "2",
  "csa": 10,
  "insulationMaterial": "PVC",
  "insulationThickness": 1.0,
  "sheathThickness": 1.4,
  "outerDiameter": 10.0,
  "freeText": ""
}
```

**Expected Output:** overallStatus = **PASS**

---

#  **Postman Test 2 — Free Text Only (AI + Validation)**

```json
{
  "freeText": "IEC 60502-1 10 sqmm Cu Class 2 PVC insulated cable 0.6/1kV ti 1mm sheath 1.4mm OD 10mm"
}
```

**Expected:**

* AI extracts all fields
* All validations PASS

---

#  **Postman Test 3 — OD WARN Case**

```json
{
  "freeText": "10 sqmm Cu Class 2 PVC 0.6/1kV ti 1mm sheath 1.4mm OD 10.2mm"
}
```

**Expected:**

* OD → **WARN**
* All others PASS

---

#  **Postman Test 4 — FAIL Case**

```json
{
  "freeText": "10 sqmm Cu Class 2 PVC insulated ti 1mm sheath 0.5mm OD 8.5mm"
}
```

**Expected:**

* Sheath thickness → FAIL
* OD → FAIL

---

#  **Postman Test 5 — Mixed Mode (Structured overrides AI)**

```json
{
  "voltage": "0.6/1 kV",
  "insulationThickness": 1,
  "outerDiameter": 10,
  "freeText": "Cu Class 2 PVC cable 10 sqmm ti 1mm sheath 1.4mm"
}
```


#  Documentation Provided

* Full backend logic
* Calculation formulas
* Strict AI enforcement rules
* Complete DTO definitions
* Error-handling & normalization notes

---

#  Contributing

Pull requests are welcome!
Please open an issue for major changes.

---

# 📄 License

MIT License


