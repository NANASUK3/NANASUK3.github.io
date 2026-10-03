---
permalink: /
author_profile: true
stylesheets:
  - /assets/css/home.css
  - /assets/css/milk-frog.css
redirect_from: 
  - /about/
  - /about.html
---
<script>
(function () {
  var root = document.documentElement;
  root.classList.add('reveal-armed');
  window.setTimeout(function () {
    if (!window.__revealLoaded) root.classList.remove('reveal-armed');
  }, 2500);
})();
</script>
<p><span class="lang-en">{{ site.data.i18n.intro.en }}</span><span class="lang-zh">{{ site.data.i18n.intro.zh }}</span></p>

<h2 id="news"><span class="lang-en">{{ site.data.i18n.sections.news.en }}</span><span class="lang-zh">{{ site.data.i18n.sections.news.zh }}</span></h2>

<div class="news-box" data-reveal>
  <ul class="news-list">
{% for item in site.data.i18n.news.items %}
<li><span class="news-date"><em>{{ item.date }}</em></span> <span class="lang-en">{{ item.en }}</span><span class="lang-zh">{{ item.zh }}</span></li>
{% endfor %}
  </ul>
</div>

<h2 id="experience"><span class="lang-en">{{ site.data.i18n.sections.experience.en }}</span><span class="lang-zh">{{ site.data.i18n.sections.experience.zh }}</span></h2>

<div class="experience-container" data-reveal-group>
{% for entry in site.data.i18n.experience.items %}
  <div class="experience-card">
      <img src="{{ entry.logo }}" alt="{{ entry.alt }}" class="experience-logo" width="250" height="250" loading="lazy" decoding="async">
      <div class="experience-info lang-en">{{ entry.en }}</div>
      <div class="experience-info lang-zh">{{ entry.zh }}</div>
  </div>
{% endfor %}
</div>

<h2 id="publications"><span class="lang-en">{{ site.data.i18n.sections.publications.en }}</span><span class="lang-zh">{{ site.data.i18n.sections.publications.zh }}</span></h2>

<div class="pub-button-container" data-reveal-group>
<button class="pub-button active" onclick="filterPublications(event, 'all')"><span class="lang-en">{{ site.data.i18n.publications.core_button.en }}</span><span class="lang-zh">{{ site.data.i18n.publications.core_button.zh }}</span></button>
<button class="pub-button" onclick="filterPublications(event, 'list')"><span class="lang-en">{{ site.data.i18n.publications.full_button.en }}</span><span class="lang-zh">{{ site.data.i18n.publications.full_button.zh }}</span></button>
</div>

<div id="core-publications" class="publication-view" data-publication-view="core">

<div class="publication-card" data-category="all" data-reveal>
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/sleep.png" alt="wog" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;" loading="lazy" decoding="async">
    </div>
    <div class="lang-en">
      <strong>{{ site.data.i18n.publications.card_title.en }}</strong><br>
      <i style="font-size: 13px;">
        <strong>Jingpeng Yang</strong>
      </i>.
      <br>
      {{ site.data.i18n.publications.card_desc.en }}
      <br>
      <b><i style="color:#83a1c7;">ICLR 3026 &nbsp;
      </i></b>
      <span class="pub-link-placeholder">[arXiv]</span>
      <span class="pub-link-placeholder">[code]</span>
    </div>
    <div class="lang-zh">
      <strong>{{ site.data.i18n.publications.card_title.zh }}</strong><br>
      <i style="font-size: 13px;">
        <strong>Jingpeng Yang</strong>
      </i>。
      <br>
      {{ site.data.i18n.publications.card_desc.zh }}
      <br>
      <b><i style="color:#83a1c7;">ICLR 3026 &nbsp;
      </i></b>
      <span class="pub-link-placeholder">[arXiv]</span>
      <span class="pub-link-placeholder">[code]</span>
    </div>
  </div>

</div>
</div>

<div id="full-publications" class="publication-view" data-publication-view="list" data-reveal hidden>
  <ul class="full-publication-list">
    <li>
      <span class="pub-list-badge">ACL 3026</span>
      <span class="pub-list-title lang-en">{{ site.data.i18n.publications.card_title.en }}</span><span class="pub-list-title lang-zh">{{ site.data.i18n.publications.card_title.zh }}</span><br>
      <span class="pub-list-authors lang-en">
        <a href="https://wd7ang.github.io" target="_blank">
          <strong>Jingpeng Yang</strong>
        </a>.
      </span>
      <span class="pub-list-authors lang-zh">
        <a href="https://wd7ang.github.io" target="_blank">
          <strong>Jingpeng Yang</strong>
        </a>。
      </span>
      <span class="pub-list-note lang-en">{{ site.data.i18n.publications.list_note.en }}</span><span class="pub-list-note lang-zh">{{ site.data.i18n.publications.list_note.zh }}</span>
      <span class="pub-list-links"><span class="pub-link-placeholder">[arXiv]</span><span class="pub-link-placeholder">[code]</span></span>
    </li>
  </ul>
</div>

<script src="assets/js/show_publications.js"></script>
<script src="assets/js/pub_media_rotator.js"></script>
<script src="assets/js/reveal.js" defer></script>

{% comment %}
Projects
--------
<div class="project-card" data-category="project"> 
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/banner_lightmind.png" alt="lightmind" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div> 
      <strong>lightmind</strong><br>
      <i style="font-size: 13px;">
      </i><br>
      A light weight mini size language model based on Qwen-3 architecture.
      <br> 
      <b><i style="color:#83a1c7;">Project &nbsp;</i></b> 
      <a href="https://github.com/flyflyang/lightmind"><em>[code]</em></a>
    </div>
  </div> 
</div>
{% endcomment %}

<h2 id="awards"><span class="lang-en">{{ site.data.i18n.sections.awards.en }}</span><span class="lang-zh">{{ site.data.i18n.sections.awards.zh }}</span></h2>

{% for award in site.data.i18n.awards.items %}
- <span class="lang-en">{{ award.en }}</span><span class="lang-zh">{{ award.zh }}</span>
{% endfor %}
