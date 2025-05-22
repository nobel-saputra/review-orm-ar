# 🚀 Analisis & Implementasi ORM/Active Record dengan Prisma di Node.js



Aplikasi contoh ini merupakan studi kasus implementasi Object-Relational Mapping (ORM) menggunakan **Prisma** pada lingkungan Node.js. Proyek ini mendemonstrasikan berbagai operasi database mulai dari CRUD dasar, relasi, agregasi, transaksi, hingga penanganan tipe data JSON, semuanya dilakukan melalui Prisma Client tanpa perlu menulis SQL mentah.

## 🌟 Fitur Utama yang Didemonstrasikan

* **CRUD (Create, Read, Update, Delete):** Operasi dasar manajemen data untuk model User, Post, dan Product.
* **Relasi One-to-Many:** Menunjukkan hubungan antara User (Author) dan Post.
* **Operasi Relasional Lanjutan:** Penggunaan `include` untuk Eager Loading, serta `nested writes` untuk membuat/menghubungkan data terkait dalam satu operasi.
* **Tipe Data JSON:** Implementasi dan interaksi dengan kolom `JSON` untuk `description` dan `tags` pada model `Product`.
* **Fungsi Agregat:** Contoh penggunaan `count`, `min`, `max` untuk statistik data.
* **Transaksi:** Demonstrasi transaksi interaktif (`$transaction`) untuk memastikan integritas data dalam operasi multi-langkah.
* **Raw Queries:** Penggunaan `$queryRaw` dan `$executeRaw` sebagai "escape hatch" untuk kueri SQL mentah jika diperlukan.
* **Prisma Migrate:** Ilustrasi penggunaan sistem migrasi deklaratif Prisma untuk mengelola skema database.
* **Seeding Data:** Contoh pengisian data awal ke database.

## 🛠️ Teknologi yang Digunakan

* **Node.js**: Runtime JavaScript
* **Prisma ORM**: Object-Relational Mapper
* **MySQL**: Sistem Manajemen Database Relasional
* **npm**: Node Package Manager
* **Laragon/XAMPP**: Untuk lingkungan server lokal (termasuk MySQL)
* **PHPMyAdmin/DataGrip**: Untuk manajemen database GUI

## 📦 Instalasi dan Setup Proyek

Ikuti langkah-langkah berikut untuk menyiapkan dan menjalankan proyek di lingkungan lokal Anda.

### 1. Prasyarat Sistem

Pastikan Anda telah menginstal perangkat lunak berikut di sistem Anda:

* **Node.js & npm**: [Unduh dari Node.js.org](https://nodejs.org/) (disarankan versi LTS terbaru).
    Verifikasi instalasi:
    ```bash
    node -v
    npm -v
    ```
* **Lingkungan Server Lokal (Laragon/XAMPP)**: Pastikan Anda memiliki Laragon, XAMPP, atau instalasi MySQL terpisah yang sudah berjalan. Tutorial ini mengasumsikan penggunaan Laragon.
* **Database Client (Opsional tapi Disarankan)**: Tools seperti [DataGrip](https://www.jetbrains.com/datagrip/) atau [PHPMyAdmin](https://www.phpmyadmin.net/) (biasanya sudah termasuk di Laragon/XAMPP) sangat disarankan untuk memvisualisasikan dan mengelola database Anda.

### 2. Penyiapan Database MySQL

Kita akan membuat *database* baru dan user khusus untuk proyek ini.

1.  **Mulai Server MySQL:**
    Pastikan server MySQL di Laragon/XAMPP Anda sudah berjalan.

2.  **Akses Terminal MySQL via Laragon/Command Prompt:**
    * **Jika menggunakan Laragon:** Buka terminal Laragon, lalu ketik `mysql -u root -p` dan tekan Enter. Ketika diminta *password*, cukup tekan Enter lagi (defaultnya kosong untuk root di Laragon).
    * **Jika menggunakan Command Prompt biasa:** Pastikan MySQL ada di PATH Anda, lalu ketik `mysql -u root -p` dan masukkan *password* root MySQL Anda jika ada.

3.  **Buat User Database & Beri Hak Akses:**
    Di dalam *prompt* MySQL (`mysql>`), jalankan perintah SQL berikut secara berurutan. (Perhatikan: Anda bisa mengetikkan `CREATE USER ...;` lalu enter, lalu `GRANT ...;` lalu enter, dst.)
    ```sql
    CREATE USER 'nobel'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin123';
    GRANT ALL PRIVILEGES ON *.* TO 'nobel'@'localhost' WITH GRANT OPTION;
    FLUSH PRIVILEGES;
    ```
    * Ini akan membuat user `nobel` dengan password `admin123` yang bisa mengakses database dari `localhost`.

4.  **Buat Database Kosong:**
    Masih di *prompt* MySQL, buat database baru yang akan digunakan oleh proyek ini.
    ```sql
    CREATE DATABASE `review-orm`;
    ```
    * Anda juga bisa membuat database ini melalui GUI PHPMyAdmin atau DataGrip (biasanya dengan mengklik kanan pada koneksi server MySQL dan memilih "Create Database" atau "New Schema").

5.  **Keluar dari MySQL Prompt:**
    ```sql
    exit;
    ```

### 3. Kloning Repositori & Instalasi Dependensi Node.js

1.  Kloning repositori proyek ke mesin lokal Anda:
    ```bash
    git clone https://github.com/nobel-saputra/review-orm-ar
    cd nreview-orm-ar
    ```
    *(Ganti `[LINK_REPOSITORY_ANDA_DI_SINI]` dengan URL repositori GitHub Anda dan `nama-folder-proyek-anda` dengan nama folder yang dibuat oleh `git clone`)*

2.  Instal semua dependensi Node.js yang diperlukan:
    ```bash
    npm install
    ```

### 4. Konfigurasi File `.env`

1.  Buat file baru bernama `.env` di *root* folder proyek Anda.
2.  Tambahkan baris berikut, **pastikan sesuai dengan kredensial database yang baru saja Anda buat**:
    ```dotenv
    DATABASE_URL="mysql://nobel:admin123@localhost:3306/review-orm"
    ```
    * `nobel`: Username database.
    * `admin123`: Password database.
    * `localhost:3306`: Alamat server MySQL.
    * `review-orm`: Nama database yang telah Anda buat.

### 5. Konfigurasi ES Modules (`package.json`)

Pastikan proyek Anda dikonfigurasi untuk menggunakan ES Modules.

1.  Buka file `package.json` di *root* folder proyek.
2.  Pastikan ada baris `"type": "module"` di dalamnya:
    ```json
    {
      "name": "nama-proyek-anda",
      "version": "1.0.0",
      "type": "module",  <-- Pastikan baris ini ada
      // ... (properti lainnya)
    }
    ```

### 6. Migrasi Database (Prisma Migrate)

Setelah semua konfigurasi selesai, terapkan skema database ke MySQL Anda.

1.  Dari *root* folder proyek di terminal (misalnya di VS Code atau terminal favorit Anda), jalankan perintah migrasi berikut:
    ```bash
    npx prisma migrate dev --name initial_setup
    ```
    Perintah ini akan:
    * Menganalisis skema Anda (`prisma/schema.prisma`).
    * Membuat file migrasi SQL di `prisma/migrations`.
    * Menerapkan migrasi tersebut ke database Anda (membuat tabel User, Post, Product).
    * Menggenerasi ulang Prisma Client.

### 7. Menjalankan Aplikasi Contoh

Setelah semua langkah di atas selesai, Anda dapat menjalankan skrip utama yang berisi demonstrasi operasi Prisma Client.

1.  Dari *root* folder proyek di terminal, jalankan perintah:
    ```bash
    node src/index.js
    ```
2.  Anda akan melihat berbagai *output* di konsol terminal, menampilkan hasil dari operasi CRUD, relasi, agregasi, transaksi, dan penanganan JSON yang berinteraksi langsung dengan database Anda.

---

