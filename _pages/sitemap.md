---
layout: home
permalink: /sitemap/
title: "Sitemap"
sitemap: false
---

{% include home-nav.html %}

<main class="home-main site-page-main">
  <section class="home-section site-page-section sitemap-page" aria-labelledby="sitemap-title">
    <h1 id="sitemap-title"><span class="lang-en">Sitemap</span><span class="lang-zh">网站地图</span></h1>
    <p class="site-page-intro"><span class="lang-en">A list of all the pages on this site.</span><span class="lang-zh">本站所有页面。</span></p>
    <ul class="sitemap-list">
      <li><a href="{{ site.baseurl }}/"><span class="lang-en">Home</span><span class="lang-zh">首页</span></a></li>
      {% for post in site.pages %}
        {% unless post.sitemap == false or post.url contains "non-menu-page" or post.url == "/" or post.url == "/sitemap/" %}
        <li><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title | default: post.url }}</a></li>
        {% endunless %}
      {% endfor %}
    </ul>
  </section>
</main>

{% include home-footer.html %}
