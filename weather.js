/* ===== 날씨 정보 (Open-Meteo, API 키 필요 없음) ===== */
(function () {
    "use strict";

    var widget = document.getElementById("weather-widget");
    if (!widget) return;

    var fxEl = document.getElementById("weather-fx");
    var inputEl = document.getElementById("weather-input");
    var searchBtn = document.getElementById("weather-search");
    var placeEl = document.getElementById("weather-place");
    var iconEl = document.getElementById("weather-icon");
    var tempEl = document.getElementById("weather-temp");
    var descEl = document.getElementById("weather-desc");
    var feelEl = document.getElementById("weather-feel");
    var humEl = document.getElementById("weather-hum");
    var windEl = document.getElementById("weather-wind");
    var msgEl = document.getElementById("weather-msg");

    /* 미리 등록한 지역. names는 공백을 뺀 이름으로 비교해요. */
    var PRESETS = [
        { names: ["천안", "천안시", "cheonan"], label: "천안", lat: 36.8151, lon: 127.1139 },
        // ※ 수신면 좌표는 대략적인 값이에요. 정확한 좌표로 바꾸려면 lat, lon을 수정하세요.
        { names: ["천안수신면", "천안시수신면", "수신면", "충남천안수신면"], label: "천안 수신면", lat: 36.7396, lon: 127.2960 },
        { names: ["서울", "서울시", "seoul"], label: "서울", lat: 37.5665, lon: 126.9780 },
        { names: ["인천", "인천시", "incheon"], label: "인천", lat: 37.4563, lon: 126.7052 },
        { names: ["대전", "대전시", "daejeon"], label: "대전", lat: 36.3504, lon: 127.3845 },
        { names: ["대구", "대구시", "daegu"], label: "대구", lat: 35.8714, lon: 128.6014 },
        { names: ["광주", "광주시"], label: "광주", lat: 35.1595, lon: 126.8526 },
        { names: ["부산", "부산시", "busan"], label: "부산", lat: 35.1796, lon: 129.0756 },
        { names: ["제주", "제주도", "jeju"], label: "제주", lat: 33.4996, lon: 126.5312 }
    ];

    var STORAGE_KEY = "weatherPlace";
    var currentPlace = PRESETS[0];
    var requestId = 0;

    /* WMO 날씨 코드 -> 설명, 아이콘, 배경 종류 */
    function describe(code, isDay) {
        var day = !!isDay;
        switch (code) {
            case 0:  return { text: "맑음", icon: day ? "☀️" : "🌙", cond: "clear" };
            case 1:  return { text: "대체로 맑음", icon: day ? "🌤️" : "🌙", cond: "clear" };
            case 2:  return { text: "구름 조금", icon: day ? "⛅" : "☁️", cond: "partly" };
            case 3:  return { text: "흐림", icon: "☁️", cond: "cloudy" };
            case 45:
            case 48: return { text: "안개", icon: "🌫️", cond: "fog" };
            case 51:
            case 53:
            case 55: return { text: "이슬비", icon: "🌦️", cond: "rain" };
            case 56:
            case 57: return { text: "어는 이슬비", icon: "🌧️", cond: "rain" };
            case 61: return { text: "약한 비", icon: "🌧️", cond: "rain" };
            case 63: return { text: "비", icon: "🌧️", cond: "rain" };
            case 65: return { text: "강한 비", icon: "🌧️", cond: "rain" };
            case 66:
            case 67: return { text: "어는 비", icon: "🌧️", cond: "rain" };
            case 71: return { text: "약한 눈", icon: "🌨️", cond: "snow" };
            case 73: return { text: "눈", icon: "🌨️", cond: "snow" };
            case 75: return { text: "강한 눈", icon: "❄️", cond: "snow" };
            case 77: return { text: "싸락눈", icon: "❄️", cond: "snow" };
            case 80:
            case 81: return { text: "소나기", icon: "🌦️", cond: "rain" };
            case 82: return { text: "강한 소나기", icon: "🌧️", cond: "rain" };
            case 85:
            case 86: return { text: "소낙눈", icon: "🌨️", cond: "snow" };
            case 95: return { text: "천둥번개", icon: "⛈️", cond: "storm" };
            case 96:
            case 99: return { text: "우박 동반 천둥번개", icon: "⛈️", cond: "storm" };
            default: return { text: "날씨 정보 없음", icon: "🌡️", cond: "partly" };
        }
    }

    /* 비 / 눈 입자 만들기 */
    function setParticles(cond) {
        fxEl.innerHTML = "";

        var type = null;
        var count = 0;

        if (cond === "rain")  { type = "drop";  count = 16; }
        if (cond === "storm") { type = "drop";  count = 22; }
        if (cond === "snow")  { type = "flake"; count = 20; }

        if (!type) return;

        for (var i = 0; i < count; i++) {
            var span = document.createElement("span");
            span.className = type;
            span.style.left = Math.random() * 100 + "%";
            span.style.animationDelay = (-Math.random() * 3).toFixed(2) + "s";

            if (type === "drop") {
                span.style.animationDuration = (0.7 + Math.random() * 0.5).toFixed(2) + "s";
            } else {
                span.style.animationDuration = (3 + Math.random() * 3).toFixed(2) + "s";
                var size = 3 + Math.random() * 4;
                span.style.width = span.style.height = size.toFixed(1) + "px";
            }

            fxEl.appendChild(span);
        }
    }

    function setMessage(text) {
        msgEl.textContent = text || "";
    }

    function render(place, current) {
        var info = describe(current.weather_code, current.is_day);

        widget.setAttribute("data-cond", info.cond);
        widget.setAttribute("data-night", current.is_day ? "0" : "1");
        setParticles(info.cond);

        placeEl.textContent = "📍 " + place.label;
        iconEl.textContent = info.icon;
        tempEl.textContent = Math.round(current.temperature_2m) + "°";
        descEl.textContent = info.text;
        feelEl.textContent = Math.round(current.apparent_temperature) + "°";
        humEl.textContent = Math.round(current.relative_humidity_2m) + "%";
        windEl.textContent = Number(current.wind_speed_10m).toFixed(1) + "m/s";
        setMessage("");
    }

    function loadWeather(place) {
        var myId = ++requestId;
        currentPlace = place;
        placeEl.textContent = "📍 " + place.label;
        setMessage("불러오는 중...");

        var url = "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + place.lat +
            "&longitude=" + place.lon +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day" +
            "&wind_speed_unit=ms&timezone=auto";

        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                if (myId !== requestId) return;      // 오래된 요청은 무시
                if (!data || !data.current) throw new Error("no data");
                render(place, data.current);
            })
            .catch(function () {
                if (myId !== requestId) return;
                setMessage("날씨를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.");
            });
    }

    function normalize(text) {
        return String(text).toLowerCase().replace(/\s+/g, "");
    }

    function findPreset(query) {
        var key = normalize(query);
        for (var i = 0; i < PRESETS.length; i++) {
            if (PRESETS[i].names.indexOf(key) !== -1) return PRESETS[i];
        }
        return null;
    }

    function savePlace(place) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
        } catch (e) { /* 저장 실패는 무시 */ }
    }

    function searchPlace() {
        var query = inputEl.value.trim();
        if (!query) {
            setMessage("도시 이름을 입력해 주세요.");
            return;
        }

        var preset = findPreset(query);
        if (preset) {
            savePlace(preset);
            loadWeather(preset);
            return;
        }

        var myId = ++requestId;
        setMessage("검색 중...");

        var url = "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(query) + "&count=1&language=ko&format=json";

        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                if (myId !== requestId) return;

                if (!data || !data.results || data.results.length === 0) {
                    setMessage("'" + query + "'을(를) 찾지 못했어요. 도시 이름으로 검색해 보세요.");
                    return;
                }

                var r = data.results[0];
                var label = r.name + (r.admin1 && r.admin1 !== r.name ? ", " + r.admin1 : "");
                var place = { label: label, lat: r.latitude, lon: r.longitude };

                savePlace(place);
                loadWeather(place);
            })
            .catch(function () {
                if (myId !== requestId) return;
                setMessage("검색에 실패했어요. 잠시 뒤 다시 시도해 주세요.");
            });
    }

    searchBtn.addEventListener("click", searchPlace);
    inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") searchPlace();
    });

    /* 시작: 저장된 지역이 있으면 그곳, 없으면 천안 */
    var startPlace = PRESETS[0];
    try {
        var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved.lat === "number" && typeof saved.lon === "number" && saved.label) {
            startPlace = saved;
        }
    } catch (e) { /* 무시 */ }

    loadWeather(startPlace);

    /* 10분마다 자동 새로고침 */
    setInterval(function () {
        loadWeather(currentPlace);
    }, 10 * 60 * 1000);
})();
