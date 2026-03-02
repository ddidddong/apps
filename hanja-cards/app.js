/**
 * Hanja Flashcard App Logic
 */

class HanjaApp {
  constructor() {
    this.hanjaData = [];
    this.filteredData = [];
    this.searchQuery = '';
    this.currentIndex = 0;
    this.currentMode = 'grid'; // grid, study, quiz
    this.autoPlayInterval = null;
    this.isPlaying = false;
    this.autoPlaySpeed = 2000;
    this.score = 0;
    this.writer = null; // HanziWriter instance

    // Removed Auth & Premium State

    this.init();
  }

  init() {
    this.generateData();
    this.setupEventListeners();
    this.updateSpeedDisplay(); // Initialize speed display
    this.initTheme();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) themeToggle.innerText = '☀️';
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeToggle = document.getElementById('theme-toggle');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      if (themeToggle) themeToggle.innerText = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      if (themeToggle) themeToggle.innerText = '☀️';
    }
  }

  // Configuration: Set to true if using Supabase
  // Ensure you set valid SUPABASE_URL and SUPABASE_ANON_KEY below
  get useSupabase() { return false; }

  // Supabase Configuration
  get supabaseConfig() {
    return {
      url: "YOUR_SUPABASE_URL_HERE",
      key: "YOUR_SUPABASE_ANON_KEY_HERE"
    };
  }

  generateData() {
    // If Supabase is enabled and configured, we fetch from it.
    // However, since this was synchronous in the original design and fetch is async,
    // we need to handle the data loading flow.
    // For this simple app refactor, we will check the flag.

    if (this.useSupabase && this.supabaseConfig.url !== "YOUR_SUPABASE_URL_HERE") {
      this.fetchSupabaseData();
      return;
    }

    // Default: Local Generation
    this.generateLocalData();
  }

  async fetchSupabaseData() {
    const { createClient } = window.supabase;
    const supabase = createClient(this.supabaseConfig.url, this.supabaseConfig.key);

    const { data, error } = await supabase
      .from('hanja_cards')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching data:", error);
      alert("데이터를 불러오는 중 오류가 발생했습니다. 로컬 데이터로 전환합니다.");
      this.generateLocalData(); // Fallback
      return;
    }

    if (data && data.length > 0) {
      this.hanjaData = data;
      this.updateUIAfterDataLoad();
    } else {
      this.generateLocalData(); // Fallback if empty
    }
  }

  generateLocalData() {
    // 한국어문회 4급 한자 1000자 (출처: 한자사전, 나무위키 배정한자)
    const baseHanjaList = typeof HANJA_4GRADE_1000 !== 'undefined' ? HANJA_4GRADE_1000 : [
      { h: "暇", m: "틈", s: "가" }, { h: "刻", m: "새길", s: "각" }, { h: "覺", m: "깨달을", s: "각" }, { h: "簡", m: "대쪽", s: "간" }, { h: "看", m: "볼", s: "간" }, { h: "干", m: "방패", s: "간" }, { h: "甘", m: "달", s: "감" }, { h: "敢", m: "감히", s: "감" }, { h: "甲", m: "갑옷", s: "갑" }, { h: "降", m: "내릴", s: "강" },
      { h: "拒", m: "막을", s: "거" }, { h: "居", m: "살", s: "거" }, { h: "據", m: "근거", s: "거" }, { h: "巨", m: "클", s: "거" }, { h: "傑", m: "뛰어날", s: "걸" }, { h: "儉", m: "검소할", s: "검" }, { h: "擊", m: "칠", s: "격" }, { h: "激", m: "격할", s: "격" }, { h: "堅", m: "굳을", s: "견" }, { h: "犬", m: "개", s: "견" },
      { h: "驚", m: "놀랄", s: "경" }, { h: "更", m: "고칠", s: "경" }, { h: "傾", m: "기울", s: "경" }, { h: "鏡", m: "거울", s: "경" }, { h: "階", m: "섬돌", s: "계" }, { h: "鷄", m: "닭", s: "계" }, { h: "季", m: "계절", s: "계" }, { h: "系", m: "이어맬", s: "계" }, { h: "繼", m: "이을", s: "계" }, { h: "戒", m: "경계할", s: "계" },
      { h: "孤", m: "외로울", s: "고" }, { h: "庫", m: "곳집", s: "고" }, { h: "穀", m: "곡식", s: "곡" }, { h: "困", m: "곤할", s: "곤" }, { h: "骨", m: "뼈", s: "골" }, { h: "孔", m: "구멍", s: "공" }, { h: "攻", m: "칠", s: "공" }, { h: "管", m: "대롱", s: "관" }, { h: "鑛", m: "쇳돌", s: "광" }, { h: "構", m: "얽을", s: "구" },
      { h: "君", m: "임금", s: "군" }, { h: "群", m: "무리", s: "군" }, { h: "屈", m: "굽힐", s: "굴" }, { h: "窮", m: "궁할", s: "궁" }, { h: "券", m: "문서", s: "권" }, { h: "勸", m: "권할", s: "권" }, { h: "卷", m: "책", s: "권" }, { h: "歸", m: "돌아갈", s: "귀" }, { h: "均", m: "고를", s: "균" }, { h: "劇", m: "심할", s: "극" },
      { h: "勤", m: "부지런할", s: "근" }, { h: "筋", m: "힘줄", s: "근" }, { h: "機", m: "틀", s: "기" }, { h: "寄", m: "부칠", s: "기" }, { h: "奇", m: "기특할", s: "기" }, { h: "紀", m: "벼리", s: "기" },
      { h: "納", m: "들일", s: "납" },
      { h: "段", m: "층계", s: "단" }, { h: "徒", m: "무리", s: "도" }, { h: "盜", m: "도둑", s: "도" }, { h: "逃", m: "도망할", s: "도" },
      { h: "亂", m: "어지러울", s: "란" }, { h: "卵", m: "알", s: "란" }, { h: "覽", m: "볼", s: "람" }, { h: "略", m: "간략할", s: "략" }, { h: "糧", m: "양식", s: "량" }, { h: "慮", m: "생각할", s: "려" }, { h: "烈", m: "매울", s: "렬" }, { h: "龍", m: "용", s: "룡" }, { h: "柳", m: "버들", s: "류" }, { h: "輪", m: "바퀴", s: "륜" }, { h: "離", m: "떠날", s: "리" },
      { h: "妹", m: "누이", s: "매" }, { h: "勉", m: "힘쓸", s: "면" }, { h: "鳴", m: "울", s: "명" }, { h: "模", m: "본뜰", s: "모" }, { h: "墓", m: "무덤", s: "묘" }, { h: "妙", m: "묘할", s: "묘" }, { h: "舞", m: "춤출", s: "무" },
      { h: "拍", m: "칠", s: "박" }, { h: "髮", m: "터럭", s: "발" }, { h: "妨", m: "방해할", s: "방" }, { h: "犯", m: "범할", s: "범" }, { h: "範", m: "법", s: "범" }, { h: "辯", m: "말씀", s: "변" }, { h: "普", m: "넓을", s: "보" }, { h: "伏", m: "엎드릴", s: "복" }, { h: "複", m: "겹칠", s: "복" }, { h: "否", m: "아닐", s: "부" },
      { h: "負", m: "질", s: "부" }, { h: "粉", m: "가루", s: "분" }, { h: "憤", m: "분할", s: "분" }, { h: "批", m: "비평할", s: "비" }, { h: "祕", m: "숨길", s: "비" }, { h: "碑", m: "비석", s: "비" },
      { h: "辭", m: "말씀", s: "사" }, { h: "私", m: "사사", s: "사" }, { h: "絲", m: "실", s: "사" }, { h: "射", m: "쏠", s: "사" }, { h: "散", m: "흩을", s: "산" }, { h: "傷", m: "다칠", s: "상" }, { h: "象", m: "코끼리", s: "상" }, { h: "宣", m: "베풀", s: "선" }, { h: "舌", m: "혀", s: "설" }, { h: "屬", m: "붙일", s: "속" },
      { h: "損", m: "덜", s: "손" }, { h: "頌", m: "기릴", s: "송" }, { h: "松", m: "소나무", s: "송" }, { h: "秀", m: "빼어날", s: "수" }, { h: "叔", m: "아재비", s: "숙" }, { h: "肅", m: "엄숙할", s: "숙" }, { h: "崇", m: "높을", s: "숭" },
      { h: "氏", m: "성씨", s: "씨" },
      { h: "額", m: "이마", s: "액" }, { h: "樣", m: "모양", s: "양" }, { h: "嚴", m: "엄할", s: "엄" }, { h: "與", m: "줄", s: "여" }, { h: "域", m: "지경", s: "역" }, { h: "易", m: "바꿀", s: "역" }, { h: "燃", m: "탈", s: "연" }, { h: "鉛", m: "납", s: "연" }, { h: "緣", m: "인연", s: "연" }, { h: "延", m: "늘일", s: "연" },
      { h: "迎", m: "맞을", s: "영" }, { h: "映", m: "비칠", s: "영" }, { h: "營", m: "경영할", s: "영" }, { h: "豫", m: "미리", s: "예" }, { h: "優", m: "넉넉할", s: "우" }, { h: "遇", m: "만날", s: "우" }, { h: "郵", m: "우편", s: "우" }, { h: "怨", m: "원망할", s: "원" }, { h: "援", m: "도울", s: "원" }, { h: "源", m: "근원", s: "원" },
      { h: "圍", m: "에워쌀", s: "위" }, { h: "委", m: "맡길", s: "위" }, { h: "威", m: "위엄", s: "위" }, { h: "慰", m: "위로할", s: "위" }, { h: "危", m: "위태할", s: "위" }, { h: "遊", m: "놀", s: "유" }, { h: "乳", m: "젖", s: "유" }, { h: "儒", m: "선비", s: "유" }, { h: "遺", m: "남길", s: "유" }, { h: "隱", m: "숨을", s: "은" },
      { h: "依", m: "의지할", s: "의" }, { h: "儀", m: "거동", s: "의" }, { h: "疑", m: "의심할", s: "의" }, { h: "異", m: "다를", s: "이" }, { h: "仁", m: "어질", s: "인" },
      { h: "資", m: "재물", s: "자" }, { h: "姿", m: "모양", s: "자" }, { h: "姉", m: "손윗누이", s: "자" }, { h: "殘", m: "남을", s: "잔" }, { h: "雜", m: "섞일", s: "잡" }, { h: "獎", m: "장려할", s: "장" }, { h: "裝", m: "꾸밀", s: "장" }, { h: "腸", m: "창자", s: "장" }, { h: "張", m: "베풀", s: "장" }, { h: "壯", m: "장할", s: "장" },
      { h: "帳", m: "장막", s: "장" }, { h: "底", m: "밑", s: "저" }, { h: "積", m: "쌓을", s: "적" }, { h: "籍", m: "문서", s: "적" }, { h: "適", m: "맞을", s: "적" }, { h: "績", m: "길쌈", s: "적" }, { h: "賊", m: "도둑", s: "적" }, { h: "專", m: "오로지", s: "전" }, { h: "轉", m: "구를", s: "전" }, { h: "錢", m: "돈", s: "전" },
      { h: "折", m: "꺾을", s: "절" }, { h: "點", m: "점", s: "점" }, { h: "占", m: "점칠", s: "점" }, { h: "靜", m: "고요할", s: "정" }, { h: "丁", m: "장정", s: "정" }, { h: "整", m: "가지런할", s: "정" }, { h: "帝", m: "임금", s: "제" }, { h: "條", m: "가지", s: "조" }, { h: "潮", m: "조수", s: "조" }, { h: "組", m: "짤", s: "조" },
      { h: "存", m: "있을", s: "존" }, { h: "鍾", m: "쇠북", s: "종" }, { h: "從", m: "좇을", s: "종" }, { h: "座", m: "자리", s: "좌" }, { h: "酒", m: "술", s: "주" }, { h: "朱", m: "붉을", s: "주" }, { h: "周", m: "두루", s: "주" }, { h: "證", m: "증거", s: "증" }, { h: "持", m: "가질", s: "지" }, { h: "智", m: "지혜", s: "지" },
      { h: "誌", m: "기록할", s: "지" }, { h: "織", m: "짤", s: "직" }, { h: "珍", m: "보배", s: "진" }, { h: "盡", m: "다할", s: "진" }, { h: "陣", m: "진칠", s: "진" },
      { h: "差", m: "다를", s: "차" }, { h: "讚", m: "기릴", s: "찬" }, { h: "採", m: "캘", s: "채" }, { h: "冊", m: "책", s: "책" }, { h: "泉", m: "샘", s: "천" }, { h: "聽", m: "들을", s: "청" }, { h: "廳", m: "관청", s: "청" }, { h: "招", m: "부를", s: "초" }, { h: "推", m: "밀", s: "추" }, { h: "縮", m: "줄일", s: "축" },
      { h: "就", m: "나아갈", s: "취" }, { h: "趣", m: "뜻", s: "취" }, { h: "層", m: "층", s: "층" }, { h: "寢", m: "잘", s: "침" }, { h: "針", m: "바늘", s: "침" }, { h: "稱", m: "일컬을", s: "칭" },
      { h: "歎", m: "탄식할", s: "탄" }, { h: "彈", m: "탄알", s: "탄" }, { h: "脫", m: "벗을", s: "탈" }, { h: "探", m: "찾을", s: "탐" }, { h: "擇", m: "가릴", s: "택" }, { h: "討", m: "칠", s: "토" }, { h: "痛", m: "아플", s: "통" }, { h: "投", m: "던질", s: "투" }, { h: "鬪", m: "싸움", s: "투" },
      { h: "派", m: "갈래", s: "파" }, { h: "判", m: "판단할", s: "판" }, { h: "篇", m: "책", s: "편" }, { h: "評", m: "평할", s: "평" }, { h: "閉", m: "닫을", s: "폐" }, { h: "胞", m: "세포", s: "포" }, { h: "爆", m: "불터질", s: "폭" }, { h: "標", m: "표할", s: "표" }, { h: "疲", m: "피곤할", s: "피" }, { h: "避", m: "피할", s: "피" },
      { h: "閑", m: "한가할", s: "한" }, { h: "恨", m: "한", s: "한" }, { h: "抗", m: "겨룰", s: "항" }, { h: "核", m: "씨", s: "핵" }, { h: "憲", m: "법", s: "헌" }, { h: "險", m: "험할", s: "험" }, { h: "革", m: "가죽", s: "혁" }, { h: "顯", m: "나타날", s: "현" }, { h: "刑", m: "형벌", s: "형" }, { h: "或", m: "혹", s: "혹" },
      { h: "婚", m: "혼인할", s: "혼" }, { h: "混", m: "섞일", s: "혼" }, { h: "紅", m: "붉을", s: "홍" }, { h: "華", m: "빛날", s: "화" }, { h: "歡", m: "기쁠", s: "환" }, { h: "環", m: "고리", s: "환" }, { h: "況", m: "상황", s: "황" }, { h: "灰", m: "재", s: "회" }, { h: "厚", m: "두터울", s: "후" }, { h: "候", m: "기후", s: "후" }, { h: "揮", m: "휘두를", s: "휘" }, { h: "喜", m: "기쁠", s: "희" },
    ];

    this.hanjaData = baseHanjaList.map((item) => ({
      h: item.h,
      m: item.m,
      s: item.s
    }));

    this.applySearchFilter();
    this.updateUIAfterDataLoad();
  }

  applySearchFilter() {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) {
      this.filteredData = this.hanjaData.map((item, idx) => ({ ...item, _idx: idx }));
      return;
    }
    this.filteredData = this.hanjaData
      .map((item, idx) => ({ ...item, _idx: idx }))
      .filter((item) =>
        item.h.includes(q) || (item.m && item.m.includes(q)) || (item.s && item.s.includes(q))
      );
  }

  updateUIAfterDataLoad() {
    const totalEl = document.getElementById('total-count');
    const filteredEl = document.getElementById('filtered-count');
    if (totalEl) totalEl.innerText = this.hanjaData.length;
    if (filteredEl) filteredEl.innerText = this.filteredData.length;
    document.getElementById('total-num').innerText = this.hanjaData.length;

    this.renderGrid();
  }

  setupEventListeners() {
    // Navigation handling handled by inline onclicks in HTML calling app.changeMode

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.currentMode === 'study') {
        if (e.key === 'ArrowRight') this.nextCard();
        if (e.key === 'ArrowLeft') this.prevCard();
        if (e.key === 'Space') this.flipCard();
      }
    });

    // Speed control slider
    const speedRange = document.getElementById('speed-range');
    speedRange.addEventListener('input', (e) => {
      this.autoPlaySpeed = parseInt(e.target.value);
      this.updateSpeedDisplay();
      if (this.isPlaying) {
        this.stopAutoPlay();
        this.startAutoPlay();
      }
    });

    const searchInput = document.getElementById('hanja-search');
    const clearSearchBtn = document.getElementById('clear-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applySearchFilter();
        this.updateUIAfterDataLoad();

        if (clearSearchBtn) {
          if (this.searchQuery.length > 0) {
            clearSearchBtn.classList.remove('hidden');
          } else {
            clearSearchBtn.classList.add('hidden');
          }
        }
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        this.applySearchFilter();
        this.updateUIAfterDataLoad();
        clearSearchBtn.classList.add('hidden');
        if (searchInput) searchInput.focus();
      });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  }

  updateSpeedDisplay() {
    const speedInSec = this.autoPlaySpeed / 1000;
    document.getElementById('speed-display').innerText = `${speedInSec}초`;
  }

  changeMode(mode) {
    this.currentMode = mode;
    this.stopAutoPlay(); // Stop autoplay when switching modes
    if (window.Analytics) window.Analytics.recordMenuChange(mode);

    // Update Nav UI
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${mode}`).classList.add('active');

    // Update View
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
      view.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${mode}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      // Force reflow for animation
      void targetView.offsetWidth;
      targetView.classList.add('active');
    }

    if (mode === 'grid') {
      // Grid is already rendered, just show it
      // Optional: Scroll to current index
      document.getElementById('speed-control-panel').classList.add('hidden');
    } else if (mode === 'study') {
      this.updateStudyCard();
      // Show speed control
      document.getElementById('speed-control-panel').classList.remove('hidden');
    } else if (mode === 'write') {
      document.getElementById('speed-control-panel').classList.add('hidden');
      this.updateWriteView();
    } else if (mode === 'quiz') {
      document.getElementById('speed-control-panel').classList.add('hidden');
      this.startQuiz();
    }
  }

  // --- Write Mode ---
  updateWriteView() {
    if (this.demoLoopTimeout) clearTimeout(this.demoLoopTimeout);

    const successMsg = document.getElementById('write-success-msg');
    if (successMsg) successMsg.classList.add('hidden');
    // Navigation controls are now always visible in write mode

    const item = this.hanjaData[this.currentIndex];
    const writeInfo = document.getElementById('write-info');
    if (writeInfo) writeInfo.innerText = `${item.h} (${item.m} ${item.s})`;

    const writeCurr = document.getElementById('write-curr');
    if (writeCurr) writeCurr.innerText = this.currentIndex + 1;

    const writeTotal = document.getElementById('write-total');
    if (writeTotal) writeTotal.innerText = this.hanjaData.length;

    const demoID = 'hanzi-demo-target';
    const quizID = 'hanzi-quiz-target';

    if (typeof HanziWriter !== 'undefined') {
      const demoTarget = document.getElementById(demoID);
      const quizTarget = document.getElementById(quizID);
      const demoWidth = demoTarget.offsetWidth || 120;
      const demoHeight = demoTarget.offsetHeight || 120;
      const quizWidth = quizTarget.offsetWidth || 260;
      const quizHeight = quizTarget.offsetHeight || 260;

      if (!this.writerDemo) {
        this.writerDemo = HanziWriter.create(demoID, item.h, {
          width: demoWidth,
          height: demoHeight,
          padding: demoWidth * 0.08,
          strokeAnimationSpeed: 1.0,
          delayBetweenStrokes: 250,
          showCharacter: false,
          outlineColor: 'rgba(203, 213, 225, 0.3)',
          strokeColor: '#334155',
          radicalColor: '#ec4899'
        });

        // Ensure SVG scales properly by setting viewBox and 100% dimensions
        const demoSvg = demoTarget.querySelector('svg');
        if (demoSvg) {
          demoSvg.setAttribute('viewBox', `0 0 ${demoWidth} ${demoHeight}`);
          demoSvg.style.width = '100%';
          demoSvg.style.height = '100%';
        }
      }

      if (!this.writerQuiz) {
        this.writerQuiz = HanziWriter.create(quizID, item.h, {
          width: quizWidth,
          height: quizHeight,
          padding: quizWidth * 0.06,
          strokeAnimationSpeed: 1.5,
          delayBetweenStrokes: 150,
          showOutline: true,
          showCharacter: false,
          outlineColor: 'rgba(203, 213, 225, 0.3)',
          strokeColor: '#334155',
          drawingWidth: Math.max(10, quizWidth * 0.1),
          leniency: 2.0, // High leniency but not extreme
          showHintAfterMisses: 1, // Show the correct stroke immediately after one mistake
          acceptBackwardsStrokes: true // Allow drawing backwards
        });

        // Ensure SVG scales properly by setting viewBox and 100% dimensions
        const quizSvg = quizTarget.querySelector('svg');
        if (quizSvg) {
          quizSvg.setAttribute('viewBox', `0 0 ${quizWidth} ${quizHeight}`);
          quizSvg.style.width = '100%';
          quizSvg.style.height = '100%';
        }
      }

      // Re-use existing instances
      if (this.writerDemo) {
        this.writerDemo.hideCharacter();
        this.writerDemo.setCharacter(item.h);
      }

      if (this.writerQuiz) {
        document.getElementById(quizID).style.pointerEvents = 'auto'; // Reset pointer events
        this.writerQuiz.cancelQuiz();
        this.writerQuiz.hideCharacter();
        this.writerQuiz.setCharacter(item.h);
      }

      // Automatically start animation loop and quiz
      setTimeout(() => {
        if (this.writerDemo) this.animateStrokes();
        if (this.writerQuiz) this.writerQuiz.quiz({
          onComplete: (summaryData) => {
            try {
              this.playCorrectSound();

              // Forcefully drop the touch/drag event by synthesizing a mouseup/touchend
              document.dispatchEvent(new Event('touchend', { bubbles: true }));
              document.dispatchEvent(new Event('mouseup', { bubbles: true }));
              document.getElementById(quizID).style.pointerEvents = 'none';

              if (successMsg) successMsg.classList.remove('hidden');

              setTimeout(() => {
                try { if (this.writerQuiz) this.writerQuiz.cancelQuiz(); } catch (e) { }
              }, 100);
            } catch (err) {
              console.error(err);
              if (successMsg) successMsg.classList.remove('hidden');
            }
          }
        });
      }, 300);
    }
  }

  animateStrokes() {
    if (this.writerDemo) {
      if (this.demoLoopTimeout) clearTimeout(this.demoLoopTimeout);
      this.writerDemo.animateCharacter({
        onComplete: () => {
          this.demoLoopTimeout = setTimeout(() => {
            this.animateStrokes();
          }, 1500); // Wait 1.5 seconds before repeating
        }
      });
    }
  }

  quizStrokes() {
    const successMsg = document.getElementById('write-success-msg');
    if (successMsg) successMsg.classList.add('hidden');

    const quizID = 'hanzi-quiz-target';
    document.getElementById(quizID).style.pointerEvents = 'auto'; // Reset pointer events

    if (this.writerQuiz) {
      this.writerQuiz.quiz({
        onComplete: (summaryData) => {
          try {
            this.playCorrectSound();

            // Forcefully drop the touch/drag event by synthesizing a mouseup/touchend
            document.dispatchEvent(new Event('touchend', { bubbles: true }));
            document.dispatchEvent(new Event('mouseup', { bubbles: true }));
            document.getElementById(quizID).style.pointerEvents = 'none';

            if (successMsg) successMsg.classList.remove('hidden');

            setTimeout(() => {
              try { if (this.writerQuiz) this.writerQuiz.cancelQuiz(); } catch (e) { }
            }, 100);
          } catch (err) {
            console.error(err);
            if (successMsg) successMsg.classList.remove('hidden');
          }
        }
      });
    }
  }

  clearStrokes() {
    if (this.writerDemo) {
      this.writerDemo.hideCharacter();
      this.writerDemo.showOutline();
    }
  }

  nextWriteCard() {
    this.currentIndex = (this.currentIndex + 1) % this.hanjaData.length;
    this.updateWriteView();
  }

  prevWriteCard() {
    this.currentIndex = (this.currentIndex - 1 + this.hanjaData.length) % this.hanjaData.length;
    this.updateWriteView();
  }

  // --- Grid View ---
  renderGrid() {
    const container = document.getElementById('grid-list');
    /* 
       Performance Optimization: 1000 items might be heavy if all rendered constantly.
       For a simple app, rendering 1000 DOM nodes is usually fine on modern browsers.
       If laggy, we would implement virtual scrolling. 
       For now, we render all.
    */
    const html = this.filteredData.map((item) => `
      <div class="grid-item" onclick="app.goToStudy(${item._idx})">
        <span class="g-hanja">${item.h}</span>
        <span class="g-info">${item.m} ${item.s}</span>
      </div>
    `).join('');
    container.innerHTML = html;
  }

  goToStudy(index) {
    this.currentIndex = index;
    this.changeMode('study');
  }

  // --- Study Mode ---
  updateStudyCard() {
    const item = this.hanjaData[this.currentIndex];
    const card = document.getElementById('main-card');

    // Reset flip state
    card.classList.remove('is-flipped');

    // Small timeout to allow flip reset before changing content if it was flipped
    // Also gives a sense of "loading" a new card
    setTimeout(() => {
      document.getElementById('study-hanja').innerText = item.h;

      // --- Back Card Updates ---
      document.getElementById('study-info-back').innerText = `${item.m} ${item.s}`;
      document.getElementById('study-hanja-back').innerText = item.h;
      const cbCenter = document.querySelector('.card-back .cb-center');
      if (cbCenter) {
        // 전체 원본 배열에서 이 한자의 고유 번호(1~1000)를 찾습니다.
        const originalIndex = this.hanjaData.findIndex(d => d.h === item.h) + 1;

        // 사용자 요청 파일명 예: "1-한일.png"
        const filename = `${originalIndex}-${item.m}${item.s}.png`;
        const localUrl = `imgs/${encodeURIComponent(filename)}`;

        // 배경 이미지를 전체 카드가 아닌 cb-center 하단 영역에만 적용합니다.
        cbCenter.style.backgroundImage = `url('${localUrl}')`;
        cbCenter.style.backgroundSize = 'contain';
        cbCenter.style.backgroundPosition = 'center';
        cbCenter.style.backgroundRepeat = 'no-repeat';
      }

      document.getElementById('curr-num').innerText = this.currentIndex + 1;
    }, 150);
  }

  flipCard() {
    const card = document.getElementById('main-card');
    card.classList.toggle('is-flipped');

    if (window.Analytics && card.classList.contains('is-flipped')) {
      const item = this.hanjaData[this.currentIndex];
      window.Analytics.recordHanjaView(item.h, 'flip');
    }
  }

  nextCard() {
    if (this.currentIndex < this.hanjaData.length - 1) {
      this.currentIndex++;
      this.updateStudyCard();
    } else {
      // Loop back to start or stop? Let's loop for continuous flow
      this.currentIndex = 0;
      this.updateStudyCard();
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateStudyCard();
    }
  }

  toggleAutoPlay() {
    if (this.isPlaying) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isPlaying = true;
    const btn = document.getElementById('btn-play');
    btn.innerHTML = "❚❚ 정지";
    btn.classList.add('playing');

    this.autoPlayInterval = setInterval(() => {
      this.nextCard();
      // Optional: Briefly flip the card before moving? 
      // Requirement says "rapidly show cards", usually implies front only for recognition training
      // or front then back then next. 
      // Let's keep it simple: Show Front -> Wait -> Next. 
      // User can manually flip if they want to pause.
    }, this.autoPlaySpeed);
  }

  stopAutoPlay() {
    this.isPlaying = false;
    const btn = document.getElementById('btn-play');
    btn.innerHTML = "▶ 자동재생";
    btn.classList.remove('playing');
    clearInterval(this.autoPlayInterval);
  }

  // --- Quiz Mode ---
  startQuiz() {
    // Clear previous feedback
    document.getElementById('quiz-feedback').innerText = "";
    document.querySelector('.next-quiz-btn').classList.remove('show');

    const correctIndex = Math.floor(Math.random() * this.hanjaData.length);
    const correctItem = this.hanjaData[correctIndex];
    this.currentQuizAnswer = correctItem;

    document.getElementById('quiz-q').innerText = correctItem.h;

    // Generate distractors
    let options = [correctItem];
    while (options.length < 4) {
      const randomIdx = Math.floor(Math.random() * this.hanjaData.length);
      const randomItem = this.hanjaData[randomIdx];
      if (!options.includes(randomItem)) {
        options.push(randomItem);
      }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    const optionsHtml = options.map(opt => `
        <button onclick="app.checkAnswer('${opt.s}', '${opt.m}')">
            ${opt.m} ${opt.s}
        </button>
      `).join('');

    document.getElementById('quiz-options').innerHTML = optionsHtml;
  }

  checkAnswer(sound, meaning) {
    // Resume audio context on user interaction if needed (browser policy)
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    } else if (!this.audioCtx) {
      this.initAudio();
    }

    if (document.querySelector('.next-quiz-btn').classList.contains('show')) return; // Prevent multiple clicks

    const feedback = document.getElementById('quiz-feedback');
    const isCorrect = (sound === this.currentQuizAnswer.s && meaning === this.currentQuizAnswer.m);



    if (isCorrect) {
      if (window.Analytics) window.Analytics.trackEvent('quiz_answer', { hanja: this.currentQuizAnswer.h, correct: true });
      this.playCorrectSound();
      this.score += 10;

      if (this.score === 100) {
        feedback.innerText = "와우! 100점 달성! 정말 대단해요! 🎉";
        feedback.style.color = "#6c5ce7"; // Celebration color
        this.triggerConfetti();
      } else if (this.score > 100) {
        feedback.innerText = `대단해요! ${this.score}점 돌파! 🔥`;
        feedback.style.color = "#6c5ce7";
      } else {
        feedback.innerText = "딩동댕! 정답입니다! ⭕";
        feedback.style.color = "#00b894";
      }
    } else {
      this.playWrongSound();
      feedback.innerText = `땡! 정답은 [${this.currentQuizAnswer.m} ${this.currentQuizAnswer.s}] 입니다 ❌`;
      feedback.style.color = "#d63031";
    }

    document.getElementById('score').innerText = this.score;

    const nextBtn = document.querySelector('.next-quiz-btn');
    if (this.score >= 100) {
      nextBtn.innerHTML = "더 풀기 &rarr;";
    } else {
      nextBtn.innerHTML = "다음 문제 &rarr;";
    }
    nextBtn.classList.add('show');
  }

  triggerConfetti() {
    // Firework-like effect using canvas-confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }

  // Audio Logic: Simple Synthesis so no external files needed
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playCorrectSound() {
    const now = this.audioCtx.currentTime;

    // Create Oscillators (Ding-Dong-Dang: C5 - E5 - G5)
    // C5 (523.25), E5 (659.25), G5 (783.99)
    this.playTone(523.25, 'sine', now, 0.1);
    this.playTone(659.25, 'sine', now + 0.1, 0.1);
    this.playTone(783.99, 'sine', now + 0.2, 0.4);
  }

  playWrongSound() {
    const now = this.audioCtx.currentTime;
    // 예능 프로그램의 '땡!' 하는 실로폰/부저 소리 (불협화음)
    this.playTone(400, 'triangle', now, 0.4);
    this.playTone(430, 'triangle', now, 0.4);
    this.playTone(470, 'triangle', now, 0.4);
  }

  playTone(freq, type, startTime, duration, isSlide = false) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.type = type;
    if (isSlide) {
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.linearRampToValueAtTime(freq - 50, startTime + duration);
    } else {
      osc.frequency.setValueAtTime(freq, startTime);
    }

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}
// Initialize App
const app = new HanjaApp();
