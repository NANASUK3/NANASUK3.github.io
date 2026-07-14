---
layout: archive
permalink: /sitemap/
title: "Sitemap"
author_profile: true
---

{% include base_path %}

A list of all the posts and pages rendered on this site.

* [{{ site.title }}]({{ base_path }}/)
{% for post in site.pages %}
  {% unless post.sitemap == false or post.url contains "non-menu-page" %}
  * [{{ post.title | default: post.url }}]({{ base_path }}{{ post.url }})
  {% endunless %}
{% endfor %}
