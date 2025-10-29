const app = document.getElementById("app");
renderHomeView();

// 라우터: 해시(#) 변경 → 화면 전환
window.addEventListener("hashchange", renderPage);
window.addEventListener("load", renderPage);

function renderPage() {
  const hash = location.hash;

  if (hash.startsWith("#/list/")) {
    const starCount = parseInt(hash.replace("#/list/", ""));
    renderListView(starCount);
  } else {
    renderHomeView(); // 기본: 홈 화면
  }
}



/* ------------------------
   홈 화면 렌더링
------------------------- */
function renderHomeView() {
  app.innerHTML = `
    <div class="home-container">
      <h1 class="home-title">기슐랭 스타</h1>
      <div class="home-buttons">
        <button onclick="renderListView(1)">  ⭐  </button>
        <button onclick="renderListView(2)"> ⭐⭐ </button>
        <button onclick="renderListView(3)">⭐⭐⭐</button>
        <button onclick="renderBookmarks()">  📌  </button>
      </div>
    </div>
  `;
}

function goHome() {
  renderHomeView();
}

// Bookmark 페이지 이동 (추후 구현)
function goBookmark() {
  location.hash = "#/bookmark";
}


// 목록 화면 이동 함수
function goList(stars) {
  renderListView(stars);
}


/* ------------------------
   맛집 목록 화면
   (다음 단계에서 본격 작성!)
------------------------- */
function renderListView(stars) {
  const filtered = restaurants.filter(r => r.stars === stars);
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
restaurants.forEach(r => r.bookmarked = bookmarks.includes(r.name));


  let html = `
    <div class="top-bar">
      <button class="home-btn" onclick="renderHomeView()"></button>
    </div>
    <div class="restaurant-grid">
  `;

  filtered.forEach((r, idx) => {
    const slider = createSlider(r.images, idx);
    html += `
      <div class="restaurant-card" id="card-${idx}">
        ${slider}
        <h3>${r.name}</h3>
        <p>분류: ${r.category}</p>
        <button class="bookmark-btn ${bookmarks.includes(r.name)?'active':''}" 
            onclick="event.stopPropagation(); toggleBookmark('${r.name}', this)">★</button>
        <div id="detail-${idx}" style="display:none; margin-top:8px;">
          ${r.menu.map(m => `<p><b>${m.food}</b> ${m.price}<br>${m.desc} (평점: ${m.rating})</p>`).join('')}
        </div>
      </div>
    `;
  });

  app.innerHTML = html;

  // 카드 클릭 이벤트 연결 (상세 토글)
  filtered.forEach((r, idx) => {
    const card = document.getElementById(`card-${idx}`);
    if (!card) return;
    card.addEventListener("click", () => toggleDetail(`detail-${idx}`));

    // 슬라이더 버튼 클릭 이벤트 버블링 방지
    const container = document.getElementById(`slider-${idx}`);
    if (!container) return;
    const buttons = container.querySelectorAll(".slider-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", e => e.stopPropagation());
    });
  });
}



function createSlider(images, cardId) {
  let sliderHtml = `<div class="slider-container" id="slider-${cardId}">`;
  images.forEach((img, idx) => {
    sliderHtml += `<img src="picture/${img}" style="display:${idx===0?'block':'none'}">`;
  });
  sliderHtml += `
    <button class="slider-btn left" onclick="slideLeft('slider-${cardId}')">&#9664;</button>
    <button class="slider-btn right" onclick="slideRight('slider-${cardId}')">&#9654;</button>
  </div>`;
  return sliderHtml;
}

function slideLeft(sliderId) {
  const container = document.getElementById(sliderId);
  const imgs = container.querySelectorAll("img");
  let current = Array.from(imgs).findIndex(img => img.style.display === "block");
  imgs[current].style.display = "none";
  current = (current - 1 + imgs.length) % imgs.length;
  imgs[current].style.display = "block";
}

function slideRight(sliderId) {
  const container = document.getElementById(sliderId);
  const imgs = container.querySelectorAll("img");
  let current = Array.from(imgs).findIndex(img => img.style.display === "block");
  imgs[current].style.display = "none";
  current = (current + 1) % imgs.length;
  imgs[current].style.display = "block";
}

filtered.forEach((r, idx) => {
  const slider = createSlider(r.images, idx);
  html += `
    <div class="restaurant-card" onclick="toggleDetail('detail-${idx}')">
      ${slider}
      <h3>${r.name}</h3>
      <p>분류: ${r.category}</p>
      <button class="bookmark-btn ${bookmarks.includes(r.name)?'active':''}" onclick="event.stopPropagation(); toggleBookmark('${r.name}', this)">★</button>
      <div id="detail-${idx}" style="display:none; margin-top:8px;"></div>
    </div>
  `;
});


// 검색창 토글
function toggleSearch() {
  const bar = document.getElementById("searchInput");
  if (bar.style.display === "block") bar.style.display = "none";
  else bar.style.display = "block";
}

// 검색 기능
function searchRestaurant(stars) {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = restaurants.filter(r => r.stars === stars && r.name.toLowerCase().includes(query));
  
  let cards = "";
  filtered.forEach((r, idx) => {
    cards += `
      <div class="restaurant-card" onclick="toggleDetail('detail-${idx}')">
        <img src="picture/${r.images[0]}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p>분류: ${r.category}</p>
        <div id="detail-${idx}" style="display:none; margin-top:8px;"></div>
      </div>
    `;
  });

  // 결과만 업데이트
  document.querySelectorAll(".restaurant-card").forEach(c => c.remove());
  app.insertAdjacentHTML('beforeend', cards);
}

// 상세 토글
function toggleDetail(detailId) {
  const detail = document.getElementById(detailId);
  if (!detail) return;
  detail.style.display = (detail.style.display === "none") ? "block" : "none";
}

// 즐겨찾기 저장: localStorage 사용
function toggleBookmark(name, btn) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  if (bookmarks.includes(name)) {
    bookmarks = bookmarks.filter(n => n !== name);
    if (btn) btn.classList.remove("active");
  } else {
    bookmarks.push(name);
    if (btn) btn.classList.add("active");
  }
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  // restaurants 배열에 bookmarked 상태 동기화
  const restaurant = restaurants.find(r => r.name === name);
  if (restaurant) restaurant.bookmarked = bookmarks.includes(name);
}

// 즐겨찾기 페이지
function renderBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  const bookmarkedRestaurants = restaurants.filter(r => bookmarks.includes(r.name));

  let html = `
    <div class="top-bar">
      <button class="home-btn" onclick="renderHomeView()"></button>
    </div>
    <div class="restaurant-grid">
  `;

  if (bookmarkedRestaurants.length === 0) {
    html += "<p style='color:white; text-align:center;'>북마크한 맛집이 없습니다.</p>";
  } else {
    bookmarkedRestaurants.forEach((r, idx) => {
      html += `
        <div class="restaurant-card" onclick="toggleDetail('bookmark-${idx}')">
          <img src="picture/${r.images[0]}" alt="${r.name}">
          <h3>${r.name}</h3>
          <p>분류: ${r.category}</p>
          <button class="bookmark-btn active" onclick="event.stopPropagation(); toggleBookmark('${r.name}', this)">★</button>
          <div id="bookmark-${idx}" class="detail" style="display:none;">
            ${r.menu.map(m => `<p><b>${m.food}</b> ${m.price}<br>${m.desc} (평점: ${m.rating})</p>`).join('')}
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;
  app.innerHTML = html;
}


filtered.forEach((r, idx) => {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  const isBookmarked = bookmarks.includes(r.name);
  
  html += `
    <div class="restaurant-card" onclick="toggleDetail('detail-${idx}')">
      <img src="picture/${r.images[0]}" alt="${r.name}">
      <h3>${r.name}</h3>
      <p>분류: ${r.category}</p>
      <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="event.stopPropagation(); toggleBookmark('${r.name}', this)">★</button>
      <div id="detail-${idx}" style="display:none; margin-top:8px;"></div>
    </div>
  `;
});

function goHome() {
  renderHomeView();
}

