document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 설정 영역 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    // -------------------------------------------------------------------------

    // GitHub 레포지토리 정보를 설정합니다.
    // 이 프로젝트가 업로드될 GitHub 레포지토리의 소유자(owner)와 이름(repo)을 입력하세요.
    const GITHUB_OWNER = 'today-self-study';
    const GITHUB_REPO = 'tss'; 

    // -------------------------------------------------------------------------
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ 설정 영역 ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // -------------------------------------------------------------------------

    const sitesContainer = document.getElementById('sites-container');
    const searchInput = document.getElementById('searchInput');
    const developerFilter = document.getElementById('developerFilter');
    const resultCount = document.getElementById('resultCount');
    
    let allIssues = [];
    let allDevelopers = new Set();

    if (!GITHUB_OWNER || !GITHUB_REPO) {
        sitesContainer.innerHTML = `<p>Error: GITHUB_OWNER와 GITHUB_REPO를 설정해주세요.</p>`;
        return;
    }
    
    const apiURL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open`;

    async function fetchSites() {
        try {
            const response = await fetch(apiURL);
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
            }
            const issues = await response.json();
            allIssues = issues.filter(issue => !issue.pull_request);
            
            extractDevelopers();
            populateDeveloperFilter();
            displaySites(allIssues);
            updateResultCount(allIssues.length);
            
        } catch (error) {
            console.error('Error fetching sites:', error);
            sitesContainer.innerHTML = '<p>사이트 목록을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }

    function extractDevelopers() {
        allDevelopers.clear();
        allIssues.forEach(issue => {
            const { developers } = parseIssueBody(issue.body);
            developers.forEach(dev => allDevelopers.add(dev.replace('@', '')));
        });
    }

    function populateDeveloperFilter() {
        developerFilter.innerHTML = '<option value="">모든 개발자</option>';
        [...allDevelopers].sort().forEach(dev => {
            const option = document.createElement('option');
            option.value = dev;
            option.textContent = `@${dev}`;
            developerFilter.appendChild(option);
        });
    }

    function displaySites(issues) {
        if (issues.length === 0) {
            sitesContainer.innerHTML = '<p>조건에 맞는 사이트가 없습니다.</p>';
            return;
        }

        sitesContainer.innerHTML = '';

        issues.forEach(issue => {
            const { description, url, developers } = parseIssueBody(issue.body);
            const cardTitle = issue.title;

            if (cardTitle && description && url) {
                const card = document.createElement('div');
                card.className = 'site-card';

                const header = document.createElement('div');
                header.className = 'site-card-header';
                header.innerHTML = `<span class="site-title">${escapeHTML(cardTitle)}</span>`;
                card.appendChild(header);

                const desc = document.createElement('div');
                desc.className = 'site-card-desc';
                desc.textContent = description;
                card.appendChild(desc);

                const visitBtn = document.createElement('a');
                visitBtn.className = 'site-visit-btn';
                visitBtn.href = url;
                visitBtn.target = '_blank';
                visitBtn.rel = 'noopener noreferrer';
                visitBtn.textContent = 'visit →';
                card.appendChild(visitBtn);

                if (developers.length > 0) {
                    const devBox = document.createElement('div');
                    devBox.className = 'site-contributors';
                    devBox.innerHTML = developers.map(dev => `
                        <a class="github-profile-link" href="https://github.com/${dev.replace('@','')}" target="_blank" rel="noopener noreferrer">
                            <img class="github-profile-img" src="https://github.com/${dev.replace('@','')}.png" alt="${dev}" title="${dev}" />
                        </a>
                    `).join('');
                    card.appendChild(devBox);
                }

                sitesContainer.appendChild(card);
            }
        });
    }

    function parseIssueBody(body) {
        const descriptionMatch = body.match(/사이트 소개:\s*([\s\S]*?)사이트 주소:/);
        const urlMatch = body.match(/사이트 주소:\s*(https?:\/\/[^\s]+)/);
        const devMatch = body.match(/개발자:\s*([@\w\-\s]+)/);

        let developers = [];
        if (devMatch && devMatch[1]) {
            developers = devMatch[1]
                .split(/[\s,]+/)
                .map(s => s.trim())
                .filter(s => s.startsWith('@'))
                .filter(Boolean);
        }

        return {
            description: descriptionMatch ? descriptionMatch[1].trim() : '소개 없음',
            url: urlMatch ? urlMatch[1].trim() : null,
            developers
        };
    }

    function filterSites() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedDeveloper = developerFilter.value;

        const filteredIssues = allIssues.filter(issue => {
            const { description, developers } = parseIssueBody(issue.body);
            const title = issue.title.toLowerCase();
            const desc = description.toLowerCase();

            const matchesSearch = !searchTerm || 
                title.includes(searchTerm) || 
                desc.includes(searchTerm);

            const matchesDeveloper = !selectedDeveloper || 
                developers.some(dev => dev.replace('@', '') === selectedDeveloper);

            return matchesSearch && matchesDeveloper;
        });

        displaySites(filteredIssues);
        updateResultCount(filteredIssues.length);
    }

    function updateResultCount(count) {
        resultCount.textContent = `${count}개 사이트`;
    }

    function escapeHTML(str) {
        if (!str) return '';
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 이스터에그: Octocat 점프 미니게임 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼


    // 이벤트 리스너
    searchInput.addEventListener('input', filterSites);
    developerFilter.addEventListener('change', filterSites);

    fetchSites();
}); 