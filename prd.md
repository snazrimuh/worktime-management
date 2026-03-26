# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Work Schedule & Attendance System

---

## 1. 📌 Overview

### 1.1 Product Name

**(Working Title): Chrona / Work Schedule System**

### 1.2 Purpose

Sistem ini dirancang untuk mengelola jadwal kerja karyawan secara fleksibel (fixed, flexible, dan shift-based) serta memvalidasi kehadiran (attendance) berdasarkan jadwal tersebut.

Sistem bertujuan untuk:

* Meningkatkan efisiensi penjadwalan kerja
* Mengurangi konflik jadwal
* Memastikan kepatuhan terhadap jam kerja
* Menyediakan data akurat untuk analisis operasional

---

## 2. 🎯 Goals & Objectives

* Menyediakan sistem penjadwalan kerja yang fleksibel dan scalable
* Mengintegrasikan absensi dengan jadwal kerja
* Mengotomatisasi validasi kehadiran
* Mengurangi kesalahan manual dalam scheduling
* Menyediakan insight berbasis data (planned vs actual)

---

## 3. 👥 Target Users

* HR / Admin
* Manager / Supervisor
* Employee (end user)

---

## 4. 🧩 Core Concepts

* **Schedule**: Jadwal kerja utama (core entity)
* **Shift**: Salah satu tipe schedule (subset)
* **Attendance**: Realisasi kehadiran berdasarkan schedule
* **Planned vs Actual**: Perbandingan jadwal vs kehadiran

---

## 5. 🏗️ System Modules

---

# 5.1 🗓️ Work Schedule Management Module

## 5.1.1 Schedule Definition

Fitur untuk membuat dan mengelola jadwal kerja.

### Types of Schedule:

* Fixed Schedule (contoh: 09:00–17:00; terikat jam masuk/pulang)
* Flexible Schedule (Flexi Hours: contoh min. 8 jam kerja dalam range 08:00–20:00)
* Shift-based Schedule (pagi/siang/malam; rotasi berkala)

### Attributes:

* Nama jadwal
* Tipe jadwal
* Jam mulai & selesai
* Lokasi (opsional)
* Role/posisi (opsional)

---

## 5.1.2 Shift Management (Subset of Schedule)

Digunakan jika organisasi menggunakan sistem shift.

### Fitur:

* Define shift (morning, afternoon, night)
* Reusable shift template
* Rotating shift support

---

## 5.1.3 Schedule Templates

Template jadwal untuk mempercepat pembuatan schedule.

### Contoh:

* Office Hours Template
* Shift Rotation Template
* Custom Template

---

## 5.1.4 Schedule Assignment

Menentukan jadwal untuk karyawan.

### Fitur:

* Assign ke individu
* Assign ke tim/divisi
* Bulk assignment
* Recurring assignment (mingguan/bulanan)

---

## 5.1.5 Auto Schedule Generator 🔥

Generate jadwal otomatis berdasarkan:

* jumlah karyawan
* kebutuhan operasional
* rule & constraint

---

## 5.1.6 Constraint Rules Engine 🔥

Validasi aturan penjadwalan:

### Rules:

* Maksimal hari kerja berturut-turut
* Minimal hari libur
* Tidak boleh double schedule
* Shift malam tidak berurutan
* Availability karyawan

---

## 5.1.7 Conflict Detection

Deteksi otomatis:

* Jadwal bentrok
* Overlapping
* Overwork

---

## 5.1.8 Calendar View

Tampilan visual jadwal:

### Fitur:

* Monthly & weekly view
* Filter (employee/divisi)
* Drag & drop scheduling

---

---

# 5.2 ⏱️ Attendance Module

## 5.2.1 Check-in / Check-out

Fitur absensi karyawan.

### Fitur:

* Timestamp otomatis
* Manual trigger (button)

---

## 5.2.2 Schedule-based Validation 🔥

Validasi absensi terhadap jadwal:

### Logic (Fixed/Shift):

* Late → jika check-in > start time + grace period
* Early Leave → jika check-out < end time
* On Time → sesuai jadwal

### Logic (Flexi Hours):

* Under-hours → jika total durasi kerja < target jam kerja
* Incomplete → jika tidak ada check-out dalam 24 jam

---

## 5.2.3 Attendance Status

Status otomatis:

* Present
* Late
* Early Leave
* Absent
* Overtime

---

## 5.2.4 No-Show Detection

Jika tidak ada check-in hingga batas waktu tertentu (misal: 4 jam setelah jam masuk atau akhir hari):
→ otomatis dianggap Absent (tanpa keterangan)

---

## 5.2.5 Manual Adjustment

### Fitur:

* Koreksi absensi
* Input izin/sakit
* Approval system

---

---

# 5.3 🔄 Schedule Change & Request Module

## 5.3.1 Change Request

Karyawan dapat:

* Mengajukan perubahan jadwal
* Memberikan alasan

---

## 5.3.2 Shift Swap 🔥

* Tukar jadwal antar karyawan.
* **Flow:** Pengajuan (Karyawan A) → Persetujuan (Karyawan B) → Approval (Manager).
* Validasi otomatis agar swap tidak melanggar aturan (misal: double shift).

---

## 5.3.3 Approval Flow

* Manager approve/reject
* Multi-level approval (opsional)

---

---

# 5.4 🔔 Notification System

### Fitur:

* Reminder sebelum jadwal kerja
* Notifikasi perubahan jadwal
* Notifikasi approval
* Alert keterlambatan (opsional)

---

---

# 5.5 📊 Reporting & Analytics Module

## 5.5.1 Attendance Report

* Rekap harian
* Rekap bulanan
* Per karyawan / tim

---

## 5.5.2 Schedule Adherence 🔥

Perbandingan:

* Planned (schedule)
* Actual (attendance)

---

## 5.5.3 KPI Metrics

* Tingkat keterlambatan
* Absenteeism rate
* Overtime rate

---

## 5.5.4 Shift Analytics (Optional)

* Distribusi shift
* Fairness analysis

---

---

# 5.6 ⚙️ Rules & Configuration Module

### Fitur:

* Jam kerja standar (per divisi/role)
* Toleransi keterlambatan (Grace Period, misal: 10-15 menit)
* Definisi overtime (per jam atau per tugas)
* Hari libur & cuti bersama
* Global scheduling rules (max consecutive work days, min rest hours)

---

---

# 5.7 🧠 Smart Logic Engine (Core System Value)

## 5.7.1 Planned vs Actual Engine 🔥

Membandingkan:

* Schedule vs Attendance

---

## 5.7.2 Auto Status Engine

Menghitung otomatis:

* Late
* Early leave
* Overtime

---

## 5.7.3 Constraint Validation Engine

Validasi semua input schedule & attendance

---

---

## 6. 🏗️ Data Model (High-Level)

### Entities:

* Employee (User profile & role)
* Schedule (Master definition: Fixed, Flexi, Shift)
* Shift (Shift template/rotation)
* ScheduleAssignment (Assigning employee to schedule patterns)
* ScheduleInstance (Otomatis digenerate sebagai target kerja harian; untuk performa laporan)
* Attendance (Data realisasi harian karyawan)
* AttendanceLog (Raw timestamps check-in/out)
* ScheduleRequest (Permintaan perubahan/swap)
* Approval (Log persetujuan manager)
* RuleConfig (Konfigurasi grace period, rules global)

---

## 7. 🔗 Integrations

### 7.1 Task System

* Task hanya aktif saat schedule aktif
* Assignment berbasis schedule

### 7.2 Asset System

* Asset digunakan berdasarkan schedule
* Tracking penggunaan lebih akurat

---

## 8. ⚠️ Non-Functional Requirements

* Scalable untuk organisasi besar
* Real-time processing (attendance)
* High availability
* Secure (role-based access)
* Audit trail untuk perubahan data

---

## 9. 🚀 Future Enhancements

* GPS-based attendance
* Face recognition
* AI-based scheduling optimization
* Mobile app support

---

## 10. 🧠 Summary

Sistem ini bukan hanya:

> “aplikasi absensi”

Melainkan:

> **Workforce Execution & Scheduling System**

Yang mencakup:

* Perencanaan kerja (Schedule)
* Eksekusi (Attendance)
* Validasi (Planned vs Actual)
* Analisis (Reporting)

---
