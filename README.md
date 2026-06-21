# ⏳ 대학생 공강 활용 도우미 (Gonggang Helper)

대학생들이 수업 사이에 발생하는 공강 시간을 효율적으로 활용하지 못하는 문제를 해결하기 위해 설계된 **스마트 시간표 관리 및 맞춤형 할 일 추천 시스템**입니다. 

요일별 시간표를 직관적으로 시각화하고 수업 간 빈 시간을 자동 연산한 뒤, 해당 공강 시간 이내에 수행할 수 있는 최적의 할 일(Todo) 목록을 실시간 매칭 추천해 줍니다.

---

## 🎨 주요 기능 (Features)

1. **로컬 인증 및 세션 관리 (Auth & Session)**
   - 브라우저의 로컬 데이터베이스(`localStorage`)를 활용한 회원가입 및 로그인 세션 구현.
   - 외부 서버 없는 100% 로컬 프라이빗 데이터 보존.

2. **주간 시간표 관리 (Weekly Timetable Grid)**
   - 월~금 (09:00 ~ 18:00)의 정밀한 주간 시간표 캘린더 그리드 렌더링.
   - 수업 추가/삭제 기능 및 시간 유효성 검증(시작 시간 < 종료 시간).
   - 동일 요일 내 수업 간 타임라인 중복 방지(충돌 처리) 로직 구현.

3. **공강 시간 자동 계산 알고리즘 (Break Time Calculator)**
   - 선택한 요일의 등록 수업들을 시작 시간 기준으로 정렬 후, 수업 사이에 발생하는 공강 시간(시작/종료/총 분)을 정확하게 추출 및 자동 연산.
   - 연산된 공강 목록을 클릭하여 상세한 여유 시간을 확인 가능.

4. **할 일 관리 (Todo Manager)**
   - 공강 시간에 진행할 공부, 휴식, 취미 활동 등 할 일 등록 및 삭제 기능.
   - 각 할 일별 예상 소요 시간(분 단위) 설정.

5. **그리디 기반 할 일 매칭 추천 (Greedy Matching Recommendation)**
   - 선택한 공강 시간 내에 완료 가능한 할 일 목록만 필터링하여 실시간 매칭.
   - 수행할 일이 없거나 공강 시간보다 소요 시간이 더 오래 걸리는 일만 있을 경우 예외 메시지 출력.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Glassmorphism, Dark-mode, Custom Timetable Flex/Grid)
- **Logic**: Vanilla JavaScript (ES6+, LocalStorage Data Persistence)

---

## 🚀 구동 및 사용 방법 (How to Run)

본 애플리케이션은 서버 백엔드가 필요 없는 **순수 정적 웹 애플리케이션**이므로 빌드 및 설치 과정이 전혀 필요하지 않습니다.

1. 이 저장소를 로컬 컴퓨터에 복사(Clone)합니다:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gonggang-helper.git
   ```
2. 프로젝트 디렉토리로 이동한 후 `index.html` 파일을 더블 클릭하여 기본 웹 브라우저(Chrome, Safari, Edge 등)로 실행합니다:
   - 파일 탐색기에서 직접 실행하거나 브라우저 주소창에 파일 경로를 입력해 주시면 즉시 작동합니다.

---

## 📂 파일 구조 (File Structure)

```text
gonggang-helper/
├── index.html        # 메인 구조 마크업
├── style.css         # UI 스타일시트 및 반응형 그리드
├── app.js            # 시간 연산, 추천 알고리즘 및 인증 로직
├── package.json      # 로컬 dev 서버 스크립트 설정 파일
└── README.md         # 프로젝트 소개 문서
```
