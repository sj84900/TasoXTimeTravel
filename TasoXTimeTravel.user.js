// ==UserScript==
// @name         TasoXTimeTravel
// @namespace    https://github.com/sj84900/TasoXTimeTravel
// @version      1.0.2
// @description  검색 날짜 1일 단위 이동 버튼 및 @amanekanatach 6년 전 오늘 트윗 바로가기 버튼
// @author       Abren
// @match        https://x.com/*
// @downloadURL  https://raw.githubusercontent.com/sj84900/TasoXTimeTravel/main/TasoXTimeTravel.user.js
// @updateURL    https://raw.githubusercontent.com/sj84900/TasoXTimeTravel/main/TasoXTimeTravel.user.js
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    const SKY_BLUE = '#1da1f2';
    const BORDER_COLOR = '#cfd9de';

    const getFormattedDate = (date) => date.toISOString().slice(0, 10);
    const shiftDate = (dateStr, offset) => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + offset);
        return getFormattedDate(d);
    };

    // 주소창 이동 대신 X 내부 검색 로직을 트리거하는 함수
    const fastSearch = (query) => {
        // 검색 페이지 URL 구조로 이동하되, 브라우저 캐시와 SPA 라우팅을 활용
        const searchUrl = `/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
        window.history.pushState({}, '', searchUrl);
        // 고유의 네비게이션 이벤트를 발생시키거나 popstate를 트리거하여 내부 로더 작동
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    function createMainButton() {
        const oldCont = document.getElementById('taso-time-travel-container');
        if (oldCont) oldCont.remove();

        const container = document.createElement('div');
        container.id = 'taso-time-travel-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '150px', right: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER_COLOR}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)', zIndex: '999999', minHeight: '56px'
        });

        const isSearchPage = window.location.pathname === '/search';
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (isSearchPage && query && query.includes('since:')) {
            const sinceMatch = query.match(/since:(\d{4}-\d{2}-\d{2})/);
            const untilMatch = query.match(/until:(\d{4}-\d{2}-\d{2})/);
            if (sinceMatch && untilMatch) {
                const since = sinceMatch[1], until = untilMatch[1];
                container.style.width = '110px';
                const makeArrow = (dir, off) => {
                    const btn = document.createElement('button');
                    const path = dir === 'left' ? "M30,15 L10,25 L30,35 Z" : "M15,15 L35,25 L15,35 Z";
                    btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 50 50"><path d="${path}" fill="${SKY_BLUE}"/></svg>`;
                    Object.assign(btn.style, { display:'flex', alignItems:'center', justifyContent:'center', width:'48px', height:'48px', borderRadius:'12px', border:'none', background:'transparent', cursor:'pointer' });
                    btn.onclick = () => {
                        const newQuery = query.replace(`since:${since}`, `since:${shiftDate(since, off)}`).replace(`until:${until}`, `until:${shiftDate(until, off)}`);
                        fastSearch(newQuery); // 내부 라우팅 사용
                    };
                    return btn;
                };
                container.appendChild(makeArrow('left', -1));
                container.appendChild(makeArrow('right', 1));
                document.body.appendChild(container);
            }
        }
        else if (!isSearchPage) {
            container.style.width = '56px';
            const searchBtn = document.createElement('button');
            searchBtn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${SKY_BLUE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
            Object.assign(searchBtn.style, { display:'flex', alignItems:'center', justifyContent:'center', width:'48px', height:'48px', borderRadius:'12px', border:'none', background:'transparent', cursor:'pointer' });
            searchBtn.onclick = () => {
                const today = new Date();
                const sixY = new Date(); sixY.setFullYear(today.getFullYear() - 6);
                const sixYUntil = new Date(sixY); sixYUntil.setDate(sixY.getDate() + 1);
                const newQuery = `from:@amanekanatach since:${getFormattedDate(sixY)} until:${getFormattedDate(sixYUntil)}`;
                fastSearch(newQuery); // 내부 라우팅 사용
            };
            container.appendChild(searchBtn);
            document.body.appendChild(container);
        }
    }

    createMainButton();
    // X의 내부 페이지 전환 감지 최적화
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(createMainButton, 300);
        }
    }).observe(document, {subtree: true, childList: true});
})();
