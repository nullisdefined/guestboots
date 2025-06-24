// API Gateway 엔드포인트 URL (실제 배포된 API Gateway URL로 변경)
const API_BASE_URL =
  "https://zzgm438ccd.execute-api.ap-northeast-2.amazonaws.com/prod";

// 색상과 회전 옵션
const NOTE_COLORS = ["yellow", "pink", "blue", "green", "orange", "purple"];
const ROTATIONS = ["-2deg", "-1deg", "0deg", "1deg", "2deg", "3deg", "-3deg"];

// DOM 요소들
const modal = document.getElementById("addNoteModal");
const addNoteBtn = document.getElementById("addNoteBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelBtn");
const noteForm = document.getElementById("noteForm");
const contentTextarea = document.getElementById("content");
const charCount = document.querySelector(".char-count");
const notesContainer = document.getElementById("notesContainer");
const loading = document.getElementById("loading");

// 이벤트 리스너
addNoteBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
noteForm.addEventListener("submit", submitNote);
contentTextarea.addEventListener("input", updateCharCount);

// 모달 외부 클릭시 닫기
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// 페이지 로드시 메모 불러오기
document.addEventListener("DOMContentLoaded", loadNotes);

function openModal() {
  modal.style.display = "block";
  document.getElementById("nickname").focus();
}

function closeModal() {
  modal.style.display = "none";
  noteForm.reset();
  updateCharCount();
}

function updateCharCount() {
  const length = contentTextarea.value.length;
  charCount.textContent = `${length}/200`;

  if (length > 180) {
    charCount.style.color = "#e74c3c";
  } else if (length > 150) {
    charCount.style.color = "#f39c12";
  } else {
    charCount.style.color = "#7f8c8d";
  }
}

async function submitNote(e) {
  e.preventDefault();

  const nickname = document.getElementById("nickname").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!nickname || !content) {
    alert("Please fill in all fields");
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Submitting...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname: nickname,
        content: content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit note");
    }

    const result = await response.json();

    closeModal();
    loadNotes(); // 새로운 메모를 포함해서 다시 로드

    // 성공 메시지
    showNotification("Note added successfully!", "success");
  } catch (error) {
    console.error("Error submitting note:", error);
    showNotification("Failed to add note. Please try again.", "error");
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

async function loadNotes() {
  loading.style.display = "block";
  notesContainer.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/notes`);

    if (!response.ok) {
      throw new Error("Failed to load notes");
    }

    const notes = await response.json();

    loading.style.display = "none";

    if (notes.length === 0) {
      notesContainer.innerHTML =
        '<div class="no-notes">No notes yet. Be the first to leave a message!</div>';
      return;
    }

    notes.forEach((note) => {
      createNoteElement(note);
    });
  } catch (error) {
    console.error("Error loading notes:", error);
    loading.style.display = "none";
    notesContainer.innerHTML =
      '<div class="error-message">Failed to load notes. Please refresh the page.</div>';
  }
}

function createNoteElement(note) {
  const noteDiv = document.createElement("div");
  const randomColor =
    NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const randomRotation =
    ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];

  noteDiv.className = `sticky-note ${randomColor}`;
  noteDiv.style.transform = `rotate(${randomRotation})`;

  const createdDate = new Date(note.created_at);
  const formattedDate = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  noteDiv.innerHTML = `
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-author">- ${escapeHtml(note.nickname)}</div>
        <div class="note-date">${formattedDate}</div>
    `;

  notesContainer.appendChild(noteDiv);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        transition: opacity 0.3s ease;
        ${type === "success" ? "background: #27ae60;" : "background: #e74c3c;"}
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
