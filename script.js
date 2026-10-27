// Bật / Tắt Menu trên điện thoại khi bấm vào nút Hamburger
document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});
// Kích hoạt cuộn mượt cho tất cả các nút có link bắt đầu bằng dấu "#"
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Ngăn hành vi nhảy trang đột ngột mặc định
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Chiều cao của Header để trừ hao (tránh bị che khuất tiêu đề)
            const headerOffset = 100; 
            
            // Tính toán vị trí chính xác cần cuộn tới
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            // Thực hiện lệnh cuộn mượt
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});
// =========================================================
// HỆ THỐNG PHÁT NHẠC (MUSIC PLAYER) CHO TRANG GÓC NHỎ
// =========================================================

// 1. Mảng dữ liệu chứa danh sách bài hát
// (Sau này bạn tải file .mp3 vào thư mục dự án và thay đường dẫn vào mục 'audioSrc')
const myPlaylist = [
    {
        id: "song-01",
        title: "Giải Cứu Thế Giới",
        subtitle: "Chill - La Phước Toàn Cover x Minh Anh Cover (TyeLow Mix)",
        cover: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=200",
        audioSrc: "assets/audio/Giải Cứu Thế Giới Lofi - La Phước Toàn Cover x Minh Anh Cover (TyeLow Mix).mp3" // Đổi thành file nhạc của bạn
    },
    {
        id: "song-02",
        title: "Ngồi Yên Tình Yêu Sẽ Đến",
        subtitle: "Chill - Kphuong lalala x TyeLow mix",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200",
        audioSrc: "assets/audio/Ngồi Yên Tình Yêu Sẽ Đến - Kphuong lalala x TyeLow mix.mp3"
    },
    {
        id: "song-03",
        title: "Làm Sao Để Em Tựa Vào",
        subtitle: "Lofi - Sino x TyeLow mix.mp3",
        cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=200",
        audioSrc: "assets/audio/Làm Sao Để Em Tựa Vào - Sino x TyeLow mix.mp3"
    },
    {
        id: "song-04",
        title: "Thủy Chung Remix",
        subtitle: "Remix - Thương Võ x TyeLow Mix",
        cover: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=200",
        audioSrc: "assets/audio/Thủy Chung Remix - Thương Võ x TyeLow Mix.mp3"
    },
    {
        id: "song-05",
        title: "???",
        subtitle: "Nhạc sẽ cập nhật trong thời gian tới",
        cover: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=200",
        audioSrc: "assets/audio/bai-hat-5.mp3"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const playlistContainer = document.getElementById('playlistTracks');
    if (!playlistContainer) return;

    let currentAudio = new Audio();
    let currentlyPlayingId = null;

    // Các thành phần của thanh điều khiển dưới cùng
    const playerBar = document.getElementById('playerBar');
    const barCover = document.getElementById('barCover');
    const barTitle = document.getElementById('barTitle');
    const barSubtitle = document.getElementById('barSubtitle');
    const barPlayBtn = document.getElementById('barPlayBtn');
    const iconPlayBar = barPlayBtn.querySelector('.icon-play-bar');
    const iconPauseBar = barPlayBtn.querySelector('.icon-pause-bar');
    const progressBar = document.getElementById('progressBar');
    const timeCurrent = document.getElementById('timeCurrent');
    const timeTotal = document.getElementById('timeTotal');
    const volumeBar = document.getElementById('volumeBar');

    // Hàm chuyển đổi giây thành phút:giây (VD: 125s -> 2:05)
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // 1. Tạo danh sách HTML
    function renderPlaylist() {
        playlistContainer.innerHTML = '';
        myPlaylist.forEach(song => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.id = `track-${song.id}`;
            trackItem.innerHTML = `
                <div class="track-cover"><img src="${song.cover}" alt="Cover"></div>
                <div class="track-info">
                    <h3 class="track-title">${song.title}</h3>
                    <p class="track-subtitle">${song.subtitle}</p>
                </div>
                <div class="audio-wave">
                    <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                </div>
                <button class="track-play-btn" data-id="${song.id}">
                    <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <svg class="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
            `;
            playlistContainer.appendChild(trackItem);
        });
        attachPlayEvents();
    }

    // 2. Cập nhật giao diện khi bài hát Đang phát / Tạm dừng
    function updateUIPlayState(isPlaying, songId) {
        document.querySelectorAll('.track-item').forEach(item => {
            item.classList.remove('playing');
            item.querySelector('.icon-play').style.display = 'block';
            item.querySelector('.icon-pause').style.display = 'none';
        });

        if (isPlaying && songId) {
            const activeTrack = document.getElementById(`track-${songId}`);
            activeTrack.classList.add('playing');
            activeTrack.querySelector('.icon-play').style.display = 'none';
            activeTrack.querySelector('.icon-pause').style.display = 'block';
            
            iconPlayBar.style.display = 'none';
            iconPauseBar.style.display = 'block';
        } else {
            iconPlayBar.style.display = 'block';
            iconPauseBar.style.display = 'none';
        }
    }

    // 3. Xử lý khi bấm nút Play trên Danh sách
    function attachPlayEvents() {
        document.querySelectorAll('.track-play-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = this.getAttribute('data-id');
                const songData = myPlaylist.find(s => s.id === songId);

                if (currentlyPlayingId === songId) {
                    if (currentAudio.paused) currentAudio.play();
                    else currentAudio.pause();
                } else {
                    currentAudio.src = songData.audioSrc;
                    // SỬA LỖI TẠI ĐÂY: Ghi nhận ID bài hát TRƯỚC KHI phát nhạc
                    currentlyPlayingId = songId; 
                    currentAudio.play();

                    // Hiển thị thanh Player Bar và cập nhật thông tin
                    playerBar.classList.add('active');
                    barCover.src = songData.cover;
                    barTitle.innerText = songData.title;
                    barSubtitle.innerText = songData.subtitle;
                }
            });
        });
    }

    // 4. Xử lý khi bấm nút Play/Pause trên thanh Bar
    barPlayBtn.addEventListener('click', () => {
        if (currentAudio.src) {
            if (currentAudio.paused) currentAudio.play();
            else currentAudio.pause();
        }
    });

    // 5. Cập nhật thanh Tua & Thời gian liên tục khi nhạc chạy
    currentAudio.addEventListener('timeupdate', () => {
        const current = currentAudio.currentTime;
        const total = currentAudio.duration;
        
        if (total) {
            const percent = (current / total) * 100;
            progressBar.value = percent;
            timeCurrent.innerText = formatTime(current);
            // Đổ màu cam cho phần đã chạy
            progressBar.style.setProperty('--progress', `${percent}%`);
        }
    });

    // 6. Lấy tổng thời gian ngay khi load xong bài hát
    currentAudio.addEventListener('loadedmetadata', () => {
        timeTotal.innerText = formatTime(currentAudio.duration);
    });

    // 7. Xử lý người dùng kéo thanh Tua (Seek)
    progressBar.addEventListener('input', () => {
        const seekTime = (progressBar.value / 100) * currentAudio.duration;
        currentAudio.currentTime = seekTime;
        progressBar.style.setProperty('--progress', `${progressBar.value}%`);
    });

    // Lắng nghe sự kiện Audio mặc định
    currentAudio.addEventListener('play', () => updateUIPlayState(true, currentlyPlayingId));
    currentAudio.addEventListener('pause', () => updateUIPlayState(false, currentlyPlayingId));
    currentAudio.addEventListener('ended', () => updateUIPlayState(false, null));

    renderPlaylist();
    // 8. Xử lý thanh chỉnh Âm lượng
    if (volumeBar) {
        volumeBar.addEventListener('input', () => {
            const vol = volumeBar.value / 100;
            currentAudio.volume = vol;
            volumeBar.style.setProperty('--vol-progress', `${volumeBar.value}%`);
        });
    }
});
// Tính năng Copy Email ở trang Liên hệ
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyEmailBtn');
    const myEmail = document.getElementById('myEmail');

    if(copyBtn && myEmail) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(myEmail.innerText).then(() => {
                // Đổi icon sang dấu tích xanh
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                
                // Trả về icon cũ sau 2 giây
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            });
        });
    }
});