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
            displaySites(issues);
        } catch (error) {
            console.error('Error fetching sites:', error);
            sitesContainer.innerHTML = `<p>사이트 목록을 불러오는 중 오류가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요.</p>`;
        }
    }

    function displaySites(issues) {
        if (issues.length === 0) {
            sitesContainer.innerHTML = '<p>등록된 사이트가 없습니다. 새 이슈를 등록하여 추가해주세요.</p>';
            return;
        }

        sitesContainer.innerHTML = '';

        issues.forEach(issue => {
            if (issue.pull_request) return; // Pull Request는 목록에서 제외

            const { description, url } = parseIssueBody(issue.body);
            let repoName = '';
            if (url) {
                // 주소에서 repo 이름 추출 (예: https://today-self-study.github.io/Sydra/)
                try {
                    const u = new URL(url);
                    // pathname: /Sydra/ 또는 /repo/
                    const pathParts = u.pathname.split('/').filter(Boolean);
                    repoName = pathParts.length > 0 ? pathParts[0] : '';
                } catch (e) {
                    repoName = '';
                }
            }
            // repoName이 없으면 fallback으로 이슈 title 사용
            const cardTitle = repoName || issue.title;

            if (cardTitle && description && url) {
                const card = document.createElement('div');
                card.className = 'site-card';

                card.innerHTML = `
                    <h2>${escapeHTML(cardTitle)}</h2>
                    <p>${escapeHTML(description)}</p>
                    <a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">사이트 방문하기</a>
                `;
                sitesContainer.appendChild(card);
            }
        });
    }

    function parseIssueBody(body) {
        const descriptionMatch = body.match(/사이트 소개:\s*([\s\S]*?)사이트 주소:/);
        const urlMatch = body.match(/사이트 주소:\s*(https?:\/\/[^\s]+)/);

        return {
            description: descriptionMatch ? descriptionMatch[1].trim() : '소개 없음',
            url: urlMatch ? urlMatch[1].trim() : null
        };
    }

    function escapeHTML(str) {
        if (!str) return '';
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    fetchSites();
}); 