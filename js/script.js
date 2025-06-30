document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 설정 영역 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    // -------------------------------------------------------------------------

    // GitHub 레포지토리 정보를 설정합니다.
    // 이 프로젝트가 업로드될 GitHub 레포지토리의 소유자(owner)와 이름(repo)을 입력하세요.
    const GITHUB_OWNER = 'today-self-study';
    const GITHUB_REPO = 'cursor-llm-study'; 

    // -------------------------------------------------------------------------
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ 설정 영역 ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // -------------------------------------------------------------------------

    const sitesContainer = document.getElementById('sites-container');
    const newIssueLink = document.getElementById('new-issue-link');

    if (!GITHUB_OWNER || !GITHUB_REPO) {
        sitesContainer.innerHTML = `<p>Error: GITHUB_OWNER와 GITHUB_REPO를 설정해주세요.</p>`;
        return;
    }
    
    const issueTemplateURL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new?title=사이트명&body=사이트+소개:+%0A%0A사이트+주소:+`;
    newIssueLink.href = issueTemplateURL;

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

            const siteName = issue.title;
            const { description, url } = parseIssueBody(issue.body);

            if (siteName && description && url) {
                const card = document.createElement('div');
                card.className = 'site-card';

                card.innerHTML = `
                    <h2>${escapeHTML(siteName)}</h2>
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