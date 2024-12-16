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
    showModal("Harap isi semua data!");
    return;
  }

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

    if (response.ok) {
      // Simpan token ke localStorage
      localStorage.setItem("token", data.token);
      alert("Login berhasil!");

      // Redirect berdasarkan role
      const userRole = parseJwt(data.token).role;
      redirectBasedOnRole(userRole);
    } else {
      showModal(data.message || "Login gagal!");
    }
  } catch (error) {
    console.error("Error:", error);
    showModal("Terjadi kesalahan saat mencoba login.");
  }
}

// Fungsi login menggunakan Google
function loginWithGoogle() {
  const googleLoginUrl =
    "https://backend-eight-phi-75.vercel.app/api/auth/google";
  window.location.href = googleLoginUrl;
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
      alert("Terjadi kesalahan saat login dengan Google. Silakan coba lagi.");
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
      "https://proyek-3-proyek.github.io/tokline.github.io";
  } else {
    throw new Error("Role tidak dikenali");
  }
}

// Fungsi untuk mem-parse JWT
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );

  return JSON.parse(jsonPayload);
}

// Fungsi untuk menampilkan modal error
function showModal(message) {
  const modal = document.getElementById("modalAlert");
  modal.querySelector("p").innerText = message;
  modal.classList.remove("hidden");

  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.add("hidden");
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
