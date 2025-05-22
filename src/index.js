// src/index.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai operasi Prisma...");

  // --- Operasi CRUD Dasar ---
  console.log("\n--- Operasi CRUD Dasar ---");

  // Contoh data awal untuk demonstrasi (upsert agar tidak terjadi duplikasi jika script dijalankan berulang)
  const initialUser = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: { name: "John Doe" },
    create: { email: "john.doe@example.com", name: "John Doe" },
  });

  const initialPost = await prisma.post.upsert({
    where: { id: 1 }, // Asumsi ID 1 bisa digunakan untuk initial post
    update: { title: "Belajar Prisma Bagian Awal" },
    create: {
      title: "Belajar Prisma Bagian Awal",
      content: "Ini adalah post pertama tentang Prisma.",
      published: true,
      authorId: initialUser.id,
    },
  });

  const initialProduct = await prisma.product.upsert({
    where: { id: 1 }, // Asumsi ID 1 bisa digunakan untuk initial product
    update: { name: "Smart TV" },
    create: {
      name: "Smart TV",
      description: {
        resolution: "4K UHD",
        size: "55 inch",
      },
      tags: ["electronics", "tv", "smart"],
    },
  });

  // --- Bagian A: Select (Membaca Data) ---
  console.log("\n--- Bagian A: Select (Membaca Data) ---");

  // 1. Mengambil Semua Record (`findMany`)
  // Mengambil semua pengguna dari database
  const allUsers = await prisma.user.findMany();
  console.log("Semua Pengguna:", allUsers);

  // Mengambil semua post yang sudah dipublikasi
  const publishedPosts = await prisma.post.findMany({
    where: {
      published: true,
    },
  });
  console.log("Post yang Terpublikasi:", publishedPosts);

  // Mengambil produk dengan nama tertentu, dan hanya memilih kolom id dan name
  const specificProduct = await prisma.product.findMany({
    where: {
      name: {
        contains: "TV", // Pencarian case-sensitive untuk MySQL secara default
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  console.log('Produk dengan Nama Mengandung "TV":', specificProduct);

  // 2. Mengambil Satu Record Unik (`findUnique`)
  // Mengambil pengguna berdasarkan ID
  const userById = await prisma.user.findUnique({
    where: {
      id: initialUser.id, // Menggunakan ID dari pengguna awal
    },
  });
  console.log(`Pengguna dengan ID ${initialUser.id}:`, userById);

  // Mengambil pengguna berdasarkan email unik
  const userByEmail = await prisma.user.findUnique({
    where: {
      email: "john.doe@example.com",
    },
  });
  console.log('Pengguna dengan Email "john.doe@example.com":', userByEmail);

  // 3. Mengambil Satu Record Pertama yang Cocok (`findFirst`)
  // Mengambil post pertama yang belum dipublikasi
  const firstUnpublishedPost = await prisma.post.findFirst({
    where: {
      published: false,
    },
    orderBy: {
      createdAt: "asc", // Urutkan berdasarkan waktu pembuatan dari yang terlama
    },
  });
  console.log("Post Pertama yang Belum Terpublikasi:", firstUnpublishedPost);

  // --- Bagian B: Insert (Membuat Data) ---
  console.log("\n--- Bagian B: Insert (Membuat Data) ---");

  // Membuat pengguna baru
  const newUser = await prisma.user.create({
    data: {
      email: "alice.smith@example.com",
      name: "Alice Smith",
    },
  });
  console.log("Pengguna Baru Dibuat:", newUser);

  // Membuat post baru yang terhubung ke pengguna yang baru dibuat
  const newPost = await prisma.post.create({
    data: {
      title: "Judul Post Pertama Alice",
      content: "Ini adalah konten dari post pertama Alice.",
      published: true,
      author: {
        connect: {
          id: newUser.id, // Menghubungkan post ke pengguna yang baru dibuat
        },
      },
    },
  });
  console.log("Post Baru Dibuat:", newPost);

  // Membuat produk baru dengan field JSON (description) dan array tags (disimpan sebagai JSON)
  const newProduct = await prisma.product.create({
    data: {
      name: "Smartphone X",
      description: {
        screen: "AMOLED",
        storage: "128GB",
        camera: "48MP",
      },
      tags: ["electronics", "mobile", "gadget"], // Ini akan disimpan sebagai JSON string di MySQL
    },
  });
  console.log("Produk Baru Dibuat:", newProduct);

  // --- Bagian C: Update (Memperbarui Data) ---
  console.log("\n--- Bagian C: Update (Memperbarui Data) ---");

  // 1. Memperbarui Satu Record (`update`)
  // Memperbarui nama pengguna dengan ID tertentu
  const updatedUser = await prisma.user.update({
    where: {
      id: newUser.id, // Menggunakan ID dari pengguna yang baru dibuat
    },
    data: {
      name: "Alicia Smith-Updated",
    },
  });
  console.log("Pengguna Diperbarui:", updatedUser);

  // Memperbarui status publikasi sebuah post
  const updatedPost = await prisma.post.update({
    where: {
      id: newPost.id, // Menggunakan ID dari post yang baru dibuat
    },
    data: {
      published: false, // Mengubah status menjadi tidak terpublikasi
    },
  });
  console.log("Post Diperbarui:", updatedPost);

  // Memperbarui field JSON pada produk dan array tags
  const updatedProduct = await prisma.product.update({
    where: {
      id: newProduct.id,
    },
    data: {
      description: {
        ...newProduct.description, // Pertahankan data JSON yang sudah ada
        battery: "5000mAh", // Tambahkan field baru ke JSON
      },
      tags: ["electronics", "mobile", "gadget", "new_tag"], // Update array tags secara keseluruhan
    },
  });
  console.log("Produk Diperbarui (JSON & Tags):", updatedProduct);

  // 2. Memperbarui Banyak Record (`updateMany`)
  // Memperbarui semua post yang belum terpublikasi menjadi terpublikasi
  const { count: updatedPostsCount } = await prisma.post.updateMany({
    where: {
      published: false,
    },
    data: {
      published: true,
    },
  });
  console.log(`Jumlah post yang diubah menjadi terpublikasi: ${updatedPostsCount}`);

  // 3. Membuat atau Memperbarui Record (`upsert`)
  // Upsert pengguna: Jika email ditemukan, update namanya; jika tidak, buat pengguna baru
  const upsertedUser = await prisma.user.upsert({
    where: {
      email: "bob.builder@example.com",
    },
    update: {
      name: "Bob The Builder",
    },
    create: {
      email: "bob.builder@example.com",
      name: "Bob Builder",
    },
  });
  console.log("Pengguna Upserted:", upsertedUser);

  // --- Bagian D: Delete (Menghapus Data) ---
  console.log("\n--- Bagian D: Delete (Menghapus Data) ---");

  // 1. Menghapus Satu Record (`delete`)
  // Untuk demonstrasi, kita akan membuat item sementara lalu menghapusnya
  const tempPostToDelete = await prisma.post.create({
    data: {
      title: "Post Sementara Untuk Dihapus",
      authorId: initialUser.id, // Gunakan ID pengguna yang sudah ada
    },
  });
  const deletedTempPost = await prisma.post.delete({
    where: {
      id: tempPostToDelete.id,
    },
  });
  console.log("Post Sementara Dihapus:", deletedTempPost);

  // 2. Menghapus Banyak Record (`deleteMany`)
  // Menghapus semua produk dengan nama mengandung 'Phone'
  const { count: deletedProductsCount } = await prisma.product.deleteMany({
    where: {
      name: {
        contains: "Phone",
      },
    },
  });
  console.log(`Jumlah produk yang dihapus: ${deletedProductsCount}`);

  // Menghapus pengguna dan post yang dibuat di awal untuk menjaga kebersihan data.
  // Penting: Jika ada relasi yang menghalangi (misal, Post terhubung ke User),
  // Anda perlu menghapus Post terlebih dahulu atau mengkonfigurasi onDelete: Cascade di schema.prisma.
  try {
    await prisma.post.deleteMany({
      where: { authorId: newUser.id }, // Hapus semua post oleh Alice
    });
    const deletedUser = await prisma.user.delete({
      where: { id: newUser.id }, // Hapus pengguna Alice
    });
    console.log('Pengguna "Alice Smith" Dihapus:', deletedUser);
  } catch (e) {
    console.log("Gagal menghapus Alice Smith (mungkin ada relasi yang belum terhapus atau sudah terhapus):", e.message);
  }

  // --- Bagian E: Join / Relasi (Mengambil Data Terkait) ---
  console.log("\n--- Bagian E: Join / Relasi (Mengambil Data Terkait) ---");

  // 1. Mengambil Record dengan Relasi Terkait (`include`)
  // Mengambil semua pengguna beserta post yang mereka buat
  const usersWithPosts = await prisma.user.findMany({
    include: {
      posts: true, // Sertakan semua post yang terkait dengan setiap pengguna
    },
  });
  console.log("\nPengguna dengan Post Terkait:");
  usersWithPosts.forEach((user) => {
    console.log(`- ${user.name} (${user.email}) memiliki post:`);
    user.posts.forEach((post) => {
      console.log(`  - ${post.title} (Published: ${post.published})`);
    });
  });

  // Mengambil post beserta informasi penulisnya (User)
  const postsWithAuthors = await prisma.post.findMany({
    include: {
      author: {
        // Sertakan informasi penulis
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  console.log("\nPost dengan Penulis Terkait:");
  postsWithAuthors.forEach((post) => {
    console.log(`- "${post.title}" oleh ${post.author ? post.author.name : "Unknown"}`);
  });

  // 2. Filter Berdasarkan Relasi (`where` bersarang)
  // Mengambil pengguna yang memiliki post dengan judul tertentu
  const usersWithSpecificPost = await prisma.user.findMany({
    where: {
      posts: {
        some: {
          // 'some' untuk relasi One-to-Many: setidaknya satu post memenuhi kondisi
          title: {
            contains: "Prisma",
          },
        },
      },
    },
  });
  console.log('\nPengguna dengan Post yang Mengandung "Prisma":', usersWithSpecificPost);

  // Mengambil post yang penulisnya memiliki email tertentu
  const postsBySpecificAuthor = await prisma.post.findMany({
    where: {
      author: {
        email: "john.doe@example.com",
      },
    },
  });
  console.log('\nPost oleh "john.doe@example.com":', postsBySpecificAuthor);

  // --- Bagian F: Aggregate (Fungsi Agregat) ---
  console.log("\n--- Bagian F: Aggregate (Fungsi Agregat) ---");

  // Menghitung jumlah total pengguna
  const totalUsers = await prisma.user.count();
  console.log("Total Pengguna:", totalUsers);

  // Menghitung jumlah post yang terpublikasi
  const publishedPostsCount = await prisma.post.count({
    where: {
      published: true,
    },
  });
  console.log("Jumlah Post yang Terpublikasi:", publishedPostsCount);

  // Menghitung statistik (count, min, max) untuk ID post
  const postStats = await prisma.post.aggregate({
    _count: {
      id: true,
    },
    _min: {
      id: true,
    },
    _max: {
      id: true,
    },
  });
  console.log("Statistik Post (Count, Min ID, Max ID):", postStats);

  // --- Bagian G: Raw Query (Kueri SQL Mentah) ---
  console.log("\n--- Bagian G: Raw Query (Kueri SQL Mentah) ---");

  // Menjalankan kueri SQL mentah untuk mengambil data (QueryRaw)
  // Penting: Selalu gunakan tagged template literals untuk parameterisasi kueri ($)
  const rawUsers = await prisma.$queryRaw`SELECT id, email, name FROM User WHERE email = ${"john.doe@example.com"}`;
  console.log("Pengguna dari Raw Query:", rawUsers);

  // Menjalankan kueri SQL mentah untuk memperbarui data (ExecuteRaw)
  // Contoh ini akan memperbarui name dari 'John Doe' menjadi 'John D. Updated'
  const rawUpdateResult = await prisma.$executeRaw`UPDATE User SET name = ${"John D. Updated"} WHERE email = ${"john.doe@example.com"}`;
  console.log(`Jumlah baris diupdate oleh Raw Query: ${rawUpdateResult}`);

  // Periksa hasil update
  const updatedJohn = await prisma.user.findUnique({
    where: { email: "john.doe@example.com" },
  });
  console.log("Pengguna setelah Raw Update:", updatedJohn);

  // Contoh memanggil Stored Procedure (jika ada di MySQL dan diperlukan)
  // Ini adalah contoh konseptual, Anda perlu mendefinisikan SP di MySQL terlebih dahulu:
  /*
  DELIMITER //
  CREATE PROCEDURE GetTotalUsers(OUT userCount INT)
  BEGIN
      SELECT COUNT(*) INTO userCount FROM User;
  END //
  DELIMITER ;
  */
  // Untuk memanggilnya dan mengambil hasilnya:
  // await prisma.$executeRaw`CALL GetTotalUsers(@totalUsers);`;
  // const spResult = await prisma.$queryRaw`SELECT @totalUsers AS totalUsers;`;
  // console.log('Hasil Stored Procedure (contoh):', spResult[0].totalUsers);

  // --- Bagian H: Transaction (Transaksi) ---
  console.log("\n--- Bagian H: Transaction (Transaksi) ---");

  // 1. Transaksi Interaktif (`$transaction`)
  // Contoh skenario: Membuat user dan post secara bersamaan
  async function createAuthorAndFirstPost(email, name, postTitle, postContent) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const author = await tx.user.create({
          data: { email, name },
        });

        const post = await tx.post.create({
          data: {
            title: postTitle,
            content: postContent,
            published: true,
            authorId: author.id,
          },
        });

        return { author, post };
      });
      console.log("\nTransaksi Berhasil: Penulis dan Post Dibuat:", result);
      return result;
    } catch (error) {
      console.error("\nTransaksi Gagal, Rollback:", error.message);
      throw error; // Re-throw error untuk penanganan lebih lanjut
    }
  }

  const createdTransactionData = await createAuthorAndFirstPost("charlie.chaplin@example.com", "Charlie Chaplin", "Pengalaman Pertama Prisma", "Sangat menyenangkan belajar Prisma dengan transaksi.");

  // Contoh transaksi yang sengaja dibuat gagal (email duplikat)
  try {
    await createAuthorAndFirstPost(
      "charlie.chaplin@example.com", // Email duplikat (akan menyebabkan error)
      "Charlie Duplicate",
      "Post Duplikat",
      "Post ini seharusnya tidak pernah dibuat."
    );
  } catch (e) {
    console.log("Error saat mencoba membuat duplikat email (ini diharapkan karena constraint @unique):", e.message);
  }

  // 2. Transaksi Batch
  // Menjalankan beberapa operasi tulis (create, update, delete) secara paralel dalam satu kueri database
  const [batchProduct1, batchProduct2] = await prisma.$transaction([prisma.product.create({ data: { name: "Keyboard Mekanik", tags: ["komputer", "aksesoris"] } }), prisma.product.create({ data: { name: "Mouse Gaming", tags: ["komputer", "gaming"] } })]);
  console.log("\nTransaksi Batch Berhasil:");
  console.log("Produk 1:", batchProduct1);
  console.log("Produk 2:", batchProduct2);

  // --- Bagian I: JSON Type (Menggunakan Tipe Data JSON) ---
  console.log("\n--- Bagian I: JSON Type (Menggunakan Tipe Data JSON) ---");

  // Membuat produk baru dengan detail JSON dan array tags
  const newProductWithJson = await prisma.product.create({
    data: {
      name: "Smartwatch Y",
      description: {
        display: "OLED",
        features: ["heart rate", "GPS", "NFC"],
        compatibility: {
          ios: true,
          android: true,
        },
      },
      tags: ["wearable", "health", "tech"],
    },
  });
  console.log("\nProduk dengan Data JSON:", newProductWithJson);

  // Mengambil produk dan mengakses data JSON
  const fetchedProductWithJson = await prisma.product.findUnique({
    where: {
      id: newProductWithJson.id,
    },
  });
  console.log("Nama Produk:", fetchedProductWithJson.name);
  // Akses properti dari objek JSON
  console.log("Tipe Layar:", fetchedProductWithJson.description?.display);
  console.log("Fitur (Array JSON):", fetchedProductWithJson.description?.features);
  console.log("Kompatibel iOS:", fetchedProductWithJson.description?.compatibility?.ios);
  console.log("Tags (Array JSON):", fetchedProductWithJson.tags);

  // Memperbarui sebagian dari objek JSON (hanya menambahkan/mengubah properti tertentu)
  const updatedProductJson = await prisma.product.update({
    where: {
      id: newProductWithJson.id,
    },
    data: {
      description: {
        ...fetchedProductWithJson.description, // Mempertahankan data JSON yang sudah ada
        battery: "300mAh", // Menambahkan atau memperbarui properti
      },
      tags: ["wearable", "health", "tech", "waterproof"], // Update array tags secara keseluruhan
    },
  });
  console.log("Produk dengan JSON Diperbarui (Tags diupdate):", updatedProductJson);
} // Akhir dari async function main()

main()
  .catch(async (e) => {
    console.error("Terjadi kesalahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\nKoneksi database ditutup.");
  });
