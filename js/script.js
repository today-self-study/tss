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
            showEasterEggGame();
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

            const { description, url, developers } = parseIssueBody(issue.body);
            const cardTitle = issue.title;

            // 개발자 정보가 없으면 아무것도 표시하지 않음
            let devList = developers && developers.length > 0 ? developers : [];

            if (cardTitle && description && url) {
                const card = document.createElement('div');
                card.className = 'site-card';

                // 카드 상단(헤더)
                const header = document.createElement('div');
                header.className = 'site-card-header';
                header.innerHTML = `<span class="site-title">${cardTitle}</span>`;
                card.appendChild(header);

                // 카드 본문(설명)
                const desc = document.createElement('div');
                desc.className = 'site-card-desc';
                desc.textContent = description;
                card.appendChild(desc);

                // visit 버튼(오른쪽)
                const visitBtn = document.createElement('a');
                visitBtn.className = 'site-visit-btn';
                visitBtn.href = url;
                visitBtn.target = '_blank';
                visitBtn.rel = 'noopener noreferrer';
                visitBtn.textContent = 'visit →';
                card.appendChild(visitBtn);

                // contributor 정보(왼쪽 하단, 작게)
                if (devList.length > 0) {
                    const devBox = document.createElement('div');
                    devBox.className = 'site-contributors';
                    devBox.innerHTML = devList.map(dev => `
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
        // 개발자: @id1 @id2 ... (줄바꿈 포함)
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

    function escapeHTML(str) {
        if (!str) return '';
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 이스터에그: Octocat 점프 미니게임 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    function showEasterEggGame() {
        sitesContainer.style.display = 'none';
        let gameContainer = document.getElementById('easteregg-container');
        if (!gameContainer) {
            gameContainer = document.createElement('div');
            gameContainer.id = 'easteregg-container';
            document.querySelector('main').appendChild(gameContainer);
        }
        gameContainer.innerHTML = `
            <div class="easteregg-gravity-game">
                <div class="gravity-ball" id="gravityBall"></div>
                <div class="gravity-obstacle" id="gravityObstacle"></div>
                <p class="easteregg-msg">404: Fun found. Press space to jump.</p>
            </div>
        `;
        gameContainer.style.display = 'block';
        startGravityGame();
    }

    function startGravityGame() {
        const ball = document.getElementById('gravityBall');
        const obstacle = document.getElementById('gravityObstacle');
        const gameHeight = 180;
        const ground = 140;
        let ballY = ground;
        let velocity = 0;
        const gravity = 0.7;
        const jumpPower = -11;
        let isJumping = false;
        let isGameOver = false;
        let obstacleX = 320;
        obstacle.style.left = obstacleX + 'px';

        function jump() {
            if (isJumping || isGameOver) return;
            velocity = jumpPower;
            isJumping = true;
        }

        document.onkeydown = function(e) {
            if (e.code === 'Space') jump();
        };
        obstacle.style.display = 'block';

        function gameLoop() {
            if (isGameOver) return;
            // 중력 적용
            velocity += gravity;
            ballY += velocity;
            if (ballY > ground) {
                ballY = ground;
                velocity = 0;
                isJumping = false;
            }
            if (ballY < 10) ballY = 10;
            ball.style.top = ballY + 'px';
            // 장애물 이동
            obstacleX -= 4;
            if (obstacleX < -30) obstacleX = 320 + Math.random() * 60;
            obstacle.style.left = obstacleX + 'px';
            // 충돌 체크
            if (obstacleX < 60 && obstacleX > 20 && ballY > 110) {
                isGameOver = true;
                document.onkeydown = null;
                document.querySelector('.easteregg-msg').innerHTML = 'Game Over! Press F5 to try again.';
                return;
            }
            requestAnimationFrame(gameLoop);
        }
        requestAnimationFrame(gameLoop);
    }

    fetchSites();
}); 