---
layout: home
permalink: /
redirect_from:
  - /about/
  - /about.html
---

{% include home-nav.html %}

<main class="home-main">
  <section id="Top" class="home-section home-top-section">
    <div class="bio-layout">
      <div class="bio-main">
        <div class="bio-main-top">
          <picture class="profile-frame">
            <source type="image/webp" srcset="{{ site.baseurl }}/images/avatar-256.webp 256w, {{ site.baseurl }}/images/avatar-512.webp 512w" sizes="120px">
            <img src="{{ site.baseurl }}/images/avatar.png" alt="Jingpeng Yang" class="profile-img" width="512" height="512" decoding="async">
          </picture>
          <div class="bio-intro">
            <p class="bio-text">
              <span class="lang-en">{{ site.data.i18n.intro.en }}</span>
              <span class="lang-zh">{{ site.data.i18n.intro.zh }}</span>
            </p>
          </div>
        </div>
        <div class="bio-rest">
          <p class="bio-text">
            <span class="lang-en">My research interests include computer vision, embodied AI, and agentic systems. I enjoy building practical and playful tools that help intelligent systems perceive, reason, and interact with the world.</span>
            <span class="lang-zh">我的研究兴趣包括计算机视觉、具身智能和智能体系统。我喜欢构建实用又有趣的工具，让智能系统能够感知、推理并与世界交互。</span>
          </p>
          <div class="bio-links" aria-label="Contact links">
            {% if site.author.email %}
            <a class="bio-link bio-link--email" href="mailto:{{ site.author.email }}" aria-label="Email">
              <svg class="bio-link__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              <span class="visually-hidden">Email</span>
            </a>
            {% endif %}
            {% if site.author.github %}
            <a class="bio-link bio-link--github" href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener" aria-label="GitHub">
              <svg class="bio-link__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.758-1.333-1.758-1.089-.745.084-.729.084-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.21 0 1.595-.015 2.88-.015 3.27 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z"/></svg>
              <span class="visually-hidden">GitHub</span>
            </a>
            {% endif %}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="News" class="home-section">
    <span id="news" class="home-anchor-alias" aria-hidden="true"></span>
    <h2><strong><span class="lang-en">News</span><span class="lang-zh">动态</span></strong></h2>
    <div class="news-container">
      {% for item in site.data.i18n.news.items %}
      <div class="news-item">
        <div class="news-date">{{ item.date }}</div>
        <div class="news-content"><span class="lang-en">{{ item.en }}</span><span class="lang-zh">{{ item.zh }}</span></div>
      </div>
      {% endfor %}
    </div>
  </section>

  <section id="Research" class="home-section">
    <span id="publications" class="home-anchor-alias" aria-hidden="true"></span>
    <div class="research-heading">
      <h2><strong><span class="lang-en">Research</span><span class="lang-zh">研究</span></strong></h2>
      <div class="pub-button-container" role="tablist" aria-label="Research views">
        <button class="pub-button active" type="button" role="tab" aria-selected="true" aria-controls="core-publications" data-publication-view="core">
          <span class="lang-en">{{ site.data.i18n.publications.core_button.en }}</span><span class="lang-zh">{{ site.data.i18n.publications.core_button.zh }}</span>
        </button>
        <button class="pub-button" type="button" role="tab" aria-selected="false" aria-controls="full-publications" data-publication-view="list">
          <span class="lang-en">{{ site.data.i18n.publications.full_button.en }}</span><span class="lang-zh">{{ site.data.i18n.publications.full_button.zh }}</span>
        </button>
      </div>
    </div>
    <div id="core-publications" class="publication-view" data-publication-view="core" role="tabpanel" aria-live="polite">
      <p class="research-loading"><span class="lang-en">Loading publications…</span><span class="lang-zh">正在加载论文……</span></p>
    </div>
    <div id="full-publications" class="publication-view" data-publication-view="list" role="tabpanel" aria-live="polite" hidden>
      <p class="research-loading"><span class="lang-en">Loading publications…</span><span class="lang-zh">正在加载论文……</span></p>
    </div>
    <script id="publication-data" type="application/json">{{ site.data.publications | jsonify }}</script>
    <script id="author-links-data" type="application/json">{{ site.data.authors | jsonify }}</script>
  </section>

  <section id="Experiences" class="home-section">
    <span id="experience" class="home-anchor-alias" aria-hidden="true"></span>
    <h2><strong><span class="lang-en">Experiences</span><span class="lang-zh">经历</span></strong></h2>
    <div class="experience-section">
      {% for entry in site.data.i18n.experience.items %}
      <div class="experience-item">
        <div class="exp-period lang-en">{{ entry.period_en }}</div>
        <div class="exp-period lang-zh">{{ entry.period_zh }}</div>
        <div class="exp-main">
          {% assign logo_path = site.baseurl | append: '/' | append: entry.logo %}
          {% assign logo_webp = logo_path | replace: '.png', '.webp' %}
          <picture class="exp-logo-frame"><source type="image/webp" srcset="{{ logo_webp }}"><img src="{{ logo_path }}" class="exp-logo" alt="{{ entry.alt }}" width="56" height="56" loading="lazy" decoding="async"></picture>
          <div class="exp-info">
            <div class="exp-title lang-en"><strong>{{ entry.title_en }}</strong><br><span class="experience-note">{{ entry.details_en }}</span></div>
            <div class="exp-title lang-zh"><strong>{{ entry.title_zh }}</strong><br><span class="experience-note">{{ entry.details_zh }}</span></div>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </section>

  <section id="Awards" class="home-section">
    <span id="awards" class="home-anchor-alias" aria-hidden="true"></span>
    <h2><strong><span class="lang-en">Awards</span><span class="lang-zh">荣誉</span></strong></h2>
    <ul class="awards-list">
      {% for award in site.data.i18n.awards.items %}
      <li><span class="lang-en">{{ award.en }}</span><span class="lang-zh">{{ award.zh }}</span></li>
      {% endfor %}
    </ul>
  </section>

  {% include home-footer.html %}
</main>
