// ==UserScript==
// @name         TasoXTimeTravel
// @namespace    https://github.com/sj84900/TasoXTimeTravel
// @version      2026-01-04
// @description  X Grok 버튼 스타일을 반영한 날짜 이동 인터페이스
// @author       Abren
// @match        https://x.com/*
// @downloadURL  https://raw.githubusercontent.com/sj84900/TasoXTimeTravel/main/TasoXTimeTravel.user.js
// @updateURL    https://raw.githubusercontent.com/sj84900/TasoXTimeTravel/main/TasoXTimeTravel.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const SKY_BLUE = '#1da1f2';
    const BORDER_COLOR = '#cfd9de'; // 보내주신 요소의 스타일을 반영한 진한 외곽선

    const getFormattedDate = (date) => date.toISOString().slice(0, 10);
    const shiftDate = (dateStr, offset) => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + offset);
        return getFormattedDate(d);
    };

    function createMainButton() {
        const oldCont = document.getElementById('taso-time-travel-container');
        if (oldCont) oldCont.remove();

        const container = document.createElement('div');
        container.id = 'taso-time-travel-container';

        // 보내주신 HTML의 class 속성들을 분석하여 반영한 컨테이너 스타일
        Object.assign(container.style, {
            position: 'fixed', bottom: '150px', right: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff',
            borderRadius: '16px', // r-1upvrn0 등 사각형 스타일 반영
            border: `1px solid ${BORDER_COLOR}`, // r-rs99b7 외곽선 반영
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            zIndex: '999999',
            minHeight: '56px',
            overflow: 'hidden' // r-1udh08x 반영
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
                container.style.padding = '0 4px';

                const makeArrow = (dir, off) => {
                    const btn = document.createElement('button');
                    const path = dir === 'left' ? "M30,15 L10,25 L30,35 Z" : "M15,15 L35,25 L15,35 Z";
                    // 버튼 내부 아이콘 중앙 정렬 (flex 이용)
                    btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 50 50"><path d="${path}" fill="${SKY_BLUE}"/></svg>`;
                    Object.assign(btn.style, {
                        display:'flex', alignItems:'center', justifyContent:'center',
                        width:'48px', height:'48px', borderRadius:'12px', border:'none',
                        background:'transparent', cursor:'pointer', transition: 'background 0.2s'
                    });
                    // 호버 효과 추가 (r-o7ynqc 스타일 유사 구현)
                    btn.onmouseover = () => btn.style.background = 'rgba(29, 161, 242, 0.1)';
                    btn.onmouseout = () => btn.style.background = 'transparent';

                    btn.onclick = () => {
                        const newQuery = query.replace(`since:${since}`, `since:${shiftDate(since, off)}`).replace(`until:${until}`, `until:${shiftDate(until, off)}`);
                        window.location.href = `/search?q=${encodeURIComponent(newQuery)}&src=typed_query&f=live`;
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
            Object.assign(searchBtn.style, {
                display:'flex', alignItems:'center', justifyContent:'center',
                width:'48px', height:'48px', borderRadius:'12px', border:'none',
                background:'transparent', cursor:'pointer', transition: 'background 0.2s'
            });
            searchBtn.onmouseover = () => searchBtn.style.background = 'rgba(29, 161, 242, 0.1)';
            searchBtn.onmouseout = () => searchBtn.style.background = 'transparent';

            searchBtn.onclick = () => {
                const today = new Date();
                const sixY = new Date(); sixY.setFullYear(today.getFullYear() - 6);
                const sixYUntil = new Date(sixY); sixYUntil.setDate(sixY.getDate() + 1);
                const newQuery = `from:@amanekanatach since:${getFormattedDate(sixY)} until:${getFormattedDate(sixYUntil)}`;
                window.location.href = `/search?q=${encodeURIComponent(newQuery)}&src=typed_query&f=live`;
            };
            container.appendChild(searchBtn);
            document.body.appendChild(container);
        }
    }

    createMainButton();
    window.addEventListener('popstate', createMainButton);
    document.addEventListener('click', () => { setTimeout(createMainButton, 500); });
})();
