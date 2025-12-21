// 1. 💡 마우스 오버 이미지 효과 (IIFE로 변수 완벽 격리)
(function() {
    gsap.set(".list img.swipeimage", { yPercent: -50, xPercent: -50 });

    let isInitialEnter = false; 

    gsap.utils.toArray(".list").forEach((el) => {
        const image = el.querySelector("img.swipeimage"),
            setX = gsap.quickTo(image, "x", { duration: 0.4, ease: "power3" }),
            setY = gsap.quickTo(image, "y", { duration: 0.4, ease: "power3" }),
            
            alignCursor = (e) => {
                if (isInitialEnter) {
                    setX(e.clientX, e.clientX); 
                    setY(e.clientY, e.clientY);
                    isInitialEnter = false; 
                } else {
                    setX(e.clientX);
                    setY(e.clientY);
                }
            },
            
            startFollow = () => document.addEventListener("mousemove", alignCursor),
            stopFollow = () => document.removeEventListener("mousemove", alignCursor),
            
            fadeImage = gsap.to(image, {
                autoAlpha: 1, 
                ease: "none",
                paused: true,
                duration: 0.1,
                onReverseComplete: stopFollow
            });

        el.addEventListener("mouseenter", (e) => {
            isInitialEnter = true; 
            fadeImage.play();
            startFollow();
            alignCursor(e); 
        });

        el.addEventListener("mouseleave", () => fadeImage.reverse());
    });
})();

// -------------------- 2. GSAP 스크롤 기반 헤더 숨김/노출 (IIFE로 변수 완벽 격리) --------------------
(function() {
    const headerScrollAnim = gsap.from('#header', { 
        y: "-100%", 
        paused: true,
        duration: 0.2,
        ease: "power2.inOut"
    }).progress(1); 

    ScrollTrigger.create({
        start: "top top", 
        onUpdate: (self) => {
            if (self.direction === -1) {
                headerScrollAnim.play(); 
            } else {
                headerScrollAnim.reverse(); 
            }
        }
    });
})();
// -------------------- 3. Swiper 초기화 --------------------
const swiper2 = new Swiper("#work .swiper", { 
    slidesPerView: 1,
    loop: true,
    spaceBetween: 30, 
    navigation: {
        prevEl: ".arrow-left",
        nextEl: ".arrow-right",
    },
});

// -------------------- 4. 푸터 배경 파동 (SVG Arc Draw) 애니메이션 --------------------
function getPathLength(pathElement) {
    return pathElement.getTotalLength ? pathElement.getTotalLength() : 0;
}

function startSvgWaveAnimation() {
    const waveTop = document.getElementById('wave-top');
    const waveBottom = document.getElementById('wave-bottom');
    const svgElement = document.querySelector('.background-waves');
    
    if (!waveTop || !waveBottom || !svgElement) {
        console.error("SVG Wave paths or element not found. Footer wave animation skipped.");
        return;
    }

    const lenTop = getPathLength(waveTop);
    const lenBottom = getPathLength(waveBottom);

    gsap.set(waveTop, { strokeDasharray: lenTop, strokeDashoffset: lenTop });
    gsap.set(waveBottom, { strokeDasharray: lenBottom, strokeDashoffset: lenBottom });

    const waveTL = gsap.timeline({
        defaults: {
            duration: 2.5,
            ease: "power2.out"
        }
    });

    waveTL.to(svgElement, { opacity: 1 }, 0); 
    waveTL.to([waveTop, waveBottom], { strokeDashoffset: 0 }, 0); 
}

ScrollTrigger.create({
    trigger: "footer", 
    start: "top bottom", 
    once: true,
    onEnter: startSvgWaveAnimation
});


// -------------------- 5. 로딩 애니메이션 (배너 타이틀 정렬 및 헤더 복구 버전) --------------------
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        
        const nameLetters = ['M', 'I', 'N', 'A','\u00A0', 'P','O','R','T','F','O','L','I','O'];
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text'); 
        const loadingLineElement = document.getElementById('loading-line'); 
        const loadingLineSvg = document.getElementById('loading-line-svg');
        
        // 대상 요소들
        const bannerTarget = document.querySelector('.banner-title > p');
        const finalMinaLogo = document.getElementById('final-logo'); // 헤더 로고

        let targetPos = { x: 0, y: 0 };

        if (!loadingLineElement || !bannerTarget || !loadingOverlay) {
            if (loadingOverlay) loadingOverlay.remove();
            document.body.style.overflow = 'auto';
            return; 
        }
        
        function calculateTargetPosition() {
            const rect = bannerTarget.getBoundingClientRect();
            targetPos.x = rect.left + (rect.width / 2);
            targetPos.y = rect.top + (rect.height / 2);
        }

        function startLoadingAnimation() {
            calculateTargetPosition(); 

            const lineLength = loadingLineElement.getTotalLength ? loadingLineElement.getTotalLength() : 800; 
            gsap.set(loadingLineElement, { 
                strokeDasharray: lineLength, 
                strokeDashoffset: lineLength
            });

            // 초기 설정
            loadingText.textContent = "";
            gsap.set(loadingText, { 
                opacity: 0, 
                left: "50%",
                top: "50%",
                xPercent: -50,
                yPercent: -50,
                position: "fixed",
                fontSize: "60px",
                color: "white",
                zIndex: 10001 // 오버레이보다 위
            });
            
            // 배너 글자와 헤더 로고를 초기에 숨김
            gsap.set(bannerTarget, { opacity: 0 }); 
            if (finalMinaLogo) gsap.set(finalMinaLogo, { opacity: 0 }); 
            
            document.body.style.overflow = 'hidden';

            const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

            // Phase 1: 라인 드리기
            tl.to(loadingLineElement, { 
                strokeDashoffset: 0, 
                duration: 1.2
            });

            // Phase 2: 라인 페이드아웃 및 타이핑
            tl.to(loadingLineSvg, { opacity: 0, duration: 0.3 }, "+=0.2"); 
            
            nameLetters.forEach((letter, index) => {
                tl.to(loadingText, { 
                    opacity: 1, 
                    duration: 0.05, 
                    onStart: () => { loadingText.textContent += letter; } 
                }, `StartText+=${index * 0.12}`); 
            });

            // Phase 3: 배너 위치로 이동
            tl.addLabel("MoveToBanner", "+=0.3");
            
            tl.to(loadingText, {
                duration: 1.2, 
                x: () => targetPos.x - (window.innerWidth / 2),
                y: () => targetPos.y - (window.innerHeight / 2),
                fontSize: "60px", 
                fontWeight: 100,
                letterSpacing: "2px",
                color: "#111111", 
                ease: "expo.inOut"
            }, "MoveToBanner");

            tl.to(loadingOverlay, {
                duration: 1.0, 
                backgroundColor: "#ffffff",
                ease: "expo.inOut"
            }, "MoveToBanner");

            // Phase 4: 오버레이 제거 및 모든 요소 노출 (헤더 로고 포함)
            tl.addLabel("Finish", "-=0.3");

            tl.to(bannerTarget, { opacity: 1, duration: 0.2 }, "Finish"); 
            
            // ★ 여기서 헤더 로고를 다시 나타나게 합니다.
            if (finalMinaLogo) {
                tl.to(finalMinaLogo, { opacity: 1, duration: 0.5 }, "Finish");
            }

            tl.to(loadingText, { opacity: 0, duration: 0.2 }, "Finish"); 
            
            tl.to(loadingOverlay, { 
                opacity: 0, 
                duration: 0.6,
                onComplete: () => {
                    loadingOverlay.remove();
                    document.body.style.overflow = 'auto';
                } 
            });
        }

        setTimeout(function() {
            startLoadingAnimation();
            window.addEventListener('resize', calculateTargetPosition); 
        }, 300); 
    });
})();

// -------------------- 6. 스와이퍼 애니메이션 --------------------
const detailSwiper = new Swiper('.detail-swiper', {
  // 기본 설정
  slidesPerView: 1,       // 모바일에서는 1개
  spaceBetween: 20,      // 슬라이드 사이 간격
  loop: true,            // 무한 반복
  centeredSlides: false, // 왼쪽 정렬
  grabCursor: true,

  // 자동 재생
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },

  // 스크롤바
  scrollbar: {
    el: '.detail__scrollbar',
    draggable: true,
  },

  // 반응형 구간 설정
  breakpoints: {
    768: {
      slidesPerView: 2,   // 태블릿에서는 2개
      spaceBetween: 30,
    },
    1200: {
      slidesPerView: 3,   // 데스크탑에서 정확히 3개 노출
      spaceBetween: 40,   // 간격이 넓을수록 3개가 꽉 차 보입니다
    }
  }
});

// -------------------- 7. 팝업 애니메이션 --------------------
document.addEventListener('click', function (e) {
  // 1. 클릭한 요소가 open-popup인지 확인
  const btn = e.target.closest('.open-popup');
  
  if (btn) {
    e.preventDefault();
    
    // 팝업 요소들을 찾습니다.
    const popup = document.getElementById('project-popup');
    const pImg = document.getElementById('popup-img');
    const pTitle = document.getElementById('popup-title');
    const pDesc = document.getElementById('popup-desc');
    const pType = document.getElementById('popup-type');

    // [중요] 모든 요소가 HTML에 존재하는지 체크 (에러 방지)
    if (popup && pImg && pTitle && pDesc && pType) {
      // 데이터 주입
      pType.innerText = btn.getAttribute('data-type') || "DESIGN";
      pTitle.innerText = btn.getAttribute('data-title') || "Title";
      pImg.src = btn.getAttribute('data-img') || "";
      pDesc.innerText = btn.getAttribute('data-desc') || "Description";

      // 팝업 표시
      popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    } else {
      console.error("팝업 필수 요소 중 일부를 찾을 수 없습니다. HTML ID를 확인하세요.");
    }
  }

  // 2. 닫기 처리
  if (e.target.classList.contains('popup-close') || e.target.id === 'project-popup') {
    const popup = document.getElementById('project-popup');
    if (popup) {
      popup.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }
});

// 페이지 로드 후 상세 이미지들을 미리 캐싱함
window.addEventListener('load', () => {
  const imagesToPreload = [
    './imgs/cosrx_detail.jpg',
    './imgs/nikon_detail.jpg',
    './imgs/29cm_detail.jpg'
  ];

  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
});

// 모든 섹션이나 특정 클래스(.reveal)를 가진 요소에 적용
gsap.utils.toArray(".reveal").forEach((element) => {
  gsap.from(element, {
    scrollTrigger: {
      trigger: element,
      start: "top 85%", // 요소의 상단이 화면의 85% 지점에 닿으면 시작
      toggleActions: "play none none reverse", // 다시 올라갈 때 사라지게 하려면 reverse
    },
    y: 50,          // 50px 아래에서 시작
    opacity: 0,     // 투명도 0에서 시작
    duration: 1,    // 1초 동안 재생
    ease: "power2.out"
  });
});

// -------------------- 슬라이드 업 --------------------
window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  if ("fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  const fadeElements = document.querySelectorAll("[fade]");

  fadeElements.forEach((el) => {
    const dir = el.getAttribute("fade");
    const delay = Number(el.dataset.delay) || 0;

    const from = { opacity: 0 };
    if (dir === "up") from.y = 60;
    if (dir === "down") from.y = -60;
    if (dir === "left") from.x = 60;
    if (dir === "right") from.x = -60;

    // ✅ 초기 상태 설정 (깜빡임 방지)
    gsap.set(el, from);

    // ✅ scrollTrigger timeline with reverse
    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "bottom top",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
        defaults: { ease: "power2.out" },
      })
      .fromTo(el, from, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        delay,
      });
  });

  // ✅ 이미지 로딩 후 트리거 갱신
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", () => ScrollTrigger.refresh(), {
        once: true,
      });
      img.addEventListener("error", () => ScrollTrigger.refresh(), {
        once: true,
      });
    }
  });

  // ✅ 폰트 및 리사이즈 옵저버
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(document.body);
  }

  // ✅ prefers-reduced-motion 고려
  ScrollTrigger.matchMedia({
    "(prefers-reduced-motion: reduce)": function () {
      gsap.set("[fade]", { opacity: 1, clearProps: "all" });
      ScrollTrigger.getAll().forEach((st) => st.kill());
    },
  });

  // ✅ 페이지 로드 후 강제 리프레시
  window.addEventListener("load", () => {
    setTimeout(() => ScrollTrigger.refresh(), 300);
  });
});
