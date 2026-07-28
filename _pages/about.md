---
permalink: /
author_profile: true
stylesheets:
  - /assets/css/home.css
redirect_from: 
  - /about/
  - /about.html
---
Hi there, Welcome to my Homepage. I am currently a postgraduate student in Lab for Multimedia Intelligence (LAMI) at <a class="academic-link" href="https://www.ustc.edu.cn/" target="_blank">University of Science and Technology of China (USTC)</a>. Before that, I received my B.S. degree from <a class="academic-link" href="https://www.nwpu.edu.cn/" target="_blank">Northwestern Polytechnical University (NPU)</a> in 2026.

News
---------------
<div class="news-box">
  <ul class="news-list">

<li><span class="news-date"><em>Sep.2026</em></span> 🎉 Started my postgraduate studies at USTC.</li>
<li><span class="news-date"><em>Jul.2026</em></span> 🥹 Received my bachelor's degree. Thank you, NPU. </li>
  </ul>
</div>

Experience
--------------

<div class="experience-container">

  <div class="experience-card">
      <img src="images/ustc.png" alt="USTC logo" class="experience-logo">
      <div class="experience-info">
          <strong>University of Science and Technology of China</strong><br>
          <em>Sep.2026 - Present</em><br>
          Postgraduate Student Major in Artificial Intelligence. <br>
          <span style="color:#888;">Research interests include Computer Vision and Embodied AI.</span>
      </div>
  </div>

  <div class="experience-card">
      <img src="images/nwpu.png" alt="NPU logo" class="experience-logo">
      <div class="experience-info">
          <strong>Northwestern Polytechnical University</strong><br>
          <em>Sep.2022 - Jul.2026</em><br>
          B.S. in Electrical Information Engineering<br>
      </div>
  </div>
</div>


Publications
--------------
<button class="pub-button active" onclick="filterPublications(event, 'all')">Core Publications</button>
<button class="pub-button" onclick="filterPublications(event, 'list')">Full Publications List</button>

<div id="core-publications" class="publication-view" data-publication-view="core">

<div class="publication-card" data-category="all">
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/sleep.png" alt="wog" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div>
      <strong>Coming Soon...</strong><br>
      <i style="font-size: 13px;">
        <a href="https://wd7ang.github.io" target="_blank">
          <strong>Jingpeng Yang</strong>
        </a>.
      </i><br>
      Coming soon...
      <br>
      <b><i style="color:#83a1c7;">ACL 3026 Oral &nbsp;
      </i></b>
      <a href=""><em>[arXiv]</em></a>
      <a href=""><em>[code]</em></a>
    </div>
  </div>

</div>
</div>

<div id="full-publications" class="publication-view" data-publication-view="list" hidden>
  <ul class="full-publication-list">
    <li>
      <span class="pub-list-badge">ACL 3026</span>
      <span class="pub-list-title">Coming soon...</span><br>
      <span class="pub-list-authors">
        <a href="https://wd7ang.github.io" target="_blank">
          <strong>Jingpeng Yang</strong>
        </a>.
      </span>
      <span class="pub-list-note">Oral.</span>
      <span class="pub-list-links"><a href="">[arXiv]</a><a href="">[code]</a></span>
    </li>
  </ul>
</div>

<script src="assets/js/show_publications.js"></script>
<script src="assets/js/pub_media_rotator.js"></script>

Projects
--------
<div class="project-card" data-category="project"> 
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/2.png" alt="ManiUniCon" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div> 
      <strong>vMiniMind</strong><br>
      <i style="font-size: 13px;">
        <a href="https://wd7ang.github.io" target="_blank"><strong>Me</strong></a>.
      </i><br>
      Coming soon...
      <br> 
      <b><i style="color:#83a1c7;">Project &nbsp;</i></b> 
      <a href=""><em>[code]</em></a> 
    </div>
  </div> 
</div>

Blog
--------
{% assign blog_posts = site.pages | where: "layout", "single" | sort: "date" | reverse %}
{% assign blog_count = 0 %}
{% for post in blog_posts %}
  {% if post.permalink contains "/blog/" and post.permalink != "/blog/" %}
    {% assign blog_count = blog_count | plus: 1 %}
  {% endif %}
{% endfor %}
<div class="blog-grid">
  {% for post in blog_posts limit: 3 %}
    {% if post.permalink contains "/blog/" and post.permalink != "/blog/" %}
      {% assign gradient_colors = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)|linear-gradient(135deg, #f093fb 0%, #f5576c 100%)|linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" %}
      {% assign gradient_list = gradient_colors | split: "|" %}
      {% assign gradient_idx = forloop.index0 | modulo: 3 %}
      <a href="{{ post.permalink }}" class="blog-card">
        <div class="blog-card-image" style="background: {{ gradient_list[gradient_idx] }};">
        </div>
        <div class="blog-card-content">
          <span class="blog-card-date">{{ post.date | date: "%Y-%m-%d" }}</span>
          <h3 class="blog-card-title">{{ post.title }}</h3>
          <p class="blog-card-excerpt">{{ post.content | strip_html | truncatewords: 25 }}</p>
        </div>
      </a>
    {% endif %}
  {% endfor %}
  {% if blog_count < 3 %}
    {% assign fill_needed = 3 | minus: blog_count %}
    {% for i in (1..fill_needed) %}
      {% assign gradient_colors = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)|linear-gradient(135deg, #f093fb 0%, #f5576c 100%)|linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" %}
      {% assign gradient_list = gradient_colors | split: "|" %}
      {% assign gradient_idx = blog_count | plus: i | minus: 1 | modulo: 3 %}
      <a href="/blog/2026/07/21/N-Transformer/" class="blog-card">
        <div class="blog-card-image" style="background: {{ gradient_list[gradient_idx] }};">
        </div>
        <div class="blog-card-content">
          <span class="blog-card-date">2026-07-21</span>
          <h3 class="blog-card-title">From Text to Transformer: A Complete Pipeline from BPE to Language Modeling</h3>
          <p class="blog-card-excerpt">本篇博客受CS336启发，将从最常见的自然语言文本出发，讲解语言模型（Language Model）处理自然语言的完整流程...</p>
        </div>
      </a>
    {% endfor %}
  {% endif %}
</div>

<div class="blog-read-more">
  <a href="/blog/" class="read-more-btn">Read More →</a>
</div>

Awards
--------
- *Sep.2024*, Outstanding Student in Academic Performance, School of Electronics and Information, NPU.
