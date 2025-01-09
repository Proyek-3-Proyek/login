document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded dipanggil, memulai login handling...");

  // Login menggunakan email dan password
  document
    .getElementById("loginButton")
    .addEventListener("click", loginWithEmail);

  // Login menggunakan Google
  document
    .getElementById("googleLoginButton")
    .addEventListener("click", loginWithGoogle);

  // Tangani callback Google login
  handleGoogleLoginCallback();
});

// Fungsi login menggunakan email dan password
async function loginWithEmail() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validasi input
  if (!email || !password) {
    showAlert("Harap isi semua data!", "error");
    return;
  }

  // Tampilkan loading sebelum permintaan dikirim
  let loading;
  Swal.fire({
    title: "Memverifikasi Login...",
    text: "Harap tunggu sementara kami memverifikasi data Anda.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      loading = Swal;
    },
  });

  try {
    const response = await fetch(
      "https://backend-eight-phi-75.vercel.app/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    // Tutup loading setelah respons diterima
    loading.close();

    if (response.ok) {
      // Simpan token ke localStorage
      localStorage.setItem("token", data.token);
      showAlert("Login berhasil!", "success");

      // Redirect berdasarkan role
      const userRole = parseJwt(data.token).role;
      redirectBasedOnRole(userRole);
    } else {
      showAlert(data.message || "Login gagal!", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    loading.close(); // Tutup loading jika terjadi error
    showAlert("Terjadi kesalahan saat mencoba login.", "error");
  }
}

// Fungsi login menggunakan Google
function loginWithGoogle() {
  // Tampilkan loading sebelum pengalihan
  let loading;
  Swal.fire({
    title: "Mengalihkan ke Google...",
    text: "Harap tunggu sebentar.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      loading = Swal;
    },
  });

  const googleLoginUrl =
    "https://backend-eight-phi-75.vercel.app/api/auth/google";
  window.location.href = googleLoginUrl;
  loading.close(); // Tutup loading setelah pengalihan
}

// Fungsi menangani callback Google login
function handleGoogleLoginCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  console.log("URL saat ini:", window.location.href);
  console.log("Token dari URL:", token);

  if (token) {
    try {
      // Simpan token ke localStorage
      localStorage.setItem("token", token);
      console.log(
        "Token berhasil disimpan ke localStorage:",
        localStorage.getItem("token")
      );

      // Parse JWT untuk mendapatkan informasi user
      const payload = parseJwt(token);
      console.log("Payload JWT:", payload);

      // Validasi token dan redirect berdasarkan role
      if (!payload || !payload.id || !payload.role) {
        throw new Error("Token tidak valid");
      }
      redirectBasedOnRole(payload.role);
    } catch (error) {
      console.error("Error:", error.message);
      showAlert(
        "Terjadi kesalahan saat login dengan Google. Silakan coba lagi.",
        "error"
      );
    } finally {
      // Bersihkan URL query string
      const baseUrl = window.location.origin + window.location.pathname;
      console.log("Menghapus query string, redirect ke:", baseUrl);
      window.history.replaceState({}, document.title, baseUrl);
    }
  } else {
    console.log("Token tidak ditemukan di URL.");
  }
}

// Fungsi redirect berdasarkan role
function redirectBasedOnRole(role) {
  if (role === "admin") {
    window.location.href = "/dashboard";
  } else if (role === "pelanggan") {
    window.location.href =
      "/tokline.github.io";
  } else {
    showAlert("Role tidak dikenali", "error");
  }
}

// Fungsi untuk mem-parse JWT
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split(" ")
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );

  return JSON.parse(jsonPayload);
}

// Fungsi untuk menampilkan SweetAlert2
function showAlert(message, type) {
  Swal.fire({
    title: type === "success" ? "Berhasil" : "Kesalahan",
    text: message,
    icon: type,
    confirmButtonText: "OK",
  });
}

// Event listener untuk tombol WhatsApp Login
document.getElementById("whatsappLogin").addEventListener("click", () => {
  window.location.href = "./../../../src/page/whatsauth/index.html";
});

// Redirect ke signup.html dengan efek loading
const loadingOverlay = document.getElementById("loadingOverlay");
document.getElementById("signupRedirect").addEventListener("click", (e) => {
  e.preventDefault();
  loadingOverlay.classList.remove("hidden");
  setTimeout(() => {
    window.location.href = "/register";
  }, 2000);
});
