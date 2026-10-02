---
permalink: /
author_profile: true
stylesheets:
  - /assets/css/home.css
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
<span class="lang-en">Hi there, Welcome to my Homepage. I am currently a postgraduate student in Lab for Multimedia Intelligence (LAMI) at <a class="academic-link" href="https://www.ustc.edu.cn/" target="_blank">University of Science and Technology of China (USTC)</a>. Before that, I received my B.S. degree from <a class="academic-link" href="https://www.nwpu.edu.cn/" target="_blank">Northwestern Polytechnical University (NPU)</a> in 2026.</span><span class="lang-zh">你好，欢迎来到我的个人主页！我目前是<a class="academic-link" href="https://www.ustc.edu.cn/" target="_blank">中国科学技术大学</a>多媒体智能实验室（LAMI）的硕士研究生，此前于 2026 年在<a class="academic-link" href="https://www.nwpu.edu.cn/" target="_blank">西北工业大学</a>获得学士学位。</span>

<h2 id="news"><span class="lang-en">News</span><span class="lang-zh">动态</span></h2>

<div class="news-box" data-reveal>
  <ul class="news-list">

<li><span class="news-date"><em>Sep.2026</em></span> <span class="lang-en">🎉 I am starting my postgraduate studies at USTC.</span><span class="lang-zh">🎉 我在中国科学技术大学开始了研究生阶段的学习。</span></li>
<li><span class="news-date"><em>Jun.2026</em></span> <span class="lang-en">🥹 I've graduated from NPU. These four‑year journey is beyond words.</span><span class="lang-zh">🥹 我从西北工业大学毕业了。这四年的旅程难以言表。</span></li>
  </ul>
</div>

<h2 id="experience"><span class="lang-en">Experience</span><span class="lang-zh">经历</span></h2>

<div class="experience-container" data-reveal-group>

  <div class="experience-card">
      <img src="images/ustc.png" alt="USTC logo" class="experience-logo" width="250" height="250" loading="lazy" decoding="async">
      <div class="experience-info lang-en">
          <strong>University of Science and Technology of China</strong><br>
          <em>Sep.2026 - Present</em><br>
          Postgraduate Student Major in Artificial Intelligence. <br>
          <span class="experience-note">Research interests include Computer Vision and Embodied AI.</span>
      </div>
      <div class="experience-info lang-zh">
          <strong>中国科学技术大学</strong><br>
          <em>2026年9月 - 至今</em><br>
          人工智能专业硕士研究生。<br>
          <span class="experience-note">研究方向包括计算机视觉与具身智能。</span>
      </div>
  </div>

  <div class="experience-card">
      <img src="images/nwpu.png" alt="NPU logo" class="experience-logo" width="250" height="250" loading="lazy" decoding="async">
      <div class="experience-info lang-en">
          <strong>Northwestern Polytechnical University</strong><br>
          <em>Sep.2022 - Jul.2026</em><br>
          B.S. in Electrical Information Engineering<br>
      </div>
      <div class="experience-info lang-zh">
          <strong>西北工业大学</strong><br>
          <em>2022年9月 - 2026年7月</em><br>
          电子信息工程专业，工学学士<br>
      </div>
  </div>
</div>


<h2 id="publications"><span class="lang-en">Publications</span><span class="lang-zh">论文</span></h2>

<div class="pub-button-container" data-reveal-group>
<button class="pub-button active" onclick="filterPublications(event, 'all')"><span class="lang-en">Core Publications</span><span class="lang-zh">核心论文</span></button>
<button class="pub-button" onclick="filterPublications(event, 'list')"><span class="lang-en">Full Publications List</span><span class="lang-zh">全部论文列表</span></button>
</div>

<div id="core-publications" class="publication-view" data-publication-view="core">

<div class="publication-card" data-category="all" data-reveal>
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/sleep.png" alt="wog" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;" loading="lazy" decoding="async">
    </div>
    <div class="lang-en">
      <strong>Coming Soon...</strong><br>
      <i style="font-size: 13px;">
        <strong>Jingpeng Yang</strong>.
      </i><br>
      Coming soon...
      <br>
      <b><i style="color:#83a1c7;">ICLR 3026 &nbsp;
      </i></b>
      <span class="pub-link-placeholder">[arXiv]</span>
      <span class="pub-link-placeholder">[code]</span>
    </div>
    <div class="lang-zh">
      <strong>敬请期待……</strong><br>
      <i style="font-size: 13px;">
        <strong>Jingpeng Yang</strong>。
      </i><br>
      敬请期待……
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
      <span class="pub-list-title lang-en">Coming soon...</span><span class="pub-list-title lang-zh">敬请期待……</span><br>
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
      <span class="pub-list-note lang-en">Oral.</span><span class="pub-list-note lang-zh">口头报告。</span>
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

<h2 id="awards"><span class="lang-en">Awards</span><span class="lang-zh">荣誉</span></h2>

- <span class="lang-en"><em>Sep.2024</em>, Outstanding Student in Academic Performance, School of Electronics and Information, NPU.</span><span class="lang-zh"><em>2024年9月</em>，西北工业大学电子信息学院学业优秀学生。</span>
